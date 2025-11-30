const pool = require('../lib/db');

async function alreadyProcessed(jobKey) {
    const [rows] = await pool.query(`
            SELECT job_key FROM job_runs WHERE job_key = ?
        `, [jobKey]);

    return rows.length > 0;
}

async function markProcessed(jobKey) {
    await pool.query(`
            INSERT IGNORE INTO job_runs (job_key, completed_at) VALUES (?, NOW())
        `, [jobKey]);
}

module.exports = {
    alreadyProcessed,
    markProcessed
}