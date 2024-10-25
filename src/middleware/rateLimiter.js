const redis = require('../config/redis');

const checkRateLimit = async (userId) => {
  const now = Date.now();
  const secondKey = `rateLimit:${userId}:second`;
  const minuteKey = `rateLimit:${userId}:minute`;

  const multi = redis.multi();
  multi.get(secondKey);
  multi.zremrangebyscore(minuteKey, '-inf', now - 60000);
  multi.zrange(minuteKey, 0, -1);
  
  const results = await multi.exec();
  
  if (results[0][1]) {
    const lastRequestTime = parseInt(results[0][1]);
    if (now - lastRequestTime < 1000) {
      return {
        allowed: false,
        reason: 'exceeds_per_second_limit',
        retryAfter: 1000 - (now - lastRequestTime)
      };
    }
  }

  const minuteRequests = results[2][1];
  if (minuteRequests && minuteRequests.length >= 20) {
    return {
      allowed: false,
      reason: 'exceeds_per_minute_limit',
      retryAfter: 60000 - (now - Math.min(...minuteRequests.map(Number)))
    };
  }

  await redis.multi()
    .set(secondKey, now, 'PX', 1000)
    .zadd(minuteKey, now, now.toString())
    .expire(minuteKey, 60)
    .exec();

  return { allowed: true };
};

module.exports = checkRateLimit;