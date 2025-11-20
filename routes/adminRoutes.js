const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizesRoles = require("../middleware/roleMiddleware");

router.get(
  "/dashboard",
  protect,
  authorizesRoles("admin", "super-admin"),
  (req, res) => {
    res.json({ message: "Welcome to the admin dashboard" });
  }
);

module.exports = router;
