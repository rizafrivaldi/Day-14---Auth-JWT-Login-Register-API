const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

const authorizesRoles = require("../middleware/roleMiddleware");

//contoh protected route//
router.get("/admin", authMiddleware, authorizesRoles("admin"), (req, res) => {
  console.log("DEBUG ROUTE PROFILE TERPANGGIL, USER", req.user);
  res.json({
    message: "Selamat datang di halaman admin!",
    user: req.user, //this is the result of decode JWT
  });
});

module.exports = router;
