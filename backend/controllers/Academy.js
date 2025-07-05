const AcademyLesson = require('../models/AcademyLesson');
const User = require('../models/User');

// Create a new academy lesson (admin only)
const createLesson = async (req, res) => {
  const { title, description, videoURL, price } = req.body;

  try {
    const lesson = new AcademyLesson({
      owner: req.user.id, // Admin's user ID
      title,
      description,
      videoURL,
      price,
    });

    await lesson.save();
    res.status(201).json({ message: 'Lesson created successfully', lesson });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all academy lessons
const getAllLessons = async (req, res) => {
  try {
    const lessons = await AcademyLesson.find().populate('owner', 'firstName lastName email');
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get list of users who applied for lessons (admin only)
const getApplicants = async (req, res) => {
  try {
    // Assuming you have a separate model or logic to track applicants
    const applicants = await User.find({ role: 'carOwner' }); // Example: Fetch car owners who applied
    res.status(200).json(applicants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createLesson, getAllLessons, getApplicants };