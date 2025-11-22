const {mysqlPool} = require('../db/mysql');

async function createSite (req, res) {
  const { url, name } = req.body;
  const userId = req.user.userId;
  const db = await mysqlPool.getConnection();
  const [result] = await db.query(
    `INSERT INTO sites (owner_user_id, url, name) VALUES (?, ?, ?)`,
    [userId, url, name]
  );
  db.release();
  res.status(201).json({ site_id: result.insertId, url, name });
}

async function listMySites(req, res) {
  const userId = req.user.userId;
const db = await mysqlPool.getConnection();
  const [rows] = await db.query(
    `SELECT * FROM sites WHERE owner_user_id = ?`,
    [userId]
  );
   db.release();
  res.json(rows);
}

async function triggerCrawl(req, res) {
   const siteId = req.params.siteId;
   const db = await mysqlPool.getConnection();
   const [result] = await db.query(
    `INSERT INTO crawl_runs (site_id, status) VALUES (?, 'PENDING')`,
    [siteId]
  );

    // TODO: Create a Background job for actually crawling the data

   res.status(202).json({ message: 'Crawl scheduled', crawl_id: crawlId });
}


module.exports = {
    createSite,
    listMySites,
    triggerCrawl
}