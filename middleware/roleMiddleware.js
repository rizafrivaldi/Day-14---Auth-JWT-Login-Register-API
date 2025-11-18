function authorizesRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Akses ditolak, peran tidak sesuai" });
    }
    next();
  };
}

module.exports = authorizesRoles;
