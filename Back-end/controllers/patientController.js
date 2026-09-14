const Patient = require("../models/Patient");

const getPatients = async (req, res) => {
    try {
        const patients = await Patient.find();

        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch patients",
            error: error.message
        });
    }
};

const createPatient = async (req, res) => {
    try {
        const { name, age, gender, email } = req.body;

        const existingPatient = await Patient.findOne({ email });

        if (existingPatient) {
            return res.status(400).json({
                message: "Patient with this email already exists"
            });
        }

        const patient = await Patient.create({
            name,
            age,
            gender,
            email
        });

        res.status(201).json({
            message: "Patient created successfully",
            patient
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create patient",
            error: error.message
        });
    }
};

module.exports = {
    getPatients,
    createPatient
};