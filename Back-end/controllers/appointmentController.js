const Appointment = require("../models/Appointment");

const getAppointments = async (req, res) => {

    try {

        const appointments = await Appointment.find()
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