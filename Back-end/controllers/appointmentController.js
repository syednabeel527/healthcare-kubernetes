const Appointment = require("../models/Appointment");

const getAppointments = async (req, res) => {
    try {

        let filter = {};

        // Patients can see only their own appointments
        if (req.user.role === "patient") {
            filter.patient = req.user.id;
        }

        // Doctors can see only appointments assigned to them
        if (req.user.role === "doctor") {
            filter.doctor = req.user.id;
        }

        const appointments = await Appointment.find(filter)
            .populate("patient", "name email role")
            .populate("doctor", "name email role");

        res.json(appointments);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch appointments",
            error: error.message
        });

    }
};


const createAppointment = async (req, res) => {

    try {

        const { doctor, date } = req.body;

        const appointment = await Appointment.create({
            patient: req.user.id,
            doctor,
            date
        });

        res.status(201).json({
            message: "Appointment created successfully",
            appointment
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to create appointment",
            error: error.message
        });

    }

};


module.exports = {
    getAppointments,
    createAppointment
};