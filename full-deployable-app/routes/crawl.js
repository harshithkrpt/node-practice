// routes/crawl.routes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const { requireSiteReadAccess } = require('../middlewares/rbac');
const crawlController = require('../controllers/crawl.controller');

router.get(
  '/sites/:siteId/pages',
  requireAuth,
  requireSiteReadAccess(),
  crawlController.listCrawledPages
);

module.exports = router;
