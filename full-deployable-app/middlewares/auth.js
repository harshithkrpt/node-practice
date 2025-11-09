const { verifyToken } = require("../utils/auth");

const requireAuth = (req, res, next) => {
    if (!req.signedCookies.token) {
        res.status(401).send({ message: "invalid token" });
        return;
    }
    const token = req.signedCookies.token;
    const payload = verifyToken(token);
    if (!payload) {
        res.status(401).send({ message: "invalid token" });
        return;
    }

    req.user = payload;
    next();
};

module.exports = {
    requireAuth
};