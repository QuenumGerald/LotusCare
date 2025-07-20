const { buildPrompt, INTENT_TEMPLATES, FALLBACK_MESSAGES } = require('./prompts');
const axios = require('axios');
require('dotenv').config();

async function testPrompt(intent, slots = {}) {
  try {
    const messages = buildPrompt(intent, slots);
    
    console.log('\n=== Sending to API ===');
    console.log('System:', messages[0].content);
    console.log('User:', messages[1].content);
    
    const response = await callDeepSeekAPI(messages);
    console.log('\n=== API Response ===');
    console.log(response.choices[0].message.content);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function callDeepSeekAPI(messages) {
  const response = await axios.post(
    'https://api.gmi-serving.com/v1/chat/completions',
    {
      model: "deepseek-ai/DeepSeek-R1-0528",
      messages: messages,
      temperature: 0.3,
      max_tokens: 200
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEESEEK_API_KEY}`
      }
    }
  );
  
  return response.data;
}

// Example usage
async function runExamples() {
  console.log('\n=== Testing Book Appointment ===');
  await testPrompt('BOOK_APPOINTMENT', {
    doctor: 'Dr. Smith',
    date: 'tomorrow',
    time: '2 PM',
    reason: 'annual checkup'
  });

  console.log('\n=== Testing Missing Slots ===');
  const missingSlots = ['doctor', 'time'];
  console.log(FALLBACK_MESSAGES.MISSING_SLOTS(missingSlots));
  
  console.log('\n=== Testing Confirmation ===');
  console.log(INTENT_TEMPLATES.BOOK_APPOINTMENT.confirmation({
    doctor: 'Dr. Smith',
    date: 'tomorrow',
    time: '2 PM',
    reason: 'annual checkup'
  }));
}

runExamples();
