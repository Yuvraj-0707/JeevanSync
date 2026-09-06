const express = require('express');
const router = express.Router();
const Hospital = require('../models/Hospital');

// Public route: Delivers qualitative availability status, never raw counts
router.get('/public-grid', async (req, res) => {
  try {
    const nodes = await Hospital.find().select('name city contactNumber coordinates inventory');

    const maskedGrid = nodes.map((node) => {
      const maskedInventory = {};
      for (const [group, count] of Object.entries(node.inventory)) {
        if (count > 15) maskedInventory[group] = 'Adequate';
        else if (count >= 5) maskedInventory[group] = 'Low Stock';
        else maskedInventory[group] = 'Critical Deficit';
      }

      return {
        id: node._id,
        name: node.name,
        city: node.city,
        contact: node.contactNumber,
        availability: maskedInventory
      };
    });

    res.json(maskedGrid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;