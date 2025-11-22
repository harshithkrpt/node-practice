const { verifyToken } = require("../utils/auth.js");

// const requireAuth = (req, res, next) => {
//     if (!req.signedCookies.token) {
//         res.status(401).send({ message: "invalid token" });
//         return;
//     }
//     const token = req.signedCookies.token;
//     const payload = verifyToken(token);
//     if (!payload) {
//         res.status(401).send({ message: "invalid token" });
//         return;
//     }

//     req.user = payload;
//     next();
// };

const  jwt =  require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = { userId: payload.sub, email: payload.email, roles: payload.roles };
    next();
  });
}

module.exports = {
    requireAuth
};