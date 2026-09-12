const express = require("express");

const router = express.Router();

const {
    getAppointments,
    createAppointment
} = require("../controllers/appointmentController");

const protect = require("../middleware/authMiddleware");

router.get("/", protect, getAppointments);

router.post("/", protect, createAppointment);

module.exports = router;