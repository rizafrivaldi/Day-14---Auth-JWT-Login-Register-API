const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

//contoh protected route//
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Data profile berhasil diakses",
    user: req.user, //this is the result of decode JWT
  });
});

module.exports = router;
