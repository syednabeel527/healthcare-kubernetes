const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({

    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    date: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ["Scheduled", "Completed", "Cancelled"],
        default: "Scheduled"
    }

});

module.exports = mongoose.model("Appointment", appointmentSchema);