const express = require("express");

const app = express();

const PORT = 5000;

// Database
const connectDB = require("./config/db");

// Middleware
app.use(express.json());

// Routes
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const authRoutes = require("./routes/authRoutes");

// Home
app.get("/", (req, res) => {
    res.json({
        message: "Healthcare API is running"
    });
});

// Healthcare APIs
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/auth", authRoutes);

// Connect Database
connectDB();

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});