const Event = require("../models/Events");
const Car = require("../models/Car");
const User = require("../models/User");

// Create a new event (admin only)
const createEvent = async (req, res) => {
  const { name, location, date, ticketPrice } = req.body;

  try {
    const event = new Event({
      name,
      location,
      date,
      ticketPrice,
    });

    await event.save();
    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().populate(
      "carsRegistered spectators",
      "firstName lastName email"
    );
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific event by ID
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate(
      "carsRegistered spectators",
      "firstName lastName email"
    );
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//carsRegistered

// Update an event (admin only)
const updateEvent = async (req, res) => {
  const { name, location, date, ticketPrice } = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { name, location, date, ticketPrice },
      { new: true, runValidators: true }
    );

    if (!updatedEvent)
      return res.status(404).json({ message: "Event not found" });

    res
      .status(200)
      .json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an event (admin only)
const deleteEvent = async (req, res) => {

  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Register a car for an event (car owner only)
const registerCarForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const car = await Car.findOne({ _id: req.body.carId, owner: req.user.id });
    if (!car)
      return res
        .status(404)
        .json({ message: "Car not found or not owned by you" });

    // Prevent duplicate registration
    if (!event.carsRegistered.includes(car._id)) {
      event.carsRegistered.push(car._id);
      await event.save();
    }

    // Also update the car's registeredEvents array
    if (!car.registeredEvents.includes(event._id)) {
      car.registeredEvents.push(event._id);
      await car.save();
    }
    
    res
      .status(200)
      .json({ message: "Car registered for the event successfully", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buy a ticket for an event (spectator only)
const buyTicket = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    event.spectators.push(req.user.id);
    await event.save();

    res.status(200).json({ message: "Ticket purchased successfully", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  registerCarForEvent,
  buyTicket,
};
