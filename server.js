require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Proxy to Infermedica's /parse endpoint
app.post('/api/parse', async (req, res) => {
  const { text } = req.body;

  try {
    const apiResponse = await fetch('https://api.infermedica.com/v3/parse', {
      method: 'POST',
      headers: {
        'App-Id': process.env.INFERMEDICA_APP_ID,
        'App-Key': process.env.INFERMEDICA_APP_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ text, include_tokens: true })
    });

    const result = await apiResponse.json();
    res.json(result);
  } catch (error) {
    console.error('Error from Infermedica:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
