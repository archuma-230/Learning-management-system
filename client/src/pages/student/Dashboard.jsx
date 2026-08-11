import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api, { API_URL } from '../../services/api';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/courses');
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

 const handleEnroll = async (courseId) => {
  try {
    const { data } = await api.post('/payments/create-order', { courseId });

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: 'Your LMS',
      description: data.courseName,
      order_id: data.orderId,
      handler: async (response) => {
        try {
          await api.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            courseId
          });
          navigate('/student/my-courses');
        } catch (err) {
          alert(err.response?.data?.message || 'Payment verification failed');
        }
      },
      theme: { color: '#6366f1' }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error('Payment Error:', err);
    alert(err.response?.data?.message || err.message || 'Error starting payment');
  }
};
  return (
    <Container className="mt-4 main-content">
      <h2 className="mb-4 text-secondary font-weight-bold">Available Courses</h2>
      <Row>
        {courses.map(course => (
          <Col md={4} key={course._id} className="mb-4">
            <Card className="h-100 shadow-sm border-0 rounded-3 card-hover">
              {course.thumbnail && (
                <Card.Img variant="top" src={course.thumbnail.startsWith('http') ? course.thumbnail : `${API_URL}${course.thumbnail}`} style={{ height: '200px', objectFit: 'cover' }} />
              )}
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-primary">{course.title}</Card.Title>
                <Card.Text className="text-muted text-truncate">{course.description}</Card.Text>
               
                <div className="mt-auto">
                  <Button variant="success" className="w-100" onClick={() => handleEnroll(course._id)}>
                    Enroll Now
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

export default StudentDashboard;
