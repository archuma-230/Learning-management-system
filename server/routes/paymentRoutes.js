const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const { protect } = require('../middleware/authMiddleware');
const { studentGuard } = require('../middleware/roleMiddleware');

console.log('Razorpay ENV vars defined?', !!process.env.RAZORPAY_KEY_ID, !!process.env.RAZORPAY_KEY_SECRET);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const MAX_COURSE_PRICE = 100; // keep every course under ₹100

// @route POST /api/payments/create-order
router.post('/create-order', protect, studentGuard, async (req, res) => {
  const { courseId } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existingEnrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    const price = course.price || 0;
    if (price <= 0 || price >= MAX_COURSE_PRICE) {
      return res.status(400).json({ message: `Course price must be between ₹1 and ₹${MAX_COURSE_PRICE - 1}` });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(price * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now().toString().slice(-10)}_${courseId.toString().slice(-4)}`
    });

    await Payment.create({
      student: req.user._id,
      course: courseId,
      razorpayOrderId: order.id,
      amount: price,
      status: 'created'
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      courseName: course.title
    });
  } catch (error) {
    console.error('Razorpay create-order error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error during order creation' });
  }
});

// @route POST /api/payments/verify
router.post('/verify', protect, studentGuard, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;
  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await Payment.findOneAndUpdate({ razorpayOrderId: razorpay_order_id }, { status: 'failed' });
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'paid' }
    );

    let enrollment = await Enrollment.findOne({ student: req.user._id, course: courseId });
    if (!enrollment) {
      enrollment = await Enrollment.create({ student: req.user._id, course: courseId, progress: [] });
    }

    res.json({ message: 'Payment verified, enrollment successful', enrollment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;