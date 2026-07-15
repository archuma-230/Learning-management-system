import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import StudentDashboard from './pages/student/Dashboard';
import MyCourses from './pages/student/MyCourses';
import CourseView from './pages/student/CourseView';
import Certificates from './pages/student/Certificates';
import TutorDashboard from './pages/tutor/Dashboard';
import CreateCourse from './pages/tutor/CreateCourse';
import ManageCourse from './pages/tutor/ManageCourse';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100 bg-light">
          <AppNavbar />
          <div className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={
                <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>
              } />
              <Route path="/student/my-courses" element={
                <ProtectedRoute role="student"><MyCourses /></ProtectedRoute>
              } />
              <Route path="/student/course/:courseId" element={
                <ProtectedRoute role="student"><CourseView /></ProtectedRoute>
              } />
              <Route path="/student/certificates" element={
                <ProtectedRoute role="student"><Certificates /></ProtectedRoute>
              } />

              {/* Tutor Routes */}
              <Route path="/tutor/dashboard" element={
                <ProtectedRoute role="tutor"><TutorDashboard /></ProtectedRoute>
              } />
              <Route path="/tutor/create-course" element={
                <ProtectedRoute role="tutor"><CreateCourse /></ProtectedRoute>
              } />
              <Route path="/tutor/course/:courseId/manage" element={
                <ProtectedRoute role="tutor"><ManageCourse /></ProtectedRoute>
              } />
            </Routes>
          </div>
          <footer className="mt-auto border-top" style={{ backgroundColor: '#f8f9fa', color: '#6c757d', fontFamily: 'Georgia, serif', fontSize: '0.85rem' }}>
            <Container className="py-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <div className="text-center text-md-start">
                  <i className="bi bi-c-circle me-1"></i> 2026 Muthu &middot; All rights reserved
                </div>
                <div className="d-flex flex-column flex-md-row gap-3 text-center text-md-end">
                  <a href="tel:+919790205056" className="text-decoration-none text-muted nav-link d-inline-block px-2" aria-label="Call +91 9790205056">
                    <i className="bi bi-telephone-fill me-2"></i> +91 97902 05056
                  </a>
                  <a href="mailto:muthuarchana397@gmail.com" className="text-decoration-none text-muted nav-link d-inline-block px-2" aria-label="Email muthuarchana397@gmail.com">
                    <i className="bi bi-envelope-fill me-2"></i> muthuarchana397@gmail.com
                  </a>
                </div>
              </div>
            </Container>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
