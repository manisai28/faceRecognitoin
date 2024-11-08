const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  name: String,
  image: String,
  photo_number: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Photo', photoSchema);