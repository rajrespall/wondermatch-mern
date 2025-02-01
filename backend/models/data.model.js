const mongoose = require('mongoose');

const gameDataSchema = new mongoose.Schema({
  userId: { 
    type: String, required: true 
},
  score: { type: Number, required: true },
  category: { type: String, required: true },
  mistakes: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  date: { type: Date, default: Date.now }
}, { collection: 'audio-imagedata' });

const GameData = mongoose.model('GameData', gameDataSchema);

module.exports = GameData;