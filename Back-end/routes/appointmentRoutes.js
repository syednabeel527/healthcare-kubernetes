const express = require("express");

const router = express.Router();

const {
    getAppointments,
    createAppointment
} = require("../controllers/appointmentController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Patients and doctors can view appointments
router.get(
    "/",
    protect,
    authorizeRoles("patient", "doctor"),
    getAppointments
);

// Only patients can create appointments
router.post(
    "/",
    protect,
    authorizeRoles("patient"),
    createAppointment
);

module.exports = router;