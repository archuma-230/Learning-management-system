const tutorGuard = (req, res, next) => {
  if (req.user && req.user.role === 'tutor') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a tutor' });
  }
};

const studentGuard = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a student' });
  }
};

module.exports = { tutorGuard, studentGuard };
