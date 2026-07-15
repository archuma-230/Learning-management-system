import React, { useState, useEffect } from 'react';
import { Container, Row, Col, ListGroup, Button, Badge, Form } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const getEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('watch?v=', 'embed/');
  }
  if (url.includes('youtu.be/')) {
    return url.replace('youtu.be/', 'youtube.com/embed/');
  }
  return url;
};

const CourseView = () => {
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFeedback, setQuizFeedback] = useState({});

  useEffect(() => {
    // Reset state when lecture changes
    setVideoEnded(false);
    setQuizAnswers({});
    setQuizFeedback({});
  }, [currentLecture]);

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      try {
        const cRes = await api.get(`/courses/${courseId}`);
        setCourseData(cRes.data);
        if (cRes.data.lectures && cRes.data.lectures.length > 0) {
          setCurrentLecture(cRes.data.lectures[0]);
        }

        const eRes = await api.get('/enrollments/my');
        const enr = eRes.data.find(e => e.course._id === courseId);
        setEnrollment(enr);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourseAndProgress();
  }, [courseId]);

  const markComplete = async () => {
    if (!enrollment || !currentLecture) return;
    try {
      const { data } = await api.patch(`/enrollments/${enrollment._id}/progress`, {
        lectureId: currentLecture._id
      });
      setEnrollment(data);
    } catch (err) {
      console.error(err);
    }
  };

  const isCompleted = (lectureId) => {
    return enrollment?.progress?.includes(lectureId);
  };

  const handleQuizSubmit = (quizIndex, questionIndex) => {
    const selected = quizAnswers[`${quizIndex}-${questionIndex}`];
    const correct = currentLecture.quiz[quizIndex].correctOption;
    if (selected === correct) {
      setQuizFeedback(prev => ({...prev, [`${quizIndex}-${questionIndex}`]: { text: 'Correct! 🎉', type: 'success' }}));
    } else {
      setQuizFeedback(prev => ({...prev, [`${quizIndex}-${questionIndex}`]: { text: 'Incorrect, try again.', type: 'error', shake: Date.now() }}));
    }
  };

  if (!courseData) return <Container className="mt-5"><p>Loading...</p></Container>;

  return (
    <Container fluid className="mt-4 px-4 main-content">
      <Row>
        <Col md={8}>
          <h2 className="mb-3">{courseData.course.title}</h2>
          {currentLecture ? (
            <div className="bg-white p-4 shadow-sm rounded-3">
              <h4 className="mb-3">{currentLecture.title}</h4>
              {currentLecture.videoUrl && (
                <div className="ratio ratio-16x9 mb-4 bg-dark">
                  {currentLecture.videoUrl.startsWith('/uploads/') ? (
                    <video 
                      controls 
                      onEnded={() => setVideoEnded(true)} 
                      onTimeUpdate={(e) => {
                        if (e.target.duration && (e.target.currentTime / e.target.duration > 0.95)) {
                          setVideoEnded(true);
                        }
                      }}
                      src={`http://localhost:5000${currentLecture.videoUrl}`} 
                    />
                  ) : (
                    // IFrames don't easily fire onEnded across domains without specific API setup. For this demo, we'll auto-enable if it's an iframe to avoid being stuck.
                    <iframe src={getEmbedUrl(currentLecture.videoUrl)} title="Video" allowFullScreen onLoad={() => setVideoEnded(true)} />
                  )}
                </div>
              )}
              <div className="content mb-4" style={{ whiteSpace: 'pre-wrap' }}>
                {currentLecture.content}
              </div>

              {currentLecture.quiz && currentLecture.quiz.length > 0 && (
                <div className="quiz-section mt-4 mb-4 p-3 border rounded bg-light">
                  <h5 className="mb-3">Lecture Quiz</h5>
                  {currentLecture.quiz.map((q, qIndex) => (
                    <div key={qIndex} className="mb-4">
                      <p className="fw-bold">{q.question}</p>
                      {q.options.map((opt, oIndex) => (
                        <Form.Check 
                          key={oIndex}
                          type="radio"
                          id={`quiz-${qIndex}-opt-${oIndex}`}
                          label={opt}
                          name={`quiz-${qIndex}`}
                          onChange={() => setQuizAnswers(prev => ({...prev, [`${qIndex}-${qIndex}`]: oIndex}))}
                        />
                      ))}
                      <Button size="sm" className="mt-2" variant="outline-primary" onClick={() => handleQuizSubmit(qIndex, qIndex)}>
                        Check Answer
                      </Button>
                      {quizFeedback[`${qIndex}-${qIndex}`] && (
                        <span key={quizFeedback[`${qIndex}-${qIndex}`].shake || 'success'} className={`ms-3 fw-bold ${quizFeedback[`${qIndex}-${qIndex}`].type === 'success' ? 'text-success' : 'text-danger shake d-inline-block'}`}>
                          {quizFeedback[`${qIndex}-${qIndex}`].text}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Button 
                variant={isCompleted(currentLecture._id) ? "secondary" : "success"}
                disabled={isCompleted(currentLecture._id) || (!videoEnded && !!currentLecture.videoUrl)}
                onClick={markComplete}
                className={!isCompleted(currentLecture._id) && (videoEnded || !currentLecture.videoUrl) ? 'pulse-btn' : ''}
              >
                {isCompleted(currentLecture._id) ? "Completed" : "Mark as Complete"}
              </Button>
            </div>
          ) : (
            <p>No lectures available for this course.</p>
          )}
        </Col>
        <Col md={4}>
          <div className="bg-white p-3 shadow-sm rounded-3">
            <h5 className="mb-3">Course Content</h5>
            <ListGroup variant="flush">
              {courseData.lectures.map((lecture, index) => (
                <ListGroup.Item 
                  key={lecture._id} 
                  action 
                  active={currentLecture?._id === lecture._id}
                  onClick={() => setCurrentLecture(lecture)}
                  className="d-flex justify-content-between align-items-center rounded-2 mb-1"
                >
                  <span>{index + 1}. {lecture.title}</span>
                  {isCompleted(lecture._id) && <Badge bg="success" pill>Done</Badge>}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CourseView;
