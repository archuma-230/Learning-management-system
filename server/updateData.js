const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./models/Course');
const Lecture = require('./models/Lecture');

dotenv.config();

const images = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618477247222-ac60ceb0a416?q=80&w=600&auto=format&fit=crop'
];

const videos = [
  'https://www.youtube.com/watch?v=kY31Wn6t1p4',
  'https://www.youtube.com/watch?v=pN6jk0uUrD8',
  'https://www.youtube.com/watch?v=pKd0Rpw7O48'
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const courses = await Course.find();
    for (let i = 0; i < courses.length; i++) {
      courses[i].thumbnail = images[i % images.length];
      await courses[i].save();
    }
    console.log('Updated all course thumbnails');

    const lectures = await Lecture.find();
    for (let i = 0; i < lectures.length; i++) {
      lectures[i].videoUrl = videos[i % videos.length];
      await lectures[i].save();
    }
    console.log('Updated all lecture videos');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
