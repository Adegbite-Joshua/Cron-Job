const express = require('express');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
const PORT = process.env.PORT || 3000;

// List of websites to ping (including self)
const websites = [
    "https://cron-job-3rcf.onrender.com",
    "https://anonymous-chat-lasc.onrender.com",
    "https://spike-coin.onrender.com"
];

// Function to make requests to all websites
async function pingWebsites() {
    console.log(`[${new Date().toISOString()}] Starting to ping websites...`);
    
    for (const url of websites) {
        try {
            const startTime = Date.now();
            const response = await axios.get(url, { timeout: 5000 });
            const duration = Date.now() - startTime;
            
            console.log(`✅ ${url} - Status: ${response.status} - Time: ${duration}ms`);
        } catch (error) {
            console.log(`❌ ${url} - Error: ${error.message}`);
        }
    }
    
    console.log(`[${new Date().toISOString()}] Finished pinging websites\n`);
}

// Schedule the pinging every 10 minutes
cron.schedule('*/10 * * * *', pingWebsites);

// Basic route for self-ping
app.get('/', (req, res) => {
    res.send('Hello from the self-ping endpoint!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
    // Initial ping when server starts
    pingWebsites();
});