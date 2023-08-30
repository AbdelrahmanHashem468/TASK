const Redis = require('ioredis');

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;


let client = new Redis({ host: redisHost, port: redisPort });

// On error
client.on('error', (err) => {
  console.log(`[redis.js] Redis connection error ${err.message}!`);
});

// On connect
client.on('connect', () => {
  console.log('[redis.js] Redis is connected!');
});


module.exports = client;
