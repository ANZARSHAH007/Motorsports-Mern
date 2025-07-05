const express = require('express');
const { 
  createEvent, 
  getAllEvents, 
  getEventById, 
  updateEvent, 
  deleteEvent, 
  registerCarForEvent, 
  buyTicket 
} = require('../controllers/Event');
const router = express.Router();

// Create a new event (only for admins)
router.post('/create',  createEvent);

// Get all events (accessible to all roles)
router.get('/all', getAllEvents);

// Get a specific event by ID
router.get('/:id',  getEventById);

// Update an event (only for admins)
router.put('/update/:id',  updateEvent);

// Delete an event (only for admins)
router.delete('/delete/:id',  deleteEvent);

// Register a car for an event (only for car owners)
router.post('/register-car/:id',  registerCarForEvent);

// Buy a ticket for an event (only for spectators)
router.post('/buy-ticket/:id', buyTicket);

module.exports = router;