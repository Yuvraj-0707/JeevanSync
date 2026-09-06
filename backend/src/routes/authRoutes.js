const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Hospital = require('../models/Hospital');
const hospitalsSeedData = require('../data/hospitalsData');

// Seed cluster into MongoDB
router.post('/seed', async (req, res) => {
  try {
    await Hospital.deleteMany({});
    for (const h of hospitalsSeedData) {
      const node = new Hospital(h);
      await node.save();
    }
    res.status(201).json({
      status: 'success',
      message: '5 hospital nodes initialized in mesh network.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authenticate node
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const hospital = await Hospital.findOne({
      $or: [{ email: identifier }, { hospitalId: identifier }]
    });

    if (!hospital || !(await hospital.matchPassword(password))) {
      return res.status(401).json({ message: 'Unauthorized: Invalid Node Credentials' });
    }

    const token = jwt.sign(
      { id: hospital._id, hospitalId: hospital.hospitalId, name: hospital.name },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '3d' }
    );

    res.json({
      token,
      hospital: {
        id: hospital._id,
        hospitalId: hospital.hospitalId,
        name: hospital.name,
        city: hospital.city,
        inventory: hospital.inventory
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;