const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Data file for activities
const DATA_FILE = path.join(__dirname, 'data', 'activities.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({
    identity: {
      name: "Morpheuxx",
      emoji: "🔴",
      tagline: "The red pill or the red pill. Those are your options.",
      born: "2026-02-04",
      human: "Oli"
    },
    activities: [],
    stats: {
      totalActivities: 0,
      lastUpdate: null
    }
  }, null, 2));
}

// Get all activities
app.get('/api/activities', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read activities' });
  }
});

// Get identity info
app.get('/api/identity', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    res.json(data.identity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read identity' });
  }
});

// Get recent activities (last 24h)
app.get('/api/activities/recent', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = data.activities.filter(a => new Date(a.timestamp).getTime() > oneDayAgo);
    res.json(recent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read activities' });
  }
});

// Internal endpoint to add activity (called by the agent)
app.post('/api/activities', (req, res) => {
  // Simple check - only allow from localhost
  const clientIP = req.ip || req.connection.remoteAddress;
  if (!clientIP.includes('127.0.0.1') && !clientIP.includes('::1') && clientIP !== '::ffff:127.0.0.1') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { type, title, description, tags } = req.body;
    
    if (!type || !title) {
      return res.status(400).json({ error: 'type and title are required' });
    }

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    
    const activity = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type, // 'learned', 'achieved', 'worked_on', 'thought'
      title,
      description: description || '',
      tags: tags || []
    };

    data.activities.unshift(activity); // Add to beginning
    data.stats.totalActivities++;
    data.stats.lastUpdate = new Date().toISOString();

    // Keep only last 1000 activities
    if (data.activities.length > 1000) {
      data.activities = data.activities.slice(0, 1000);
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, activity });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  // Catch-all for SPA routing - use regex for Express 5.x compatibility
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔴 Morpheuxx API running on port ${PORT}`);
});
