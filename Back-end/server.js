const express = require("express");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Healthcare API is running");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});