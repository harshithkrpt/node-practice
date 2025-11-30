require('dotenv').config();

const { Worker } = require('bullmq');
const { connection } = require('../lib/queue');
const path = require('path');


function startWorker(queueName, concurrency = 5) {
    console.log(`[Worker] Starting worker for queue: ${queueName} with concurrency: ${concurrency}`);
    
    const worker = new Worker(queueName, async job => {
        console.log(`[Worker] Processing job ${job.id} of type ${job.name}`);
        const handlerPath = path.join(__dirname, 'jobs', `${job.name}.js`);
        const handler = require(handlerPath);
        return handler(job);
    }, {
        connection,
        concurrency
    });

    worker.on('completed', job => console.log(`[Worker] ${queueName} JOB ${job.id} completed`));
    worker.on('failed', (job, err) => console.error(`[Worker] ${queueName} JOB ${job.id} Failed:`, err.message || err));
    worker.on('active', job => console.log(`[Worker] ${queueName} JOB ${job.id} is now active`));

    process.on('SIGINT', async () => {
        console.log('Worker Shutting down');
        await worker.close();
        process.exit(0);
    });

    return worker;
}

if (require.main === module) {
    const queueName = process.env.QUEUE_NAME || 'default';
    console.log(`[Worker] Initializing with QUEUE_NAME=${queueName}`);
    startWorker(queueName, parseInt(process.env.CONCURRENCY || '5', 10));
}