const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  progress: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lecture' }] // Array of completed lecture IDs
}, { timestamps: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
