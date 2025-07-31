const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
// Increase payload limit to handle base64 images (up to 50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const apiRoutes = require('./routes');

app.use('/api', apiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BookStore backend is running.' });
});

module.exports = app; 