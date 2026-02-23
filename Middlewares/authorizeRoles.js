export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          msg:
            "you need to be a " +
            allowedRoles.join(" or ") +
            " to access this feature",
        });
      }
      next();
    } catch (error) {
      return res.status(500).json({ error: "Server error" });
    }
  };
};
