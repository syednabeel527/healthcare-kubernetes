const getAppointments = (req, res) => {

    res.json([
        {
            id: 1,
            patient: "Ali",
            doctor: "Dr. Ahmed",
            date: "2026-09-10",
            status: "Scheduled"
        },
        {
            id: 2,
            patient: "Sinchan",
            doctor: "Dr. Sara",
            date: "2026-09-11",
            status: "Completed"
        }
    ]);

};

module.exports = {
    getAppointments
};