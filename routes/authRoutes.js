const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/generateToken");

//Dummy database (sementara, nanti bisa pakai MongoDB)//
const users = [];

//Simulasi database untuk blacklist token (logout)//
let tokenBlackList = [];

let validRefreshTokens = []; //semua token aktif

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

    //Simpan user baru ke array//
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      role: "user", //default role
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
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    validRefreshTokens.push(refreshToken);

    res.status(200).json({
      message: "Login berhasil",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error saat login:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

//Refresh Token//
//Add setelah end point login//
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "Refresh token tidak ditemukan" });

  //cek apakah refresh token ada di daftar token valid (whitelist)
  if (!validRefreshTokens.includes(refreshToken))
    return res.status(403).json({ message: "Refresh token tidak valid" });

  //cek apakah refresh token sudah di-blacklist
  if (tokenBlackList.includes(refreshToken))
    return res.status(403).json({ message: "Refresh token sudah diblacklist" });

  //verifikasi refresh token//
  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Refresh token kedaluwarsa" });

    // decoded hanya berisi id (sesuai payload saat membuat refresh token)
    const foundUser = users.find((u) => u.id === decoded.id);

    if (!foundUser) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const newAccessToken = generateAccessToken({
      id: decoded.id,
      email: foundUser.email,
    });

    res.json({
      message: "Access token baru berhasil dibuat",
      accessToken: newAccessToken,
    });
  });
});

//Logout//
//Add after refresh section//
router.post("/logout", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res
      .status(400)
      .json({ success: false, message: "Refresh token tidak ditemukan" });
  }

  // jika sudah di-blacklist, tolak
  if (tokenBlackList.includes(refreshToken)) {
    return res
      .status(403)
      .json({ message: "Token sudah logout (diblacklist)" });
  }

  // hapus dari array refresh tokens aktif
  validRefreshTokens = validRefreshTokens.filter(
    (token) => token !== refreshToken
  );

  if (!validRefreshTokens.includes(refreshToken)) {
    return res.status(403).json({
      success: false,
      message: "Refresh token tidak valid",
    });
  }

  // tambahkan ke blacklist supaya tidak bisa dipakai lagi
  tokenBlackList.push(refreshToken);

  return res.json({
    success: true,
    message: "Logout berhasil, token dihapus dari daftar aktif",
  });
});

//Test protected route//
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Berhasil mengakses route yang dilindungi",
    user: req.user,
  });
});

module.exports = router;
