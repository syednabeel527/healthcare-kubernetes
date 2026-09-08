const Patient = require("../models/Patient");

const getPatients = async (req, res) => {

    try {

        const patients = await Patient.find();

        res.json(patients);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch patients",
            error: error.message
        });

    }

};


const createPatient = async (req, res) => {

    try {

        const patient = await Patient.create({
            name: req.body.name,
            age: req.body.age,
            gender: req.body.gender
        });

        res.status(201).json(patient);

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