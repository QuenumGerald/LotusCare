require('dotenv').config();
const axios = require('axios');

async function testDeepSeekAPI() {
  try {
    const response = await axios.post(
      'https://api.gmi-serving.com/v1/chat/completions',
      {
        model: "deepseek-ai/DeepSeek-R1-0528",
        messages: [
          {"role": "system", "content": "You are a helpful assistant"},
          {"role": "user", "content": "ping"}
        ],
        temperature: 0,
        max_tokens: 5
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEESEEK_API_KEY}`
        }
      }
    );
    
    console.log('API Response:', response.data);
  } catch (error) {
    console.error('Error making API call:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

testDeepSeekAPI();
