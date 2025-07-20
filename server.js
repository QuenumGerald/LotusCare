require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy to GMI DeepSeek API
app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt, temperature = 0.3, max_tokens = 200 } = req.body;
  try {
    const response = await axios.post(
      'https://api.gmi-serving.com/v1/chat/completions',
      {
        model: "deepseek-ai/DeepSeek-R1-0528",
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          ...messages
        ],
        temperature,
        max_tokens
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEESEEK_API_KEY}`
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error from GMI API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.response?.data });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
