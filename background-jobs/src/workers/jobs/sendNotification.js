const { alreadyProcessed, markProcessed } = require('../../utils/idempotency');
const pool = require('../../lib/db');


module.exports = async function sendNotification(job) {
    const jobKey = `notify:${job.name}:${job.data.userId}:${job.data.notificationId || job.id}`;

    if(await alreadyProcessed(jobKey)) {
        console.log('[sendNotification] already processed', jobKey);
        return;
    }

    const [rows] = await pool.query(`
            SELECT email FROM users WHERE id = ?
        `, [job.data.userId]);

    const email = rows[0]?.email;
    if(!email) throw new Error('no email');
    console.log(`Sending Notification to ${email}`, job.data.message);

    await markProcessed(jobKey);
};

