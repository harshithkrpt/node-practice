// db/redis.js
const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL
});

// only auto-connect in non-test environments
if (process.env.NODE_ENV !== 'test') {
  client.connect().then(() => {
    console.log('Connected to Redis');
  }).catch(err => {
    console.error('Redis connection error', err);
  });
}

module.exports = client;
