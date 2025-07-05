const express = require('express');
const { getUserProfile , UpdateUserProfile, deleteUserAccount ,getUserProfileById} = require('../controllers/userController');
const router = express.Router();

router.get('/all',getUserProfile);
// Get user profile route   
router.get('/user/:id', getUserProfileById);
// Update user profile route        
router.put('/userUpdate/:id', UpdateUserProfile);
// Delete user account route    
router.delete('/userDelete/:id', deleteUserAccount);

module.exports = router;