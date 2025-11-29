import axios from 'axios';
import logger from '../utils/logger.js';

const OPENAI_API_URL = 'https://api.openai.com/v1';

// Track if we've logged the API key status
let apiKeyLogged = false;
let mockModeLogged = false;

// Lazy evaluation: Check API key when functions are called, not at module load
function getHeaders() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  return OPENAI_API_KEY
    ? {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      }
    : { 'Content-Type': 'application/json' };
}

// Flag to use mock mode if no API key - evaluated at runtime
function useMockMode() {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const useMock = !OPENAI_API_KEY;
  
  if (useMock) {
    if (!mockModeLogged) {
      logger.warn('⚠️  No OpenAI API key found. Using mock responses.');
      logger.warn('To use REAL AI analysis, add OPENAI_API_KEY to .env file');
      mockModeLogged = true;
    }
  } else {
    if (!apiKeyLogged) {
      logger.info('✅ OpenAI API key loaded. Using real AI models.');
      logger.info(`API Key: ${process.env.OPENAI_API_KEY.substring(0, 10)}...`);
      apiKeyLogged = true;
    }
  }
  
  return useMock;
}

// Rate limiting
const callQueue = [];
const MAX_CONCURRENT = 3;
let activeRequests = 0;

async function executeWithRateLimit(fn) {
  return new Promise((resolve) => {
    callQueue.push({ fn, resolve });
    processQueue();
  });
}

async function processQueue() {
  while (activeRequests < MAX_CONCURRENT && callQueue.length > 0) {
    activeRequests++;
    const { fn, resolve } = callQueue.shift();
    try {
      const result = await fn();
      resolve(result);
    } catch (error) {
      resolve(null);
      logger.error('OpenAI API call failed', { error: error.message });
    } finally {
      activeRequests--;
      processQueue();
    }
  }
}

export async function generateEmbedding(text, retries = 3) {
  if (useMockMode()) {
    // Return a mock embedding (1536-dimensional vector for OpenAI)
    return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
  }

  return executeWithRateLimit(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.post(
          `${OPENAI_API_URL}/embeddings`,
          {
            input: text,
            model: 'text-embedding-3-small',
          },
          { headers: getHeaders(), timeout: 15000 }
        );
        logger.info('✅ Embedding generated successfully (REAL AI)');
        return response.data.data[0].embedding || [];
      } catch (error) {
        const status = error.response?.status;
        const isRateLimit = status === 429;
        const wait = Math.pow(2, i) * (isRateLimit ? 3000 : 500);
        
        logger.warn(`Embedding attempt ${i + 1} failed`, { 
          error: error.message,
          status,
          rateLimited: isRateLimit
        });
        
        if (i === retries - 1) {
          logger.warn('⏱️ OpenAI API timeout - using mock embedding fallback');
          return Array(1536).fill(0).map(() => Math.random() * 2 - 1);
        }
        
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  });
}

export async function generateMultilingualEmbedding(text) {
  // OpenAI embeddings handle multiple languages natively
  return generateEmbedding(text);
}

export async function classifyText(text, labels = ['fear', 'anger', 'neutral'], retries = 3) {
  if (useMockMode()) {
    // Return mock classification
    return { labels, scores: labels.map((_, i) => i === 2 ? 0.7 : 0.15) };
  }

  return executeWithRateLimit(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        const prompt = `Classify the following text into one of these categories: ${labels.join(', ')}. Return only the category name and confidence score (0-1).

Text: "${text}"

Format: CATEGORY,CONFIDENCE`;
        
        const response = await axios.post(
          `${OPENAI_API_URL}/chat/completions`,
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a text classification expert. Classify text into emotional or sentiment categories.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 50,
          },
          { headers: getHeaders(), timeout: 10000 }
        );
        
        const result = response.data.choices[0].message.content.trim();
        const [category, score] = result.split(',');
        const confidence = parseFloat(score) || 0.5;
        
        logger.info('✅ Text classification successful (REAL AI)');
        return {
          labels: [category.toLowerCase().trim() || labels[0]],
          scores: [Math.min(1, Math.max(0, confidence))]
        };
      } catch (error) {
        const status = error.response?.status;
        const isRateLimit = status === 429;
        const wait = Math.pow(2, i) * (isRateLimit ? 3000 : 500);
        
        logger.warn(`Classification attempt ${i + 1} failed`, { 
          error: error.message,
          status,
          rateLimited: isRateLimit
        });
        
        if (i === retries - 1) {
          logger.warn('⏱️ OpenAI API timeout - using fallback');
          return { labels: ['neutral'], scores: [1] };
        }
        
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  });
}

export async function detectToxicity(text, retries = 3) {
  if (useMockMode()) {
    // Return mock toxicity score
    return Math.random() * 0.3; // 0-30% toxicity
  }

  return executeWithRateLimit(async () => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.post(
          `${OPENAI_API_URL}/chat/completions`,
          {
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: 'You are a content moderation expert. Rate the toxicity of text on a scale of 0-1.'
              },
              {
                role: 'user',
                content: `Rate the toxicity (0-1) of this text. Return only a decimal number:\n\n"${text}"`
              }
            ],
            temperature: 0.2,
            max_tokens: 10,
          },
          { headers: getHeaders(), timeout: 10000 }
        );
        
        const score = parseFloat(response.data.choices[0].message.content.trim());
        const toxicityScore = isNaN(score) ? 0 : Math.min(1, Math.max(0, score));
        
        logger.info('✅ Toxicity detection successful (REAL AI)');
        return toxicityScore;
      } catch (error) {
        const status = error.response?.status;
        const isRateLimit = status === 429;
        const wait = Math.pow(2, i) * (isRateLimit ? 3000 : 500);
        
        logger.warn(`Toxicity detection attempt ${i + 1} failed`, { 
          error: error.message,
          status,
          rateLimited: isRateLimit
        });
        
        if (i === retries - 1) {
          logger.warn('⏱️ OpenAI API timeout - using fallback');
          return 0;
        }
        
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  });
}

export async function analyzeImageForManipulation(imageUrl) {
  if (useMockMode()) {
    return Math.random() * 0.5; // 0-50% AI-generated likelihood
  }

  return executeWithRateLimit(async () => {
    try {
      const response = await axios.post(
        `${OPENAI_API_URL}/chat/completions`,
        {
          model: 'gpt-4-vision',
          messages: [
            {
              role: 'system',
              content: 'You are an image analysis expert. Analyze images for signs of AI generation or manipulation. Return a confidence score (0-1).'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Rate the likelihood (0-1) that this image is AI-generated or heavily manipulated. Return only a decimal number.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          temperature: 0.2,
          max_tokens: 10,
        },
        { headers: getHeaders(), timeout: 30000 }
      );
      
      const score = parseFloat(response.data.choices[0].message.content.trim());
      const manipulationScore = isNaN(score) ? 0 : Math.min(1, Math.max(0, score));
      
      logger.info('✅ Image analysis successful (REAL AI)');
      return manipulationScore;
    } catch (error) {
      logger.error('Image analysis failed', { error: error.message });
      return 0;
    }
  });
}

export default {
  generateEmbedding,
  generateMultilingualEmbedding,
  classifyText,
  detectToxicity,
  analyzeImageForManipulation,
};
