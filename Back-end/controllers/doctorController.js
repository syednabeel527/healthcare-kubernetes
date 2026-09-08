const getDoctors = (req, res) => {
    res.json([
        {
            id: 1,
            name: "Dr. Ahmed",
            specialization: "Cardiology"
        },
        {
            id: 2,
            name: "Dr. Sara",
            specialization: "Neurology"
        }
    ]);
};

module.exports = {
    getDoctors
};