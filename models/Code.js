// models/Code.js

const mongoose = require('mongoose');


const codeSchema = new mongoose.Schema({
  generatedCode: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Code', codeSchema);
