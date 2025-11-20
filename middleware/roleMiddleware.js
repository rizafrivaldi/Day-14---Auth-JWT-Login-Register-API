function authorizesRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Akses ditolak, user tidak terautentikasi" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Akses ditolak, role tidak memiliki izin" });
    }
    next();
  };
}

module.exports = authorizesRoles;
