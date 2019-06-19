const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const URLSchema = new Schema({
  url: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = URL = mongoose.model("urls", URLSchema);
