const express = require('express');
const { createLesson, getAllLessons, getApplicants } = require('../controllers/Academy');
const router = express.Router();

// Create a new academy lesson (only for admins)
router.post('/create',  createLesson);

// Get all academy lessons (accessible to all roles)
router.get('/all',  getAllLessons);

// Get list of users who applied for lessons (only for admins)
router.get('/applicants',  getApplicants);

module.exports = router;