const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    role: { type: String, enum: ["manager", "employee"], default: "employee" },
    tasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
