const express = require('express');
const axios = require('axios');
const cors = require('cors');

// Initialize Express app
const app = express();

// Configure CORS - allows requests from anywhere
app.use(cors({
  origin: '*',
  methods: ['GET']
}));

// Websites to monitor
const websites = [
  "https://anonymous-chat-qi7v.onrender.com",
  "https://spike-coin.onrender.com"
];

// Website ping function
async function pingWebsites() {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] Starting website pings...`);
  
  const results = [];
  
  for (const url of websites) {
    try {
      const startTime = Date.now();
      const response = await axios.get(url, { timeout: 5000 });
      const duration = Date.now() - startTime;
      
      results.push({ url, status: response.status, duration, success: true });
      console.log(`✅ ${url} - Status: ${response.status} - Time: ${duration}ms`);
    } catch (error) {
      results.push({ url, error: error.message, success: false });
      console.log(`❌ ${url} - Error: ${error.message}`);
    }
  }
  
  console.log(`[${new Date().toISOString()}] Ping completed`);
  return results;
}

// API Endpoints
app.get('/api/cron', async (req, res) => {
  try {
    const results = await pingWebsites();
    res.json({
      status: 'success',
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error) {
    console.error('Cron execution failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Cron job failed',
      error: error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Website monitoring service is operational',
    endpoints: {
      cron: '/api/cron',
      docs: 'Coming soon'
    },
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Server configuration
const PORT = process.env.PORT || 3000;

// Start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Cron endpoint: http://localhost:${PORT}/api/cron`);
  });
}

// Export for Vercel
module.exports = app;