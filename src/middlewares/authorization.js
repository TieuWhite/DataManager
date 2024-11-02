const User = require("../models/User");

const authorizeManager = async (req, res, next) => {
  try {
    const managerId = req.headers["x-manager-id"];

    if (!managerId) {
      return res.status(401).json({ message: "Manager ID is required" });
    }

    const manager = await User.findById(managerId);

    if (!manager || manager.isDeleted) {
      return res.status(404).json({ message: "Manager not found" });
    }

    if (manager.role !== "manager") {
      return res
        .status(403)
        .json({ message: "Only managers can perform this action" });
    }

    req.manager = manager;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { authorizeManager };
