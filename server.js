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

// Google Calendar API
const { google } = require('googleapis');
const calendar = google.calendar('v3');
const SERVICE_ACCOUNT_FILE = './service-account.json'; // Chemin vers la clé du compte de service

async function insertCalendarEvent(patient_name, appointment_time, symptoms) {
  // Calcul de la fin (+30min)
  const start = new Date(appointment_time);
  const end = new Date(start.getTime() + 30 * 60000);

  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_FILE,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  const authClient = await auth.getClient();

  const event = {
    summary: `Medical appointment`,
    description: symptoms ? `Symptoms described by the patient: ${symptoms}` : undefined,
    start: { dateTime: start.toISOString(), timeZone: 'Europe/Paris' },
    end: { dateTime: end.toISOString(), timeZone: 'Europe/Paris' },
  };

  const response = await calendar.events.insert({
    auth: authClient,
    calendarId: 'kquenum@gmail.com',
    resource: event,
  });
  return response.data;
}

// Endpoint pour créer un événement
app.post('/lotuscare/calendar', async (req, res) => {
  console.log('BODY:', req.body);
  if (!req.body) {
    return res.status(400).json({ success: false, error: 'Empty body!' });
  }
  const { patient_name, appointment_time, symptoms } = req.body;
  try {
    const event = await insertCalendarEvent(patient_name, appointment_time, symptoms);
    console.log('Calendar event created:', event);
    res.json({ success: true, event });
  } catch (error) {
    console.error('Calendar error:', error);
    res.status(500).json({ success: false, error: error.message });
    console.log('Calendar error response sent:', error.message);
  }
});




// Proxy to GMI DeepSeek API
app.post('/api/chat', async (req, res) => {
  // Log détaillé de la requête reçue
  console.log('POST /api/chat', JSON.stringify(req.body, null, 2));
  const { messages, systemPrompt, temperature = 0.3, max_tokens = 200 } = req.body;
  try {
    const response = await axios.post(
      'https://api.gmi-serving.com/v1/chat/completions',
      {
        model: "Qwen/Qwen3-32B-FP8",
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
    console.log('[DeepSeek API response]', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('Error from GMI API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Internal Server Error', details: error.response?.data });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
