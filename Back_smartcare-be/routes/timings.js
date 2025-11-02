// routes/timings.js
const express = require("express");
const router = express.Router();
const { getTimingsForDoctor, saveTimings } = require("../controllers/timingsController");

// POST /api/timings  { doctor_id, weekday, intervals: [{start,end}] }
router.post('/', saveTimings);

// GET /api/timings/:doctorId → grouped intervals
router.get('/:doctorId', getTimingsForDoctor);

module.exports = router;
