const express = require("express");

const router = express.Router();

const {
    getPatients,
    createPatient
} = require("../controllers/patientController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// Only doctors and admins can view patients
router.get(
    "/",
    protect,
    authorizeRoles("doctor", "admin"),
    getPatients
);

// Only admins can create patients
router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    createPatient
);

module.exports = router;