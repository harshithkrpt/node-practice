const { mysqlPool } = require('../db/mysql');

module.exports = {
    listCrawledPages: async (req, res) => {
        try {
            const db = await mysqlPool.getConnection();
            const siteId = req.params.siteId;
            const [rows] = await db.query(
                `
                SELECT page_id, url, status_code, fetched_at 
                FROM crawled_pages
                WHERE site_id = ?
                ORDER BY fetched_at DESC
                LIMIT 100
            `,
                [siteId]
            );
            res.json(rows);
        }
        finally {
            db.release();
        }
    }
}