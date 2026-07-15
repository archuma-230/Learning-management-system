import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';

const AppNavbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className={`sticky-top mb-4 ${scrolled ? 'scrolled' : ''}`} style={{ transition: 'all 0.3s ease' }}>
      <Container>
        <Navbar.Brand as={Link} to="/">MuthuVerse</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {user?.role === 'student' && (
              <>
                <Nav.Link as={Link} to="/student/dashboard">Courses</Nav.Link>
                <Nav.Link as={Link} to="/student/my-courses">My Courses</Nav.Link>
                <Nav.Link as={Link} to="/student/certificates">Certificates</Nav.Link>
              </>
            )}
            {user?.role === 'tutor' && (
              <>
                <Nav.Link as={Link} to="/tutor/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/tutor/create-course">Create Course</Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {user ? (
              <div className="d-flex align-items-center">
                <span className="text-light me-3">Welcome, {user.name}</span>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>Logout</Button>
              </div>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/register">Register</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
