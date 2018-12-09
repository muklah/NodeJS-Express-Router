const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  title: String,
  desc: Boolean,
  numberOfLikes: Number
});

module.exports = mongoose.model('Post', postSchema);
