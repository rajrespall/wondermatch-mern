const express = require('express');
const router = express.Router();
const GameData = require('../models/data.model.js');

// Save game data
router.post('/save', async (req, res) => {
  const { userId, score, category, mistakes, timeTaken } = req.body;

  try {
    const newGameData = new GameData({ userId, score, category, mistakes, timeTaken });
    await newGameData.save();
    res.status(201).json({ message: 'Game data saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save game data', error });
  }
});

module.exports = router;