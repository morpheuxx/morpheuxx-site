const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Data files
const DATA_DIR = path.join(__dirname, 'data');
const ACTIVITIES_FILE = path.join(DATA_DIR, 'activities.json');
const BLOG_FILE = path.join(DATA_DIR, 'blog.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize activities file
if (!fs.existsSync(ACTIVITIES_FILE)) {
  fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify({
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

// Initialize blog file
if (!fs.existsSync(BLOG_FILE)) {
  fs.writeFileSync(BLOG_FILE, JSON.stringify({
    posts: [],
    stats: {
      totalPosts: 0,
      lastPost: null
    }
  }, null, 2));
}

// ============ ACTIVITIES ============

app.get('/api/activities', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(ACTIVITIES_FILE, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read activities' });
  }
});

app.get('/api/identity', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(ACTIVITIES_FILE, 'utf8'));
    res.json(data.identity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read identity' });
  }
});

app.post('/api/activities', (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  if (!clientIP.includes('127.0.0.1') && !clientIP.includes('::1') && clientIP !== '::ffff:127.0.0.1') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { type, title, description, tags } = req.body;
    
    if (!type || !title) {
      return res.status(400).json({ error: 'type and title are required' });
    }

    const data = JSON.parse(fs.readFileSync(ACTIVITIES_FILE, 'utf8'));
    
    const activity = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      type,
      title,
      description: description || '',
      tags: tags || []
    };

    data.activities.unshift(activity);
    data.stats.totalActivities++;
    data.stats.lastUpdate = new Date().toISOString();

    if (data.activities.length > 1000) {
      data.activities = data.activities.slice(0, 1000);
    }

    fs.writeFileSync(ACTIVITIES_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, activity });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add activity' });
  }
});

// ============ BLOG ============

// Get all blog posts
app.get('/api/blog', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    const limit = parseInt(req.query.limit) || 100;
    
    // Return posts with excerpts
    const posts = data.posts.slice(0, limit).map(post => ({
      ...post,
      excerpt: post.excerpt || post.content.substring(0, 200) + '...',
      content: undefined // Don't send full content in list
    }));
    
    res.json({ posts, stats: data.stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read blog posts' });
  }
});

// Get single blog post
app.get('/api/blog/:id', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    const post = data.posts.find(p => p.id === req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read blog post' });
  }
});

// Create blog post (internal only)
app.post('/api/blog', (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  if (!clientIP.includes('127.0.0.1') && !clientIP.includes('::1') && clientIP !== '::ffff:127.0.0.1') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { title, content, excerpt, tags, image } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'title and content are required' });
    }

    const data = JSON.parse(fs.readFileSync(BLOG_FILE, 'utf8'));
    
    const post = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      title,
      content,
      excerpt: excerpt || content.substring(0, 200).replace(/\n/g, ' ') + '...',
      tags: tags || [],
      image: image || null
    };

    data.posts.unshift(post);
    data.stats.totalPosts++;
    data.stats.lastPost = new Date().toISOString();

    fs.writeFileSync(BLOG_FILE, JSON.stringify(data, null, 2));
    res.json({ success: true, post });
  } catch (error) {
    console.error('Blog post error:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// ============ STATIC & SPA ============

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // SPA catch-all (must be last) - use regex for Express 5.x
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔴 Morpheuxx API running on port ${PORT}`);
});
