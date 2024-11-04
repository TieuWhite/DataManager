require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
jsonParser = bodyParser.json();

app.use(jsonParser);
app.use("/api/users", require("./routes/user.api"));
app.use("/api/tasks", require("./routes/task.api"));

app.use((err, req, res) => {
  console.log(err.message);
  res.status(500).json({ message: "Something went wrong" });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
