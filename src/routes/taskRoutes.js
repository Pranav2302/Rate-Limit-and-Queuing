const express = require('express');
const router = express.Router();
const taskQueue = require('../config/queue');
const checkRateLimit = require('../middleware/rateLimiter');
const logger = require('../config/logger');

router.post('/', async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const rateLimitCheck = await checkRateLimit(user_id);
    
    const jobOptions = {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    };

    if (!rateLimitCheck.allowed) {
      const job = await taskQueue.add(
        { userId: user_id },
        { 
          ...jobOptions,
          delay: rateLimitCheck.retryAfter
        }
      );

      return res.json({ 
        message: 'Task queued with delay',
        reason: rateLimitCheck.reason,
        retryAfter: rateLimitCheck.retryAfter,
        jobId: job.id
      });
    }

    const job = await taskQueue.add({ userId: user_id }, jobOptions);

    res.json({ 
      message: 'Task queued successfully',
      jobId: job.id
    });
  } catch (error) {
    logger.error('Error queuing task:', error);
    res.status(500).json({ error: 'Failed to queue task' });
  }
});

module.exports = router;