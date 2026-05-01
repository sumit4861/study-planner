const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
  title: String,
  date: String,
  userId: String,
  status: {
    type: String,
    default: "pending"
  },
  source: {
    type: String,
    default: "manual"
  }
});

const Task = mongoose.model("Task", TaskSchema);
module.exports = Task;