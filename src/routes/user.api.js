const { validateRequest } = require("../middlewares/validation");
const { body, param } = require("express-validator");

const express = require("express");
const User = require("../models/User.js");
const Task = require("../models/Task.js");
const router = express.Router();

// Get users
router.get("/", async (req, res) => {
  try {
    const { name, role, _id } = req.query;
    const filter = { isDeleted: false };

    if (name) {
      filter.name = name;
    }

    if (role) {
      filter.role = role;
    }

    if (_id) {
      filter._id = _id;
    }

    const users = await User.find(filter);
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json(error);
  }
});

// Create user
router.post(
  "/",

  validateRequest,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("role")
      .optional()
      .isIn(["manager", "employee"])
      .withMessage("Invalid role"),
  ],
  async (req, res) => {
    console.log(req.body);
    try {
      const user = await User.create({
        name: req.body.name.toLowerCase(),
        role: req.body.role ? req.body.role.toLowerCase() : "employee",
      });
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json(err);
    }
  }
);

// Get user's tasks
router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid user ID")],
  validateRequest,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id).populate({
        path: "tasks",
        match: { isDeleted: false },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("Invalid user ID")],
  validateRequest,
  async (req, res, next) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isDeleted: true },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await Task.updateMany({ assignee: req.params.id }, { assignee: null });

      res.status(200).json({
        message:
          "User deleted successfully and removed from all assigned tasks",
        user: user,
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
