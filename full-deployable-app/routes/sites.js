// routes/sites.routes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const { requireRole, requireSiteOwnerOrAdmin } = require('../middlewares/rbac');
const sitesController = require('../controllers/sites.controller');

router.post(
  '/',
  requireAuth,
  requireRole('CREATOR'),
  sitesController.createSite
);

router.get(
  '/',
  requireAuth,
  sitesController.listMySites
);

router.post(
  '/:siteId/crawl',
  requireAuth,
  requireSiteOwnerOrAdmin(),
  sitesController.triggerCrawl
);

module.exports = router;
