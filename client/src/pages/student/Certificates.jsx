import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import CertificateTemplate from '../../components/CertificateTemplate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const Certificates = () => {
  const { user } = useContext(AuthContext);
  const [certificates, setCertificates] = useState([]);
  const [courses, setCourses] = useState([]);
  const [generatingCourseId, setGeneratingCourseId] = useState(null);
  const [downloadingCertId, setDownloadingCertId] = useState(null);
  const [activeCertData, setActiveCertData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const cRes = await api.get('/certificates/my');
      setCertificates(cRes.data);

      const eRes = await api.get('/enrollments/my');
      setCourses(eRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerate = async (enr) => {
    try {
      setGeneratingCourseId(enr.course._id);
      
      const { data } = await api.post(`/certificates/${enr.course._id}/generate`);
      
      setActiveCertData({
        certificate: data,
        courseTitle: enr.course.title,
        studentName: user.name,
        tutorName: enr.course.tutor?.name || 'Instructor',
        id: `cert-gen-${data.certificateId}`
      });
      
    } catch (err) {
      alert(err.response?.data?.message || 'Error generating certificate');
      setGeneratingCourseId(null);
    }
  };

  const handleDownload = (cert) => {
    setDownloadingCertId(cert._id);
    setActiveCertData({
      certificate: cert,
      courseTitle: cert.course?.title || 'Course',
      studentName: user.name,
      tutorName: cert.course?.tutor?.name || 'Instructor',
      id: `cert-dl-${cert.certificateId}`
    });
  };

  useEffect(() => {
    const generatePDF = async () => {
      if (activeCertData) {
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const element = document.getElementById(activeCertData.id);
          if (element) {
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
              orientation: 'landscape',
              unit: 'mm',
              format: 'a4'
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
            pdf.save(`Certificate_${activeCertData.courseTitle.replace(/\s+/g, '_')}_${activeCertData.studentName.replace(/\s+/g, '_')}.pdf`);
            
            if (generatingCourseId) {
              await fetchData();
            }
          }
        } catch (err) {
          console.error("PDF generation error:", err);
          alert('Error generating PDF file.');
        } finally {
          setGeneratingCourseId(null);
          setDownloadingCertId(null);
          setActiveCertData(null);
        }
      }
    };
    
    if (activeCertData) {
      generatePDF();
    }
  }, [activeCertData]);

  const hasCertificate = (courseId) => {
    return certificates.some(cert => cert.course?._id === courseId || cert.course === courseId);
  };

  return (
    <Container className="mt-4 main-content">
      <h2 className="mb-4 text-secondary font-weight-bold">My Certificates</h2>
      <Row className="mb-5">
        {certificates.length === 0 && <p className="text-muted">No certificates earned yet.</p>}
        {certificates.map(cert => (
          <Col md={4} key={cert._id} className="mb-4">
            <Card className="h-100 shadow-sm border-0 bg-light rounded-3 text-center p-3">
              <Card.Body>
                <i className="bi bi-award text-warning mb-3" style={{ fontSize: '3rem' }}></i>
                <Card.Title className="text-primary">{cert.course?.title}</Card.Title>
                <Card.Text>Issued: {new Date(cert.issueDate).toLocaleDateString()}</Card.Text>
                <Card.Text><small className="text-muted">ID: {cert.certificateId}</small></Card.Text>
                
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleDownload(cert)}
                  disabled={downloadingCertId === cert._id}
                >
                  {downloadingCertId === cert._id ? (
                    <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Downloading...</>
                  ) : 'Download PDF'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      <hr />
      <h4 className="mt-4 mb-3">Generate Pending Certificates</h4>
      <p className="text-muted small">Only courses that are 100% complete will succeed.</p>
      <Row>
        {courses.map(enr => {
          const alreadyGenerated = hasCertificate(enr.course._id);
          const isGeneratingThis = generatingCourseId === enr.course._id;
          
          return (
            <Col md={6} key={enr._id} className="mb-3">
               <Card className="shadow-sm border-0 d-flex flex-row align-items-center p-3 rounded-3">
                  <div className="flex-grow-1">
                    <strong>{enr.course?.title}</strong>
                    <br />
                    <small className="text-muted">Completed Lectures: {enr.progress?.length}</small>
                  </div>
                  <div>
                    <Button 
                      variant={alreadyGenerated ? "secondary" : "success"} 
                      size="sm" 
                      disabled={alreadyGenerated || isGeneratingThis}
                      onClick={() => !alreadyGenerated && handleGenerate(enr)}
                      style={alreadyGenerated ? { pointerEvents: 'none', cursor: 'not-allowed', opacity: 0.6 } : {}}
                    >
                      {isGeneratingThis ? (
                        <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Generating...</>
                      ) : alreadyGenerated ? 'Certificate Generated' : 'Generate Certificate'}
                    </Button>
                  </div>
               </Card>
            </Col>
          );
        })}
      </Row>

      <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', opacity: 0 }}>
        {activeCertData && (
          <CertificateTemplate 
            certificate={activeCertData.certificate}
            courseTitle={activeCertData.courseTitle}
            studentName={activeCertData.studentName}
            tutorName={activeCertData.tutorName}
            id={activeCertData.id}
          />
        )}
      </div>
    </Container>
  );
};

export default Certificates;
