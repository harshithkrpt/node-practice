const { hasSiteReadAccess, isSiteOwner } = require('../services/accessService');


function requireRole(roleName) {
    return (req, res, next) => {
        if(!req.user || !req.user.roles?.includes(roleName)) {
            return res.status(403).json({ message: 'Forbidden' })
        }

        next();
    };
}


function requireSiteOwnerOrAdmin() {
  return async (req, res, next) => {
    const siteId = req.params.siteId;
    const userId = req.user.id;

    // Admin fast-path
    if (req.user.roles?.includes('ADMIN')) return next();

    if (await isSiteOwner(userId, siteId)) return next();

    return res.status(403).json({ message: 'Not site owner' });
  };
}

function requireSiteReadAccess() {
  return async (req, res, next) => {
    const siteId = req.params.siteId;
    const userId = req.user.id;

    if (req.user.roles?.includes('ADMIN')) return next();

    if (await isSiteOwner(userId, siteId)) return next();
    if (await hasSiteReadAccess(userId, siteId)) return next();

    return res.status(403).json({ message: 'No access to this site' });
  };
}

module.exports = {
  requireRole,
  requireSiteOwnerOrAdmin,
  requireSiteReadAccess
};



module.exports = { requireRole };