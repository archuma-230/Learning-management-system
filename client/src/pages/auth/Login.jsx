import React, { useState, useContext } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', { email, password });
      login(res.data, res.data.token);
      if (res.data.role === 'tutor') {
        navigate('/tutor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center mt-5">
      <Card style={{ width: '400px' }} className="shadow-lg border-0 rounded-4">
        <Card.Body className="p-5">
          <h2 className="text-center mb-4 font-weight-bold" style={{ color: '#2c3e50' }}>Welcome Back</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mb-3" style={{ background: '#3498db', border: 'none' }}>
              Login
            </Button>
          </Form>
          <div className="text-center mt-3">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register" style={{ color: '#3498db' }}>Register here</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
