const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "10m", //durasi token aktif//
  });
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" } //durasi refresh token//
  );
}
module.exports = { generateAccessToken, generateRefreshToken };
