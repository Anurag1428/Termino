import axios from 'axios';
import { createLogger } from '../logger.js';

const logger = createLogger('ai-service');

class AIService {
  constructor(apiKey, baseURL = 'https://api.moonshot.cn/v1') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async explainCommand(command) {
    try {
      const prompt = `Explain this terminal command in simple terms for a beginner: "${command}"
      
Please provide:
1. What this command does
2. Break down each part if it has options/flags
3. When you might use it
4. Any safety warnings if needed

Keep the explanation friendly and beginner-friendly.`;

      const response = await this.client.post('/chat/completions', {
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly terminal instructor helping beginners learn command line. Always explain things simply and encourage learning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.warning('Error explaining command:', error.message);
      return 'Sorry, I couldn\'t explain that command right now. Please try again later.';
    }
  }

  async suggestCommand(description) {
    try {
      const prompt = `A beginner wants to: "${description}"
      
Please suggest the best terminal command(s) and explain:
1. The exact command to type
2. What it will do
3. Step by step if needed
4. Any prerequisites or safety notes

Be encouraging and helpful!`;

      const response = await this.client.post('/chat/completions', {
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful terminal assistant. Suggest safe, appropriate commands for beginners and always explain what they do.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.warning('Error suggesting command:', error.message);
      return 'Sorry, I couldn\'t suggest a command right now. Please try again later.';
    }
  }

  async explainError(command, errorOutput) {
    try {
      const prompt = `A beginner ran this command: "${command}"
      
And got this error: "${errorOutput}"

Please explain:
1. What went wrong in simple terms
2. How to fix it
3. What to try next

Be supportive and educational!`;

      const response = await this.client.post('/chat/completions', {
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: 'You are a patient terminal instructor helping beginners understand and fix errors. Always be encouraging.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.warning('Error explaining error:', error.message);
      return 'Sorry, I couldn\'t explain that error right now. Please try again later.';
    }
  }
}

export { AIService };