const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  age: Number
});

module.exports = mongoose.model('User', userSchema);
