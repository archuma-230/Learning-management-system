import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const { data } = await api.get('/enrollments/my');
        setEnrollments(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMyCourses();
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-secondary font-weight-bold">My Courses</h2>
      <Row>
        {enrollments.length === 0 && <p>You have not enrolled in any courses yet.</p>}
        {enrollments.map(enr => (
          <Col md={4} key={enr._id} className="mb-4">
            <Card className="h-100 shadow-sm border-0 rounded-3">
              {enr.course?.thumbnail && (
                <Card.Img variant="top" src={enr.course.thumbnail.startsWith('http') ? enr.course.thumbnail : `http://localhost:5000${enr.course.thumbnail}`} style={{ height: '200px', objectFit: 'cover' }} />
              )}
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-primary">{enr.course?.title}</Card.Title>
         
                <div className="mb-3">
                  <small>Progress: {enr.progress?.length || 0} Lectures Completed</small>
                </div>
                <div className="mt-auto">
                  <Button variant="primary" className="w-100" onClick={() => navigate(`/student/course/${enr.course._id}`)}>
                    Continue Learning
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default MyCourses;
