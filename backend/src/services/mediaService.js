import axios from 'axios';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Get OpenAI API key
function getOpenAIKey() {
  return process.env.OPENAI_API_KEY;
}

// Convert image to base64
function imageToBase64(imagePath) {
  try {
    const absolutePath = path.resolve(imagePath);
    const imageBuffer = fs.readFileSync(absolutePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Detect mime type from extension
    const ext = path.extname(imagePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    const mimeType = mimeTypes[ext] || 'image/jpeg';
    
    return { base64Image, mimeType };
  } catch (error) {
    logger.error('Failed to convert image to base64', { error: error.message, imagePath });
    throw error;
  }
}

// Comprehensive image analysis with person/object identification
export async function extractOCRText(imagePath) {
  const OPENAI_API_KEY = getOpenAIKey();
  
  if (!OPENAI_API_KEY) {
    logger.warn('No OpenAI API key - cannot analyze image');
    return { text: '', fullAnalysis: null };
  }
  
  try {
    logger.info('Starting comprehensive OpenAI Vision analysis', { imagePath });
    
    // Convert image to base64
    const { base64Image, mimeType } = imageToBase64(imagePath);
    
    // Step 1: Deep image analysis - identify everything
    const analysisResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert fact-checker and image analyst. Analyze this image thoroughly for fact-checking purposes.

Your task:
1. IDENTIFY ALL PEOPLE: Recognize any public figures, celebrities, politicians, or notable individuals. If you recognize someone, state their name and who they are.
2. IDENTIFY ALL OBJECTS: Describe all significant objects, logos, brands, documents, signs, etc.
3. READ ALL TEXT: Extract every piece of text visible in the image - headlines, captions, watermarks, signs, documents.
4. ANALYZE THE SCENE: Where was this taken? What event? What's happening?
5. IDENTIFY THE CLAIM: What claim or statement is this image trying to make or support?
6. CHECK FOR MANIPULATION: Look for signs of editing, photoshop, AI generation, or out-of-context usage.
7. PROVIDE FACT-CHECK CONTEXT: What do you know about this image, these people, or this event that's relevant for fact-checking?

Respond in this exact JSON format:
{
  "people": [
    {
      "name": "Person's name if recognized, or 'Unknown person'",
      "role": "Their role/title/why they're notable",
      "confidence": "high/medium/low",
      "description": "Physical description and what they're doing"
    }
  ],
  "objects": ["List of significant objects, logos, signs identified"],
  "extractedText": "ALL visible text from the image, exactly as written",
  "scene": {
    "location": "Where this appears to be",
    "event": "What event or situation this depicts",
    "timeframe": "When this appears to be from (if determinable)"
  },
  "imageDescription": "Comprehensive description of what the image shows",
  "mainClaim": "The main claim or narrative this image is trying to convey",
  "factCheckContext": "Important background information for fact-checking this image",
  "knownFacts": ["Verified facts about the people/event/situation shown"],
  "concerns": ["Red flags, signs of manipulation, or reasons for skepticism"],
  "verificationSuggestions": ["Steps to verify this image's authenticity or claims"]
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this image completely for fact-checking. Identify all people (especially public figures), read all text, describe the scene, and provide context for verification. Be specific about who you recognize and what you know about them.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 90000
      }
    );
    
    const content = analysisResponse.data.choices[0].message.content;
    logger.info('OpenAI Vision deep analysis complete', { responseLength: content?.length });
    
    // Parse the JSON response
    let analysis = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      logger.warn('Failed to parse analysis JSON', { error: parseError.message });
      // Create a basic analysis from raw content
      analysis = {
        people: [],
        objects: [],
        extractedText: content,
        scene: { location: 'Unknown', event: 'Unknown', timeframe: 'Unknown' },
        imageDescription: content,
        mainClaim: '',
        factCheckContext: '',
        knownFacts: [],
        concerns: [],
        verificationSuggestions: []
      };
    }
    
    // Build comprehensive claim text
    let claimText = '';
    
    // Add identified people to the claim
    if (analysis.people && analysis.people.length > 0) {
      const peopleNames = analysis.people
        .filter(p => p.name && p.name !== 'Unknown person')
        .map(p => `${p.name}${p.role ? ` (${p.role})` : ''}`);
      
      if (peopleNames.length > 0) {
        claimText += `People identified: ${peopleNames.join(', ')}. `;
      }
    }
    
    // Add the main claim
    if (analysis.mainClaim) {
      claimText += analysis.mainClaim;
    } else if (analysis.imageDescription) {
      claimText += analysis.imageDescription;
    }
    
    // Add extracted text if it adds value
    if (analysis.extractedText && analysis.extractedText.length > 10) {
      if (!claimText.includes(analysis.extractedText.substring(0, 50))) {
        claimText += ` Text in image: "${analysis.extractedText}"`;
      }
    }
    
    const fullAnalysis = {
      people: analysis.people || [],
      objects: analysis.objects || [],
      extractedText: analysis.extractedText || '',
      scene: analysis.scene || {},
      imageDescription: analysis.imageDescription || '',
      mainClaim: analysis.mainClaim || '',
      factCheckContext: analysis.factCheckContext || '',
      knownFacts: analysis.knownFacts || [],
      concerns: analysis.concerns || [],
      verificationSuggestions: analysis.verificationSuggestions || []
    };
    
    logger.info('Image analysis complete', {
      peopleIdentified: fullAnalysis.people.length,
      objectsFound: fullAnalysis.objects.length,
      hasMainClaim: !!fullAnalysis.mainClaim,
      concernsCount: fullAnalysis.concerns.length
    });
    
    return {
      text: claimText.trim(),
      fullAnalysis
    };
    
  } catch (error) {
    logger.error('OpenAI Vision analysis failed', { 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data 
    });
    return { text: '', fullAnalysis: null };
  }
}

// Search for information about identified people/topics using OpenAI
export async function searchContextInfo(people, mainClaim, imageDescription) {
  const OPENAI_API_KEY = getOpenAIKey();
  
  if (!OPENAI_API_KEY) {
    return null;
  }
  
  try {
    // Build a search query from identified elements
    const searchTerms = [];
    
    if (people && people.length > 0) {
      people.forEach(p => {
        if (p.name && p.name !== 'Unknown person') {
          searchTerms.push(p.name);
        }
      });
    }
    
    if (searchTerms.length === 0 && !mainClaim) {
      return null;
    }
    
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a fact-checking research assistant. Based on the image analysis provided, give relevant background information that would help verify or debunk claims related to this image.

Provide factual, verified information about:
- The people mentioned (their actual positions, recent activities, verified statements)
- Common misinformation or hoaxes involving these people
- Context about the events or situations depicted
- How to verify if this image/claim is authentic

Respond in JSON format:
{
  "peopleInfo": [
    {
      "name": "Person name",
      "verifiedFacts": ["Fact 1", "Fact 2"],
      "commonMisinformation": ["Known hoax 1", "False claim 2"],
      "relevantContext": "Additional context"
    }
  ],
  "claimAnalysis": {
    "likelyVerdict": "true/false/misleading/unverified",
    "confidence": "high/medium/low",
    "reasoning": "Why this verdict"
  },
  "verificationSteps": ["Step 1", "Step 2"],
  "similarHoaxes": ["Description of similar known hoaxes if any"]
}`
          },
          {
            role: 'user',
            content: `Research context for fact-checking:
            
People identified: ${searchTerms.join(', ') || 'None specifically identified'}
Main claim: ${mainClaim || 'No specific claim'}
Image description: ${imageDescription || 'No description'}

Provide verified information to help fact-check this.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );
    
    const content = response.data.choices[0].message.content;
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      logger.warn('Failed to parse context search results');
    }
    
    return null;
  } catch (error) {
    logger.error('Context search failed', { error: error.message });
    return null;
  }
}

export async function detectManipulation(imagePath) {
  // Stub for manipulation detection using lightweight heuristics
  try {
    // In production, integrate with a vision model like CLIP or specialized deepfake detectors
    // For now, we simulate with mock scores based on file characteristics

    const manipulationScore = Math.random() * 0.3; // Mock: 0-0.3 baseline
    const deepfakeDetected = manipulationScore > 0.25;
    const artifacts = [];

    if (manipulationScore > 0.15) {
      artifacts.push('Compression anomalies detected');
    }

    if (deepfakeDetected) {
      artifacts.push('Possible deepfake indicators');
    }

    return {
      manipulationScore,
      deepfakeDetected,
      artifacts,
    };
  } catch (error) {
    logger.error('Manipulation detection failed', { error: error.message });
    return {
      manipulationScore: 0,
      deepfakeDetected: false,
      artifacts: [],
    };
  }
}

export async function reverseImageSearch(imagePath, ocrText) {
  // Stub for reverse image search
  // In production, integrate with TinEye, Google Images API, or similar

  try {
    // Simulate finding reverse image matches
    const mockResults = [
      {
        url: 'https://example-news.com/article-2023-01.jpg',
        firstSeen: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        similarity: 0.92,
        source: 'news-outlet',
      },
      {
        url: 'https://twitter.com/user/status/123456789',
        firstSeen: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        similarity: 0.85,
        source: 'social-media',
      },
    ];

    return mockResults;
  } catch (error) {
    logger.error('Reverse image search failed', { error: error.message });
    return [];
  }
}

export default {
  extractOCRText,
  detectManipulation,
  reverseImageSearch,
};
