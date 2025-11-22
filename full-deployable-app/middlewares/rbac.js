function requireRole(roleName) {
    return (req, res, next) => {
        if(!req.user || !req.user.roles?.includes(roleName)) {
            return res.status(403).json({ message: 'Forbidden' })
        }

        next();
    };
}


module.exports = { requireRole };