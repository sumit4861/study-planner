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
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  duration: {
    type: Number,
    default: 1
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  }
});

const Task = mongoose.model("Task", TaskSchema);
module.exports = Task;