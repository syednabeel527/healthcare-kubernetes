const express = require("express");

const router = express.Router();

const {
    getPatients,
    createPatient
} = require("../controllers/patientController");

router.get("/", getPatients);

router.post("/", createPatient);

module.exports = router;