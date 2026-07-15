import React, { useState, useEffect, useContext } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const TutorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await api.get('/courses');
        if (user) {
          const myCourses = data.filter(c => c.tutor._id === user._id || c.tutor === user._id);
          setCourses(myCourses);
        } else {
          setCourses(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/courses/${id}`);
        setCourses(courses.filter(c => c._id !== id));
      } catch (err) {
        alert('Failed to delete');
      }
    }
  };

  return (
    <Container className="mt-4 main-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-secondary font-weight-bold">My Courses (Tutor)</h2>
        <Button variant="primary" onClick={() => navigate('/tutor/create-course')}>+ Create New Course</Button>
      </div>
      <Table striped bordered hover responsive className="bg-white shadow-sm rounded-3 overflow-hidden">
        <thead className="bg-light">
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course._id}>
              <td>{course.title}</td>
              <td>{course.category}</td>
              <td>
                <Button variant="info" size="sm" className="me-2" onClick={() => navigate(`/tutor/course/${course._id}/manage`)}>Manage Content</Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(course._id)}>Delete</Button>
              </td>
            </tr>
          ))}
          {courses.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center py-4 text-muted">No courses found. Start creating!</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default TutorDashboard;
