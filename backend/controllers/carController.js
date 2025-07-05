const User = require('../models/User');
const Car = require('../models/Car');

// Create a new car
const createCar = async (req, res) => {
  try {
    const { model, brand, mods, performanceStats } = req.body;
    const owner = req.user._id; // Assuming user ID is stored in req.user

    const newCar = new Car({
      owner,
      model,
      brand,
      mods,
      performanceStats
    });
    await newCar.save();
    res.status(201).json(newCar);
  } catch (error) {
    res.status(500).json({ message: 'Error creating car', error });
  }
};

// Get all cars for a user
const getAllCars = async (req, res) => {
 try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    const cars = await Car.find()
      .populate('owner', 'firstName lastName email')
      .populate('registeredEvents', 'name date location');
      console.log('Cars found:', cars); // <-- Add this line

    // Format response to include event info or message
    const formattedCars = cars.map(car => ({
      _id: car._id,
      model: car.model,
      brand: car.brand,
      mods: car.mods,
      performanceStats: car.performanceStats,
      owner: car.owner,
      events: car.registeredEvents.length > 0
        ? car.registeredEvents
        : 'Car is not participating in any event'
    }));

    res.status(200).json(formattedCars);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cars', error });
  }
}

const GetOwnedCars = async (req, res) => {
 try {
    const cars = await Car.find({ owner: req.user.id }); // Fetch cars owned by the logged-in user
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const DeleteCar = async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ message: 'Error deleting car', error });
  }
}

const updateCar = async (req, res) => {
  try {
    const { model, brand, mods, performanceStats } = req.body;
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id,
      { model, brand, mods, performanceStats },
      { new: true, runValidators: true }
    );
    if (!updatedCar) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(updatedCar);
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(500).json({ message: 'Error updating car', error });
  }
}
module.exports = {
  createCar,
  getAllCars,
  GetOwnedCars,
  DeleteCar,
  updateCar
};

