const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const { protect } = require('../middleware/authMiddleware');
const { studentGuard } = require('../middleware/roleMiddleware');

// @route POST /api/enrollments/:courseId
// @desc Enroll in a course (student only)
router.post('/:courseId', protect, studentGuard, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const enrollment = new Enrollment({
      student: req.user._id,
      course: req.params.courseId,
      progress: []
    });

    const createdEnrollment = await enrollment.save();
    res.status(201).json(createdEnrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/enrollments/my
// @desc Get student's enrolled courses + progress
router.get('/my', protect, studentGuard, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate({
        path: 'course',
        select: 'title description thumbnail tutor',
        populate: { path: 'tutor', select: 'name' }
      });
    
    // We can also compute progress % if we know total lectures per course,
    // but typically that's done either here or on the frontend.
    // For simplicity, we just return the enrollments (which contains the progress array).
    
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PATCH /api/enrollments/:id/progress
// @desc Mark lecture complete
router.patch('/:id/progress', protect, studentGuard, async (req, res) => {
  const { lectureId } = req.body;
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    
    if (enrollment.student.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!enrollment.progress.includes(lectureId)) {
      enrollment.progress.push(lectureId);
      await enrollment.save();
    }

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
