const pool = require('../../lib/db');

module.exports = async function cleanupTemp(job) {
    const thresholdHours = job.data.thresholdHours || 24;
    console.log(`cleanupTemp running, thresholdHours = ${thresholdHours}`);
    const [res] = await pool.query(`
            DELETE FROM temp_files WHERE created_at < NOW() - INTERVAL ? HOUR
        `, [thresholdHours]);
    console.log('deleted rows: ', res.affectedRows);
}