const {Queue, Worker} = require('bullmq');
const IORedis = require('ioredis');

const connection =  new IORedis(process.env.REDIS_URL, {
        maxRetriesPerRequest: null
});

function makeQueue(name) {
    return new Queue(name, { 
        connection
     });
}

module.exports = {
    connection, 
    makeQueue,
    Worker
};

