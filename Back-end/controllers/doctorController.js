const User = require("../models/User");

const getDoctors = async (req, res) => {
    try {
        const doctors = await User.find({ role: "doctor" })
            .select("-password");

        res.status(200).json(doctors);

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch doctors",
            error: error.message
        });
    }
};

module.exports = {
    getDoctors
};