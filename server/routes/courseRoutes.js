const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Lecture = require('../models/Lecture');
const { protect } = require('../middleware/authMiddleware');
const { tutorGuard } = require('../middleware/roleMiddleware');
const multer = require('multer');

// Setup multer for thumbnail and video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// @route GET /api/courses
// @desc Get all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({}).populate('tutor', 'name email');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route GET /api/courses/:id
// @desc Get course by ID including lectures
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('tutor', 'name email');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    const lectures = await Lecture.find({ course: req.params.id }).sort('order');
    res.json({ course, lectures });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// @route PUT /api/courses/:id
// @desc Update a course (tutor only, owner check)
router.put('/:id', protect, tutorGuard, upload.single('thumbnail'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (course.tutor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this course' });
    }

    course.title = req.body.title || course.title;
    course.description = req.body.description || course.description;
    course.category = req.body.category || course.category;
    if (req.body.thumbnail !== undefined) {
      course.thumbnail = req.body.thumbnail;
    }

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post('/', protect, tutorGuard, upload.single('thumbnail'), async (req, res) => {
  const { title, description, category, thumbnail, price } = req.body;   // ← add price

  try {
    const course = new Course({
      title,
      description,
      category,
      thumbnail: thumbnail || '',
      price: price || 99,   // ← new
      tutor: req.user._id
    });
    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/courses/:id
// @desc Delete a course (tutor only, owner check)
router.delete('/:id', protect, tutorGuard, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (course.tutor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this course' });
    }
    
    await Lecture.deleteMany({ course: req.params.id });
    await course.deleteOne();
    res.json({ message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- LECTURES ---

// @route POST /api/courses/:id/lectures
// @desc Add a lecture to a course (tutor only)
router.post('/:id/lectures', protect, tutorGuard, upload.single('video'), async (req, res) => {
  const { title, content, order, videoUrl, quiz } = req.body;
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.tutor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const lectureVideoUrl = req.file ? `/uploads/${req.file.filename}` : videoUrl;

    const lecture = new Lecture({
      title,
      content,
      order: order || 1,
      videoUrl: lectureVideoUrl,
      quiz: quiz ? JSON.parse(quiz) : [],
      course: course._id
    });

    const createdLecture = await lecture.save();
    res.status(201).json(createdLecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route PUT /api/lectures/:id
// @desc Update a lecture
router.put('/../lectures/:id', protect, tutorGuard, upload.single('video'), async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate('course');
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    
    if (lecture.course.tutor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    lecture.title = req.body.title || lecture.title;
    lecture.content = req.body.content || lecture.content;
    lecture.order = req.body.order || lecture.order;
    if (req.body.quiz) {
      lecture.quiz = JSON.parse(req.body.quiz);
    }
    if (req.file) {
      lecture.videoUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.videoUrl) {
      lecture.videoUrl = req.body.videoUrl;
    }

    const updatedLecture = await lecture.save();
    res.json(updatedLecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route DELETE /api/lectures/:id
// @desc Delete a lecture
router.delete('/../lectures/:id', protect, tutorGuard, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id).populate('course');
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });

    if (lecture.course.tutor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await lecture.deleteOne();
    res.json({ message: 'Lecture removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
