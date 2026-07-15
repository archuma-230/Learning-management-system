const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const { protect } = require('../middleware/authMiddleware');
const { studentGuard } = require('../middleware/roleMiddleware');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// @route POST /api/certificates/:courseId/generate
// @desc Generate certificate for 100% completion
router.post('/:courseId/generate', protect, studentGuard, async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const studentId = req.user._id;

    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment) {
      return res.status(400).json({ message: 'Not enrolled in this course' });
    }

    const course = await Course.findById(courseId).populate('tutor', 'name');
    const totalLectures = await Lecture.countDocuments({ course: courseId });

    if (totalLectures === 0 || enrollment.progress.length < totalLectures) {
      return res.status(400).json({ message: 'Course not 100% complete yet' });
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({ student: studentId, course: courseId });
    if (certificate) {
      return res.json(certificate);
    }

    // Generate new certificate
    const certId = uuidv4();
    certificate = new Certificate({
      student: studentId,
      course: courseId,
      certificateId: certId
    });

    await certificate.save();

    res.status(201).json({
      ...certificate._doc,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/certificates/my
// @desc Get student's certificates
router.get('/my', protect, studentGuard, async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .populate('course', 'title');
    
    // Attach pdfUrl for convenience
    const certsWithUrl = certificates.map(c => ({
      ...c._doc,
      pdfUrl: `/uploads/${c.certificateId}.pdf`
    }));

    res.json(certsWithUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/certificates/verify/:certId
// @desc Verify certificate ID (public)
router.get('/verify/:certId', async (req, res) => {
  try {
    const certificate = await Certificate.findOne({ certificateId: req.params.certId })
      .populate('student', 'name')
      .populate('course', 'title');

    if (!certificate) {
      return res.status(404).json({ valid: false, message: 'Invalid Certificate ID' });
    }

    res.json({ valid: true, certificate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
