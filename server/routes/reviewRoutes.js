const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Enrollment = require('../models/Enrollment');
const { protect } = require('../middleware/authMiddleware');
const { studentGuard } = require('../middleware/roleMiddleware');

// @route POST /api/reviews/:courseId
// @desc Leave a rating/review (student only, must be enrolled)
router.post('/:courseId', protect, studentGuard, async (req, res) => {
  const { rating, text } = req.body;
  try {
    // Check enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(400).json({ message: 'Must be enrolled to leave a review' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      student: req.user._id,
      course: req.params.courseId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Already reviewed this course' });
    }

    const review = new Review({
      rating,
      text,
      student: req.user._id,
      course: req.params.courseId
    });

    const createdReview = await review.save();
    res.status(201).json(createdReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/reviews/:courseId
// @desc Get reviews for a course
router.get('/:courseId', async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId }).populate('student', 'name');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
