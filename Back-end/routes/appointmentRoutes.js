const express = require("express");

const router = express.Router();

const {
    getAppointments
} = require("../controllers/appointmentController");

router.get("/", getAppointments);

module.exports = router;