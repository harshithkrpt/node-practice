const { mysqlPool } = require('../db/mysql');


const createRequest = async (req, res) => {
  const { site_id, reason } = req.body;
  const userId = req.user.userId;

  const db = await mysqlPool.getConnection();

  const [result] = await db.query(
    `INSERT INTO service_requests (requestor_id, site_id, reason) VALUES (?, ?, ?)`,
    [userId, site_id, reason || null]
  );

  res.status(201).json({ request_id: result.insertId });
  db.release();
};

const listMyRequests = async (req, res) => {
  const userId = req.user.userId;
const db = await mysqlPool.getConnection();
  const [rows] = await db.query(
    `SELECT * FROM service_requests WHERE requestor_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  res.json(rows);
  db.release();
};

const listIncomingForCreator = async (req, res) => {
  const creatorId = req.user.userId;
    const db = await mysqlPool.getConnection();
  const [rows] = await db.query(
    `
    SELECT r.*
    FROM service_requests r
    JOIN sites s ON r.site_id = s.site_id
    WHERE s.owner_user_id = ?
    ORDER BY r.created_at DESC
    `,
    [creatorId]
  );
  res.json(rows);
  db.release();
};

const approveRequest = async (req, res) => {
  const creatorId = req.user.userId;
  const requestId = req.params.requestId;

    const db = await mysqlPool.getConnection();
  // 1. Load request + ensure this creator owns that site
  const [[request]] = await db.query(
    `
    SELECT r.*, s.owner_user_id 
    FROM service_requests r
    JOIN sites s ON r.site_id = s.site_id
    WHERE r.request_id = ?
    `,
    [requestId]
  );

  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.owner_user_id !== creatorId)
    return res.status(403).json({ message: 'Not your site' });

  if (request.status !== 'PENDING')
    return res.status(400).json({ message: 'Already processed' });

  // 2. Approve request
  await db.query(
    `UPDATE service_requests SET status = 'APPROVED', updated_at = NOW() WHERE request_id = ?`,
    [requestId]
  );

  // 3. Grant object access
  await db.query(
    `
    INSERT INTO object_access (user_id, resource_type, resource_id, access_level, granted_by)
    VALUES (?, 'SITE', ?, 'READ', ?)
    ON DUPLICATE KEY UPDATE access_level = VALUES(access_level), granted_by = VALUES(granted_by)
    `,
    [request.requestor_id, request.site_id, creatorId]
  );

  res.json({ message: 'Request approved and access granted' });
  db.release();
};

const rejectRequest = async (req, res) => {
    const db = await mysqlPool.getConnection();
  const creatorId = req.user.userId;
  const requestId = req.params.requestId;

  const [[request]] = await db.query(
    `
    SELECT r.*, s.owner_user_id 
    FROM service_requests r
    JOIN sites s ON r.site_id = s.site_id
    WHERE r.request_id = ?
    `,
    [requestId]
  );

  if (!request) return res.status(404).json({ message: 'Request not found' });
  if (request.owner_user_id !== creatorId)
    return res.status(403).json({ message: 'Not your site' });

  if (request.status !== 'PENDING')
    return res.status(400).json({ message: 'Already processed' });

  await db.query(
    `UPDATE service_requests SET status = 'REJECTED', updated_at = NOW() WHERE request_id = ?`,
    [requestId]
  );

  res.json({ message: 'Request rejected' });
  db.release();
};


module.exports = {
    createRequest,
    approveRequest,
    rejectRequest,
    listIncomingForCreator,
    listMyRequests
}