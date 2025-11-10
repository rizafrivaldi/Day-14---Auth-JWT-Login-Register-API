const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const generateToken = require("../utils/generateToken");
const protect = require("../middleware/authMiddleware");

//Dummy database (sementara, nanti bisa pakai MongoDB)//
const users = [];

//Register user baru
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //validasi input//
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Semua field harus diisi" });
    }

    //cek jika email sudah terdaftar//
    const userExist = users.find((user) => user.email === email);
    if (userExist) {
      return res.status(400).json({ message: "Email sudah digunakan!" });
    }

    //Hash password//
    const hashedPassword = await bcrypt.hash(password, 10);

    //Simpan unser baru ke array//
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
    };
    users.push(newUser);

    res.status(201).json({ message: "Register berhasil", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

//Login user//
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    //Validasi input//
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi!" });
    }
    //Cek apakah user ada//
    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    //Bandingkan password//
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password salah!" });
    }

    //Buat token//
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error("Error saat login:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

//Test protected route//
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Berhasil mengakses route yang dilindungi",
    user: req.user,
  });
});

module.exports = router;
