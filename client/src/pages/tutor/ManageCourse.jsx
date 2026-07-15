import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, ListGroup, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ManageCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  
  // New Lecture Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState(1);
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');

  // Quiz State
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState('');
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(0);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      const { data } = await api.get(`/courses/${courseId}`);
      setCourse(data.course);
      setLectures(data.lectures);
      setOrder(data.lectures.length + 1);
    } catch (err) {
      console.error(err);
      alert('Error fetching course details');
    }
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('order', order);
    
    // Process YouTube URL to embed format if necessary
    let processedUrl = videoUrl;
    if (processedUrl.includes('youtube.com/watch?v=')) {
      processedUrl = processedUrl.replace('watch?v=', 'embed/');
      const ampersandIndex = processedUrl.indexOf('&');
      if (ampersandIndex !== -1) {
        processedUrl = processedUrl.substring(0, ampersandIndex);
      }
    } else if (processedUrl.includes('youtu.be/')) {
      processedUrl = processedUrl.replace('youtu.be/', 'www.youtube.com/embed/');
    }

    if (processedUrl) formData.append('videoUrl', processedUrl);
    if (video) formData.append('video', video);

    if (quizQuestion && quizOptions) {
      const optionsArray = quizOptions.split(',').map(o => o.trim());
      const quiz = [{
        question: quizQuestion,
        options: optionsArray,
        correctOption: parseInt(quizCorrectIndex)
      }];
      formData.append('quiz', JSON.stringify(quiz));
    }

    try {
      await api.post(`/courses/${courseId}/lectures`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Lecture added successfully!');
      setTitle('');
      setContent('');
      setVideo(null);
      setVideoUrl('');
      setQuizQuestion('');
      setQuizOptions('');
      setQuizCorrectIndex(0);
      fetchCourseDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding lecture');
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    if(window.confirm('Are you sure you want to delete this lecture?')) {
      try {
        await api.delete(`/lectures/${lectureId}`);
        fetchCourseDetails();
      } catch (err) {
        alert('Failed to delete lecture');
      }
    }
  };

  if (!course) return <Container className="mt-5"><p>Loading...</p></Container>;

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-secondary font-weight-bold">Manage Course: {course.title}</h2>
        <Button variant="outline-primary" onClick={() => navigate('/tutor/dashboard')}>Back to Dashboard</Button>
      </div>

      <div className="row">
        {/* Left Column: Add Lecture Form */}
        <div className="col-md-6 mb-4">
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-4">
              <h4 className="mb-4">Add New Lecture</h4>
              <Form onSubmit={handleAddLecture}>
                <Form.Group className="mb-3">
                  <Form.Label>Lecture Title</Form.Label>
                  <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Text Content / Description</Form.Label>
                  <Form.Control as="textarea" rows={4} value={content} onChange={(e) => setContent(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Lecture Order (Sequence)</Form.Label>
                  <Form.Control type="number" min="1" value={order} onChange={(e) => setOrder(e.target.value)} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>YouTube Video Link (Optional)</Form.Label>
                  <Form.Control type="url" placeholder="https://youtube.com/watch?v=..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} disabled={!!video} />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>OR Upload Video File (Optional)</Form.Label>
                  <Form.Control type="file" accept="video/*" onChange={(e) => setVideo(e.target.files[0])} disabled={!!videoUrl} />
                </Form.Group>

                <hr/>
                <h5 className="mb-3">Quiz (Optional)</h5>
                <Form.Group className="mb-3">
                  <Form.Label>Question</Form.Label>
                  <Form.Control type="text" value={quizQuestion} onChange={(e) => setQuizQuestion(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Options (comma separated)</Form.Label>
                  <Form.Control type="text" placeholder="Option 1, Option 2, Option 3" value={quizOptions} onChange={(e) => setQuizOptions(e.target.value)} />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Correct Option Index (0-based)</Form.Label>
                  <Form.Control type="number" min="0" value={quizCorrectIndex} onChange={(e) => setQuizCorrectIndex(e.target.value)} />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100">
                  Save Lecture
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>

        {/* Right Column: Existing Lectures */}
        <div className="col-md-6">
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-4">
              <h4 className="mb-4">Existing Lectures</h4>
              {lectures.length === 0 ? (
                <p className="text-muted">No lectures added yet.</p>
              ) : (
                <ListGroup variant="flush">
                  {lectures.map(lecture => (
                    <ListGroup.Item key={lecture._id} className="d-flex justify-content-between align-items-start py-3">
                      <div className="ms-2 me-auto">
                        <div className="fw-bold">{lecture.order}. {lecture.title}</div>
                        {lecture.videoUrl && <Badge bg="info" className="mt-1">Video Attached</Badge>}
                      </div>
                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteLecture(lecture._id)}>
                        Delete
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ManageCourse;
