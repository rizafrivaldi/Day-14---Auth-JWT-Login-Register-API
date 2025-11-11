const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  console.log("DEBUG AUTH HEADER =", authHeader);
  let token = null;

  //Pastikan header Authorization ada dan formatnya benar//
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Akses ditolak, token tidak ditemukan" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DEBUG TOKEN DECODED", decoded);
    req.user = decoded; //simpan data user di request
    next();
  } catch (error) {
    console.log("DEBUG VERIFY ERROR", error);
    return res
      .status(403)
      .json({ message: "Token tidak valid atau kedaluwarsa" });
  }
}

module.exports = authMiddleware;
