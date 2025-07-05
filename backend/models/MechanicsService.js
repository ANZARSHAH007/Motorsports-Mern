const mongoose = require('mongoose');

const MechanicServiceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  servicesOffered: {
    type: [String],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  availability: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('MechanicService', MechanicServiceSchema);