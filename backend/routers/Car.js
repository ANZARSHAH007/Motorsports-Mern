const express = require('express');
const{ createCar,
  getAllCars,
  GetOwnedCars,
  DeleteCar,
  updateCar} = require('../controllers/carController');

const router = express.Router();
//Get All Cars owned by a user
router.get('/my-cars/:id', GetOwnedCars);
 //Add a new car
router.post('/add-car', createCar);
//Update car details
router.put('/update-car/:id', updateCar);
//Delete a car
router.delete('/delete-car/:id', DeleteCar);
//Get all cars
router.get('/all-cars', getAllCars);

module.exports = router;
