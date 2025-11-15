

const COMMON_UTILS = {
    isProduction: () => {
        const nodeEnv = process.env.NODE_ENV;
        if(typeof nodeEnv === 'string') {
            return nodeEnv.toLowerCase().trim() === 'production'
        }

        return false;
    },
    getCookieOptions: () => {
        const cookieOptions = {
            maxAge: 15 * 60 * 1000, // 15 min
            secure: COMMON_UTILS.isProduction(),
            signed: true,
            sameSite: 'lax',
            httpOnly: true
        };

        return Object.freeze(cookieOptions);
    }
}

module.exports = COMMON_UTILS;