export const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin && !req.user?.isSuperAdmin) return res.status(403).json({ message: "Admin access required" });
  next();
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user?.isSuperAdmin) return res.status(403).json({ message: "Super Admin access required" });
  next();
};
