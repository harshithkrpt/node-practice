require('dotenv').config();

const { makeQueue } = require('../lib/queue');

async function register() {
  const q = makeQueue('cron');
  // unique jobId ensures re-adding won't duplicate (BullMQ will update existing repeatable)
  await q.add('cleanupTemp', { thresholdHours: 24 }, {
    jobId: 'cleanupTemp-daily',
    repeat: { cron: '0 3 * * *', tz: 'Asia/Kolkata' }, // every day 03:00 IST
    removeOnComplete: true,
  });

  await q.add('sendDailyReminder', {}, {
    jobId: 'daily-reminder',
    repeat: { cron: '0 9 * * 1-5', tz: 'Asia/Kolkata' }, // weekdays at 09:00 IST
    removeOnComplete: true,
  });

  console.log('Registered repeatable cron jobs');
}

if (require.main === module) {
  register().then(() => {
    console.log('Scheduler done'); process.exit(0);
  }).catch(err => { console.error(err); process.exit(1);});
}

module.exports = { register };