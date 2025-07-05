const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();

// User registration route
router.post('/signup', signup);

// User login route
router.post('/login', login);

module.exports = router;