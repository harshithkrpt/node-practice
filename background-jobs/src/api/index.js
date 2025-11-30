require('dotenv').config();

const express = require('express');
const { makeQueue } = require('../lib/queue');

const app = express();
app.use(express.json());

const eventQueue = makeQueue(process.env.QUEUE_NAME || 'events');

app.post('/api/orders/:id/placed', async (req, res) => {
    const orderId = req.params.id;

    await eventQueue.add('processOrder', {
        orderId
    }, {
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
        priority: 2
    });
    res.json({ ok: true });
});

app.post('/api/users/:id/notify', async (req, res) => {
    const userId = req.params.id;
    const { message } = req.body;
    await eventQueue.add('sendNotification', {
        userId, message,
        notificationId: Date.now()
    }, {
        attempts: 3,
        backoff: { 
            type: 'fixed',
            delay: 5000
        }
    });

    res.json({
        ok: true
    })
})

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log('api listening', port));

process.on('SIGINT', () => {
  console.log('API shutting down');
  server.close(() => process.exit(0));
});