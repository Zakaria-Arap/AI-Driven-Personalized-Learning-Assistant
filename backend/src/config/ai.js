require('dotenv').config();

module.exports = {
  provider: process.env.AI_PROVIDER || 'mock', // 'mock' | 'anthropic'
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: process.env.AI_MODEL || '',
  dailyMessageLimit: Number(process.env.AI_DAILY_MESSAGE_LIMIT || 40),
  maxTokens: 500,
  hintLevels: 5,
};
