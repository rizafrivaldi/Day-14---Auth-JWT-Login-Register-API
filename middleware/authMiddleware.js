const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  //Pastikan header Authorization ada dan formatnya benar//
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Akses ditolak, token tidak ditemukan" });
  }
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; //simpan data user di request
    next();
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Token tidak valid atau kedaluwarsa" });
  }
}

module.exports = authMiddleware;
