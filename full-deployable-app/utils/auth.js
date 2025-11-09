const jwt = require("jsonwebtoken");

const signToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '15m'
    });
}

const verifyToken = (token, opts = {}) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET, opts);
    }
    catch(err) {
        return null;
    }
}




module.exports = {
    signToken,
    verifyToken
};