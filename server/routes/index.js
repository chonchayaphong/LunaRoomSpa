const express = require('express');
const router = express.Router();

// ตัวอย่าง API endpoint
router.get('/bookings', (req, res) => {
  res.json({ message: 'Get all bookings' });
});

router.post('/bookings', (req, res) => {
  const data = req.body;
  res.json({ message: 'Booking created', data });
});

module.exports = router;