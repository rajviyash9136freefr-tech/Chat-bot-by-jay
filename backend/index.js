const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Initialize Database Tables
const initDb = async () => {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS conversations (
      id SERIAL PRIMARY KEY,
      title TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await db.query(createTablesQuery);
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

initDb();

// API endpoint to proxy chat requests and save to DB
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, conversationId } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    let activeConversationId = conversationId;

    // 1. If no conversationId, create a new one
    if (!activeConversationId) {
      const lastMessage = messages[messages.length - 1];
      const title = lastMessage.content.substring(0, 50) + '...';
      const convResult = await db.query(
        'INSERT INTO conversations (title) VALUES ($1) RETURNING id',
        [title]
      );
      activeConversationId = convResult.rows[0].id;
    }

    // 2. Save the latest user message
    const userMessage = messages[messages.length - 1];
    await db.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [activeConversationId, userMessage.role, userMessage.content]
    );

    // 3. Get AI response from OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'ChatGPT Clone'
      },
      body: JSON.stringify({
        model: 'google/gemma-2-9b-it:free',
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return res.status(response.status).json({ error: 'Failed to fetch from OpenRouter' });
    }

    const data = await response.json();
    const aiContent = data.choices[0].message.content;

    // 4. Save AI message
    await db.query(
      'INSERT INTO messages (conversation_id, role, content) VALUES ($1, $2, $3)',
      [activeConversationId, 'assistant', aiContent]
    );

    // Return the response along with common metadata
    res.json({
      ...data,
      conversationId: activeConversationId
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET all conversations
app.get('/api/conversations', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM conversations ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET specific conversation history
app.get('/api/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await db.query(
      'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
      [id]
    );
    res.json(history.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
