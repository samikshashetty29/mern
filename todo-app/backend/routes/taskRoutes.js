const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// Get all tasks
router.get("/", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Add a task
router.post("/", async (req, res) => {
  const task = await Task.create({ title: req.body.title });
  res.json(task);
});

// Edit a task
router.put("/:id", async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title },
    { new: true }
  );
  res.json(task);
});

// Delete a task
router.delete("/:id", async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: "Task deleted" });
});

module.exports = router;
