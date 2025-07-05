const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  carsRegistered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
  }],
  ticketPrice: {
    type: Number,
    required: true,
  },
  spectators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);