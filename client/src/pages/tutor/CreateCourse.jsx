import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const CreateCourse = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [price, setPrice] = useState(99); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      description,
      category,
      thumbnail,
       price 
    };

    try {
      const response = await api.post('/courses', payload);
      navigate(`/tutor/course/${response.data._id}/manage`);
    } catch (err) {
      alert('Error creating course');
    }
  };

  return (
    <Container className="mt-5 mb-5 d-flex justify-content-center">
      <Card style={{ width: '600px' }} className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-4">
          <h3 className="mb-4 text-secondary">Create a New Course</h3>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Course Title</Form.Label>
              <Form.Control type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
            </Form.Group>
               <Form.Group className="mb-3">
              <Form.Label>Price (₹, must be under ₹100)</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max="99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label>Thumbnail Image URL</Form.Label>
              <Form.Control type="text" placeholder="https://example.com/image.jpg" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Save & Add Lectures
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateCourse;
