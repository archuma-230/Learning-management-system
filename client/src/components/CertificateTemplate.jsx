import React from 'react';

const CertificateTemplate = ({ certificate, courseTitle, studentName, tutorName, id }) => {
  if (!certificate) return null;

  const maroon = '#701034';
  const gold = '#cba052';
  const darkGray = '#333333';

  return (
    <div 
      id={id}
      style={{
        width: '1122.5px', // A4 Landscape width (96 DPI)
        height: '793.7px', // A4 Landscape height (96 DPI)
        backgroundColor: '#ffffff',
        position: 'relative',
        boxSizing: 'border-box',
        padding: '0',
        fontFamily: 'Arial, Helvetica, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: darkGray,
      }}
    >
      {/* Decorative Left Banner */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '80px', height: '100%', backgroundColor: maroon }} />

      {/* Outer Border */}
      <div style={{
        position: 'absolute',
        top: '20px', left: '20px', right: '20px', bottom: '20px',
        border: `6px solid ${maroon}`,
        pointerEvents: 'none'
      }} />

      {/* Inner Border */}
      <div style={{
        position: 'absolute',
        top: '32px', left: '32px', right: '32px', bottom: '32px',
        border: `2px solid ${gold}`,
        pointerEvents: 'none'
      }} />

      <div style={{ zIndex: 1, textAlign: 'center', width: '100%', paddingLeft: '80px' }}>
        <h1 style={{ color: gold, fontSize: '32px', margin: '0 0 40px 0', fontFamily: 'Times New Roman, Times, serif', fontWeight: 'bold' }}>
          MuthuVerse
        </h1>

        <h2 style={{ fontSize: '48px', margin: '0', letterSpacing: '5px', fontFamily: 'Times New Roman, Times, serif', fontWeight: 'bold' }}>
          CERTIFICATE
        </h2>
        <h3 style={{ fontSize: '20px', margin: '10px 0 40px 0', letterSpacing: '2px', fontFamily: 'Times New Roman, Times, serif', fontWeight: 'normal' }}>
          OF ACHIEVEMENT
        </h3>

        <p style={{ fontSize: '16px', color: '#666', margin: '0 0 20px 0' }}>
          THIS CERTIFICATE IS PROUDLY PRESENTED TO
        </p>

        <h2 style={{ 
          fontSize: '64px', 
          color: maroon, 
          margin: '0', 
          fontFamily: 'Times New Roman, Times, serif', 
          fontStyle: 'italic',
          borderBottom: `2px solid ${gold}`,
          display: 'inline-block',
          paddingBottom: '10px'
        }}>
          {studentName}
        </h2>

        <p style={{ fontSize: '18px', margin: '40px 0 10px 0' }}>
          For successfully completing the comprehensive course on
        </p>
        <h3 style={{ fontSize: '32px', color: maroon, margin: '0 0 80px 0', fontFamily: 'Times New Roman, Times, serif' }}>
          {courseTitle}
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '80%', margin: '0 auto', marginTop: '60px' }}>
          <div style={{ textAlign: 'center', width: '200px' }}>
            {/* Signature Font simulation */}
            <div style={{ 
              fontFamily: '"Alex Brush", cursive', 
              fontSize: '56px', 
              color: '#000080', // Navy ink
              marginBottom: '15px',
              transform: 'rotate(-5deg)',
              fontWeight: 'normal'
            }}>
              Muthu
            </div>
            <div style={{ borderTop: `1px solid ${darkGray}`, paddingTop: '5px', fontSize: '12px', fontWeight: 'bold' }}>
              SIGNATURE
            </div>
          </div>

          <div style={{ textAlign: 'center', width: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '16px', marginBottom: '15px' }}>
              {new Date(certificate.issueDate).toLocaleDateString()}
            </div>
            <div style={{ borderTop: `1px solid ${darkGray}`, paddingTop: '5px', fontSize: '12px', fontWeight: 'bold' }}>
              DATE
            </div>
          </div>
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: '40px',
        left: '0',
        right: '0',
        textAlign: 'center',
        fontSize: '11px',
        color: '#aaaaaa'
      }}>
        Certificate ID: {certificate.certificateId}
      </div>
    </div>
  );
};

export default CertificateTemplate;
