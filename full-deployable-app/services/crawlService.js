const axios = require("axios");
const { mysqlPool } = require('../db/mysql');

async function runCrawl(crawlId) {
   const db = await mysqlPool.getConnection()
    const[[crawl]] = db.query(`
            SELECT c.crawl_id, c.site_id, s.url
            FROM crawl_runs c JOIN sites s ON s.site_id = c.site_id WHERE c.crawl_id = ?
        `
        , [crawlId]
    );

    if(!crawl) return;

    await db.query(`UPDATE crawl_runs SET status = 'RUNNING' WHERE crawl_id = ?;`, [crawlId]);

    try {
    const response = await axios.get(crawl.url);
    const html = response.data;

    await db.query(
      `INSERT INTO crawled_pages (site_id, url, status_code, title, content_html, content_text)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        crawl.site_id,
        crawl.url,
        response.status,
        '', // extract title later
        html,
        stripHtml(html) // some helper to make plain text
      ]
    );
    }
    catch(err) {
        await db.query(
      `UPDATE crawl_runs SET status = 'FAILED', ended_at = NOW(), error_message = ? WHERE crawl_id = ?`,
      [err.message, crawlId]
    );
    }
    finally {
        db.release();
    }
}

function stripHtml(html) {
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = {
    runCrawl
};