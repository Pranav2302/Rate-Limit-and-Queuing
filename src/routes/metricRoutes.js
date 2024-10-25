const express = require('express');
const router = express.Router();
const redis = require('../config/redis');

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const now = Date.now();
    const minuteKey = `rateLimit:${userId}:minute`;
    const secondKey = `rateLimit:${userId}:second`;

    const [minuteRequests, lastRequest] = await Promise.all([
      redis.zrange(minuteKey, 0, -1),
      redis.get(secondKey)
    ]);

    res.json({
      userId,
      currentTime: now,
      requestsInLastMinute: minuteRequests.length,
      lastRequestTime: lastRequest ? parseInt(lastRequest) : null,
      canMakeRequest: {
        perSecond: !lastRequest || (now - parseInt(lastRequest) >= 1000),
        perMinute: minuteRequests.length < 20
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;