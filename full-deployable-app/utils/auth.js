const jwt = require("jsonwebtoken");
const { v4 : uuidv4 } = require("uuid");
const redis = require("../db/redis");

const signAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_TTL
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

const generateRefreshToken = (user) => {
    const jti = uuidv4();

    const token = jwt.sign({
        sub: user.id,
        jti
    }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_TTL
    });

    return {
        jti, 
        token
    }
}


const storeRefreshToken = async (userId, jti, expiresInSeconds) => {
    const key = `refresh:${userId}:${jti}`;

    await redis.set(key, "valid", {
        EX: expiresInSeconds || 7 * 24 * 60 * 60
    });

    return key;
}

const isRefreshTokenValid = async (userId, jti) => {
    const key = `refresh:${userId}:${jti}`;
    const val = await redis.get(key);
    return val === 'valid';
}

const revokeRefreshToken = async (userId, jti) => {
    const key = `refresh:${userId}:${jti}`;
    await redis.del(key);
}

async function revokeAllRefreshTokensForUser(userId) {
  const pattern = `refresh:${userId}:*`;
  // Simple scan+del
  const iter = redis.scanIterator({ MATCH: pattern });
  for await (const key of iter) {
    await redis.del(key);
  }
}

module.exports = {
    signAccessToken,
    verifyToken,
    generateRefreshToken,
    storeRefreshToken,
    isRefreshTokenValid,
    revokeRefreshToken,
    revokeAllRefreshTokensForUser
};