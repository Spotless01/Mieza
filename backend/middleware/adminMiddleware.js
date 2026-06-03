const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  const authHeader =
    req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "No token"
    });
  }

  const token =
    authHeader.split(" ")[1];

  try {

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    if (!decoded.admin) {

      return res.status(403).json({
        message: "Not admin"
      });

    }

    req.admin = true;

    next();

  } catch {

    res.status(401).json({
      message: "Invalid token"
    });

  }

};