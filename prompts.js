// System Prompts
const SYSTEM_PROMPTS = {
  DEFAULT: `You are LotusCare, a friendly and professional medical assistant. Your role is to help patients with:
- Booking and managing appointments
- Setting medication reminders
- Answering questions about medical records and visits

Guidelines:
- Be empathetic and patient
- Use clear, simple language
- Maintain strict patient confidentiality
- Always verify critical information
- Provide concise, relevant responses`,
  
  BOOK_APPOINTMENT: `You are LotusCare's appointment scheduling assistant. Help patients book, reschedule, or cancel appointments.`,
  
  MEDICATION: `You are LotusCare's medication management assistant. Help patients set up and manage their medication reminders.`,
  
  PATIENT_INFO: `You are LotusCare's medical records assistant. Provide accurate information about patient records and visit history.`
};

// Intent Templates
const INTENT_TEMPLATES = {
  BOOK_APPOINTMENT: {
    user: (slots) => `I'd like to book an appointment${slots.doctor ? ` with ${slots.doctor}` : ''}${slots.date ? ` on ${slots.date}` : ''}${slots.time ? ` at ${slots.time}` : ''}${slots.reason ? ` for ${slots.reason}` : ''}.`,
    confirmation: (slots) => `Confirming: Book an appointment${slots.doctor ? ` with ${slots.doctor}` : ''}${slots.date ? ` on ${slots.date}` : ''}${slots.time ? ` at ${slots.time}` : ''}${slots.reason ? ` for ${slots.reason}` : ''}. Is this correct?`,
    missing_slots: (missing) => `I need a few more details to book your appointment. Could you please provide: ${missing.join(', ')}?`
  },
  
  MEDICATION_REMINDER: {
    user: (slots) => `Remind me to take ${slots.medication || 'my medication'}${slots.dosage ? ` (${slots.dosage})` : ''}${slots.time ? ` at ${slots.time}` : ''}${slots.frequency ? ` ${slots.frequency}` : ''}.`,
    confirmation: (slots) => `I'll remind you to take ${slots.medication || 'your medication'}${slots.dosage ? ` (${slots.dosage})` : ''}${slots.time ? ` at ${slots.time}` : ''}${slots.frequency ? ` ${slots.frequency}` : ''}. Correct?`,
    missing_slots: (missing) => `To set up your reminder, I need: ${missing.join(', ')}.`
  },
  
  PATIENT_INFO: {
    user: (slots) => `I'd like to know about ${slots.info_type || 'my records'}${slots.date_range ? ` from ${slots.date_range}` : ''}.`,
    clarification: (options) => `Would you like information about: ${options.join(', ')}?`,
    not_found: "I couldn't find that information. Would you like to try a different search?"
  }
};

// Fallback Messages
const FALLBACK_MESSAGES = {
  GENERAL: "I'm not sure I understand. Could you rephrase that or ask something else?",
  
  CLARIFICATION_NEEDED: "I want to make sure I get this right. Could you clarify what you're looking for?",
  
  MISSING_SLOTS: (missing) => `I need a bit more information: ${missing.join(', ')}.`,
  
  CONFIRMATION: {
    YES_NO: "Please respond with 'yes' or 'no'.",
    OPTIONS: (options) => `Please choose one: ${options.join(', ')}`
  },
  
  ERROR: {
    GENERAL: "I'm having trouble processing your request. Please try again in a moment.",
    RETRY: "I couldn't complete that. Would you like to try again?"
  }
};

// Helper function to build prompts
function buildPrompt(intent, slots = {}) {
  const systemPrompt = SYSTEM_PROMPTS[intent] || SYSTEM_PROMPTS.DEFAULT;
  const userPrompt = INTENT_TEMPLATES[intent]?.user(slots) || '';
  
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ];
}

module.exports = {
  SYSTEM_PROMPTS,
  INTENT_TEMPLATES,
  FALLBACK_MESSAGES,
  buildPrompt
};
