const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task.js");

const { validateRequest } = require("../middlewares/validation");
const { authorizeManager } = require("../middlewares/authorization");
const { body, param } = require("express-validator");

const router = express.Router();

// Get tasks
router.get("/", async (req, res) => {
  try {
    const { taskName, _id } = req.query;
    const filter = { isDeleted: false };

    if (taskName) {
      filter.name = taskName;
    }

    if (_id) {
      filter._id = _id;
    }

    const tasks = await Task.find(filter).populate("assignee");
    res.status(200).json(tasks);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Create Task
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("status")
      .optional()
      .isIn(["pending", "working", "review", "done", "archive"])
      .withMessage("Invalid status"),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const task = await Task.create(req.body);
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

// Assign Tasks
router.put(
  "/assign/:id",
  [
    param("id").isMongoId().withMessage("Invalid task ID"),
    body("userId").optional().isMongoId().withMessage("Invalid user ID"),
  ],
  validateRequest,
  authorizeManager,
  async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { assignee: req.body.assigneeId || null },
        { new: true }
      ).populate("assignee");

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      res.status(200).json(task);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

// Update Status
router.put(
  "/update/:id",
  [
    param("id").isMongoId().withMessage("Invalid task ID"),
    body("status")
      .isIn(["pending", "working", "review", "done", "archive"])
      .withMessage("Invalid status"),
  ],
  validateRequest,

  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      console.log("Current status:", task.status);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (task.status === "done" && req.body.status !== "archive") {
        return res.status(400).json({
          message: "Tasks once done can only be archived",
        });
      }
      task.status = req.body.status;
      console.log("Updated status:", task.status);
      await task.save();
      res.json(task);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

// Delete Task
router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid task ID")],
  validateRequest,
  async (req, res) => {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true },
        { new: true }
      );
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json({ message: "Task deleted successfully" });
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

module.exports = router;
