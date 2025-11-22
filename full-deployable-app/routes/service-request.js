// routes/serviceRequest.routes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/rbac');
const serviceRequestController = require('../controllers/serviceRequest.controller');

router.post(
  '/',
  requireAuth,
  requireRole('REQUESTOR'),
  serviceRequestController.createRequest
);

router.get(
  '/my',
  requireAuth,
  requireRole('REQUESTOR'),
  serviceRequestController.listMyRequests
);

router.get(
  '/incoming',
  requireAuth,
  requireRole('CREATOR'),
  serviceRequestController.listIncomingForCreator
);

router.post(
  '/:requestId/approve',
  requireAuth,
  requireRole('CREATOR'),
  serviceRequestController.approveRequest
);

router.post(
  '/:requestId/reject',
  authenticateJWT,
  requireRole('CREATOR'),
  serviceRequestController.rejectRequest
);

module.exports = router;
