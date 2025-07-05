const express = require('express');
const { 
  createService, 
  getAllServices, 
  getServiceById, 
  contactMechanic, 
  deleteService, 
  updateService 
} = require('../controllers/MechanicService');
const router = express.Router();

// Create a new mechanic service (only for mechanics)
router.post('/create',  createService);

// Get all mechanic services (accessible to all roles)
router.get('/all',  getAllServices);

// Get a specific mechanic service by ID
router.get('/:id',  getServiceById);

// Contact a mechanic for a service (accessible to car owners and spectators)
router.post('/contact/:id',  contactMechanic);

// Delete a mechanic service (only for Admins and the mechanic who created it)
router.delete('/:id', deleteService);

// Update a mechanic service (only for Admins and the mechanic who created it)
router.put('/:id', updateService);

module.exports = router;