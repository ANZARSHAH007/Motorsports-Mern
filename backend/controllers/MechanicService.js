const MechanicService = require('../models/MechanicsService');
const User = require('../models/User');

const createService = async (req, res) => {
  const { title, description, servicesOffered, price, availability } = req.body;

  try {
    const service = new MechanicService({
      user: req.user.id, // Mechanic's user ID
      title,
      description,
      servicesOffered,
      price,
      availability,
    });

    await service.save();
    res.status(201).json({ message: 'Service created successfully', service });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllServices = async (req, res) => {
  try {
    const services = await MechanicService.find().populate('user', 'firstName lastName email');
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getServiceById = async (req, res) => {
  try {
    const service = await MechanicService.findById(req.params.id).populate('user', 'firstName lastName email');
    if (!service) return res.status(404).json({ message: 'Service not found' });

    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const contactMechanic = async (req, res) => {
  try {
    const service = await MechanicService.findById(req.params.id).populate('user', 'email');
    if (!service) return res.status(404).json({ message: 'Service not found' });

    // Logic to contact the mechanic (e.g., send an email or save a request to the database)
    // For now, just return a success message
    res.status(200).json({ message: `Contact request sent to mechanic: ${service.user.email}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteService = async (req, res) => {
  try {
    const service = await MechanicService.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateService = async (req, res) => {
  const { title, description, servicesOffered, price, availability } = req.body;

  try {
    const updatedService = await MechanicService.findByIdAndUpdate(
      req.params.id,
      { title, description, servicesOffered, price, availability },
      { new: true, runValidators: true }
    );

    if (!updatedService) return res.status(404).json({ message: 'Service not found' });

    res.status(200).json({ message: 'Service updated successfully', service: updatedService });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createService, getAllServices, getServiceById, contactMechanic , deleteService, updateService };
