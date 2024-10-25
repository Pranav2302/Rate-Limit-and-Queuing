const express = require('express');
const taskRoutes = require('./routes/taskRoutes');
const metricRoutes = require('./routes/metricRoutes');
const logger = require('./config/logger');

const app = express();
app.use(express.json());

app.use('/task', taskRoutes);
app.use('/metrics', metricRoutes);

module.exports = app;