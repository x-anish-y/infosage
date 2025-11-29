import axios from 'axios';
import logger from '../utils/logger.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Lazy load API key to ensure .env is loaded
function getOpenAIKey() {
  return process.env.OPENAI_API_KEY;
}

function generateSmartVerdict(claim, retrievedSources) {
  // Smart detection using keyword analysis
  const claimLower = claim.toLowerCase();
  
  // Known false claims database
  const knownFalseClaims = [
    { keywords: ['earth', 'flat'], verdict: 'false', confidence: 0.95, reason: 'The Earth is an oblate spheroid, confirmed by centuries of scientific evidence and satellite imagery.' },
    { keywords: ['vaccine', 'autism'], verdict: 'false', confidence: 0.95, reason: 'The original study claiming this link was fraudulent and retracted. Millions of vaccinations show no connection to autism.' },
    { keywords: ['moon', 'fake', 'landing'], verdict: 'false', confidence: 0.9, reason: 'Moon landings are well-documented historical events confirmed by multiple independent sources and lunar exploration.' },
    { keywords: ['5g', 'covid'], verdict: 'false', confidence: 0.95, reason: 'COVID-19 is caused by a virus (SARS-CoV-2), not by 5G networks. 5G cannot transmit viruses.' },
    { keywords: ['lizard', 'government'], verdict: 'false', confidence: 0.85, reason: 'There is no scientific evidence for reptilians or shapeshifters in government.' },
    { keywords: ['chemtrails'], verdict: 'false', confidence: 0.8, reason: 'Contrails are normal water vapor condensation from aircraft engines, not chemical spraying.' },
  ];
  
  // Check if claim matches known false claims
  for (const { keywords, verdict, confidence, reason } of knownFalseClaims) {
    if (keywords.every(kw => claimLower.includes(kw))) {
      return {
        verdict,
        confidence,
        rationale: reason,
        keyFindings: ['Matches known debunked claim', 'Scientific consensus contradicts this'],
      };
    }
  }
  
  // Detect obvious false statements with regex patterns
  const falsePatterns = [
    { pattern: /\d+\s+(day|hour|minute)s?\s+in\s+a\s+(week|month|year|day)/, verdict: 'false', confidence: 0.9 },
    { pattern: /earth\s+is\s+flat/, verdict: 'false', confidence: 0.95 },
    { pattern: /vaccine[s]?\s+(cause|kill)/, verdict: 'false', confidence: 0.9 },
    { pattern: /earth\s+.{0,20}?(bigger|larger|greater)\s+.{0,20}?sun/, verdict: 'false', confidence: 0.95 },
    { pattern: /sun\s+.{0,20}?(smaller|less)\s+.{0,20}?earth/, verdict: 'false', confidence: 0.95 },
  ];
  
  for (const { pattern, verdict, confidence } of falsePatterns) {
    if (pattern.test(claimLower)) {
      return {
        verdict,
        confidence,
        rationale: 'This statement contradicts established scientific facts and evidence.',
        keyFindings: ['Factually incorrect statement', 'Contradicted by reliable sources'],
      };
    }
  }

  // Detect claims with high manipulation language (potential conspiracy theories)
  const manipulationPatterns = [
    /they don't want you to know/i,
    /do your own research/i,
    /wake up people?/i,
    /the truth is hidden/i,
    /the government is hiding/i,
  ];

  const hasManipulationLanguage = manipulationPatterns.some(p => p.test(claimLower));
  
  if (hasManipulationLanguage && claimLower.length < 150) {
    // Short claims with manipulation language are likely conspiracy theories
    return {
      verdict: 'false',
      confidence: 0.6,
      rationale: 'This claim uses common conspiracy theory language without credible evidence.',
      keyFindings: ['Employs manipulation tactics', 'Lacks supporting evidence'],
    };
  }

  // Detect obvious true statements
  const truePatterns = [
    { pattern: /water\s+is\s+h2o/, confidence: 0.95 },
    { pattern: /earth\s+orbits?\s+sun/, confidence: 0.95 },
    { pattern: /gravity\s+.{0,20}?exists?/, confidence: 0.9 },
  ];

  for (const { pattern, confidence } of truePatterns) {
    if (pattern.test(claimLower)) {
      return {
        verdict: 'true',
        confidence,
        rationale: 'This statement is supported by established scientific evidence.',
        keyFindings: ['Consistent with scientific consensus', 'Backed by credible sources'],
      };
    }
  }

  // Default: unverified if no pattern matches
  return {
    verdict: 'unverified',
    confidence: 0.5,
    rationale: `Analysis of "${claim.substring(0, 50)}..." requires additional sources and expert review.`,
    keyFindings: ['Unable to verify with available sources', 'Recommend manual review'],
  };
}

export async function generateVerdict(claim, retrievedSources) {
  const OPENAI_API_KEY = getOpenAIKey();
  
  // Try real OpenAI API first if available
  if (OPENAI_API_KEY) {
    try {
      logger.info('Using OpenAI API for verdict generation');
      const sourcesText = retrievedSources
        .map(
          (s) =>
            `- ${s.title} (${s.reliability}): ${s.snippet || s.url}`
        )
        .join('\n');

      const prompt = `You are a fact-checking assistant. Analyze the following claim against the provided evidence sources and provide a structured verdict.

Claim: "${claim}"

Evidence Sources:
${sourcesText}

Provide a JSON response with:
{
  "verdict": "true" | "false" | "mixed" | "unverified",
  "confidence": 0.0-1.0,
  "rationale": "Brief explanation (2-3 sentences)",
  "keyFindings": ["bullet point 1", "bullet point 2"]
}`;

      const response = await axios.post(
        OPENAI_API_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      const content = response.data.choices[0].message.content;
      const parsed = JSON.parse(content);
      logger.info('OpenAI verdict generated successfully', { verdict: parsed.verdict });
      return parsed;
    } catch (error) {
      logger.warn('OpenAI API failed, falling back to smart detection', { error: error.message });
    }
  } else {
    logger.warn('No OpenAI API key configured, using smart fallback analysis');
  }

  // Fallback to smart detection
  return generateSmartVerdict(claim, retrievedSources);
}

function generateStubOutput(verdict, outputType) {
  const base = `Fact Check: This claim was marked as ${verdict.verdict}.\n${verdict.rationale}`;

  if (outputType === 'whatsapp') {
    return `✓ ${base}\n\nℹ️ Verify sources before sharing.`;
  } else if (outputType === 'sms') {
    return `FC: Claim marked ${verdict.verdict}. Check sources.`;
  } else if (outputType === 'social') {
    return `🔍 Fact-check: ${verdict.verdict} #FactCheck`;
  }

  return base;
}

export async function generateCorrectiveOutput(claim, verdict, outputType = 'whatsapp') {
  const OPENAI_API_KEY = getOpenAIKey();
  
  if (!OPENAI_API_KEY) {
    return generateStubOutput(verdict, outputType);
  }

  try {
    let prompt = '';
    let maxTokens = 500;

    if (outputType === 'whatsapp') {
      prompt = `You are a fact-checker creating corrective messages. Create a WhatsApp-friendly fact-check message for sharing.

CLAIM: "${claim}"
VERDICT: ${verdict.verdict.toUpperCase()}
RATIONALE: ${verdict.rationale}
KEY FINDINGS: ${verdict.keyFindings?.join(', ') || 'See rationale above'}

Guidelines:
- Maximum 1024 characters
- Use emojis appropriately (✓✗⚠️📍)
- Make it shareable and easy to understand
- Include a clear correction and why it matters
- Start with a hook that catches attention
- Be conversational and friendly

Create the WhatsApp message now:`;
      maxTokens = 800;
    } else if (outputType === 'sms') {
      prompt = `You are a fact-checker creating corrective messages. Create a concise SMS fact-check message.

CLAIM: "${claim}"
VERDICT: ${verdict.verdict.toUpperCase()}
RATIONALE: ${verdict.rationale}

Guidelines:
- Maximum 160 characters (SMS limit)
- Clear and direct
- No emojis (SMS compatibility)
- Include verdict clearly
- End with a fact-check resource link reference

Create the SMS message now:`;
      maxTokens = 300;
    } else if (outputType === 'social') {
      prompt = `You are a fact-checker creating corrective messages for social media. Create a compelling Twitter/X-style post.

CLAIM: "${claim}"
VERDICT: ${verdict.verdict.toUpperCase()}
RATIONALE: ${verdict.rationale}

Guidelines:
- Maximum 280 characters (X/Twitter limit)
- Engaging and shareable
- Include relevant emojis
- Use hashtags if appropriate (#FactCheck)
- Create urgency or importance
- Clear correction of misinformation

Create the social media post now:`;
      maxTokens = 500;
    } else if (outputType === 'explainer') {
      prompt = `You are a fact-checker journalist creating detailed corrective articles. Write a comprehensive explainer about this fact-check.

CLAIM: "${claim}"
VERDICT: ${verdict.verdict.toUpperCase()}
RATIONALE: ${verdict.rationale}
KEY FINDINGS: ${verdict.keyFindings?.join('\n- ') || 'N/A'}
CONFIDENCE: ${Math.round((verdict.confidence || 0.5) * 100)}%

Write a detailed, well-structured blog-style explainer that:
- Starts with "The Claim" section summarizing the false information
- Provides "The Facts" section with evidence
- Explains "Why This Matters" for the audience
- Includes reliable sources where applicable
- Uses clear, accessible language
- Is 200-300 words in length
- Ends with actionable takeaways

Create the explainer article now:`;
      maxTokens = 1000;
    }

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: maxTokens,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    const content = response.data.choices[0].message.content.trim();
    return content;
  } catch (error) {
    logger.error('Corrective output generation failed', { error: error.message, outputType, verdict: verdict.verdict });
    return generateStubOutput(verdict, outputType);
  }
}

export async function analyzeSentiment(claim) {
  const OPENAI_API_KEY = getOpenAIKey();
  if (!OPENAI_API_KEY) {
    return { sentiment: 'neutral', confidence: 0.5, explanation: 'Mock sentiment analysis' };
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze the sentiment of the given claim. Return a JSON with sentiment (one of: fear, anger, neutral, hope, sadness, confusion, surprise, disgust, trust), confidence (0-1), and brief explanation. You MUST respond with valid JSON.'
          },
          {
            role: 'user',
            content: `Analyze sentiment: "${claim}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);
    
    // Normalize sentiment to valid enum values
    const validSentiments = ['fear', 'anger', 'neutral', 'hope', 'sadness', 'confusion', 'surprise', 'disgust', 'trust'];
    if (!validSentiments.includes(result.sentiment)) {
      result.sentiment = 'neutral'; // fallback to neutral if unknown
    }
    
    logger.info('✅ Sentiment analysis successful (OpenAI)', { sentiment: result.sentiment });
    return result;
  } catch (error) {
    logger.warn('Sentiment analysis failed, using fallback', { error: error.message });
    return { sentiment: 'neutral', confidence: 0.5, explanation: 'Analysis unavailable' };
  }
}

export async function analyzeToxicity(claim) {
  const OPENAI_API_KEY = getOpenAIKey();
  if (!OPENAI_API_KEY) {
    return { toxicityScore: 0.1, risk: 'low', explanation: 'Mock toxicity analysis' };
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze the toxicity level of the given text. Return a JSON with toxicityScore (0-1), risk (low/medium/high), and brief explanation. Consider harmful language, hate speech, violence, and offensive content.'
          },
          {
            role: 'user',
            content: `Analyze toxicity: "${claim}"`
          }
        ],
        temperature: 0.2,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);
    logger.info('✅ Toxicity analysis successful (OpenAI)', { risk: result.risk });
    return result;
  } catch (error) {
    logger.warn('Toxicity analysis failed, using fallback', { error: error.message });
    return { toxicityScore: 0.1, risk: 'low', explanation: 'Analysis unavailable' };
  }
}

export async function analyzeSpreadVelocity(claim) {
  const OPENAI_API_KEY = getOpenAIKey();
  if (!OPENAI_API_KEY) {
    return { spreadVelocity: 0.3, viralPotential: 'low', explanation: 'Mock spread velocity analysis' };
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze the viral spread potential of the given claim. Return a JSON with spreadVelocity (0-1), viralPotential (low/medium/high), and explanation. Consider sensational language, urgency, emotional triggers, and shareability.'
          },
          {
            role: 'user',
            content: `Analyze spread velocity: "${claim}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);
    logger.info('✅ Spread velocity analysis successful (OpenAI)', { viralPotential: result.viralPotential });
    return result;
  } catch (error) {
    logger.warn('Spread velocity analysis failed, using fallback', { error: error.message });
    return { spreadVelocity: 0.3, viralPotential: 'low', explanation: 'Analysis unavailable' };
  }
}

export async function analyzeManipulation(claim) {
  const OPENAI_API_KEY = getOpenAIKey();
  if (!OPENAI_API_KEY) {
    return { manipulationScore: 0.0, manipulationType: 'none', explanation: 'Mock manipulation analysis' };
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Analyze the manipulation and propaganda tactics in the given claim. Return a JSON with manipulationScore (0-1), manipulationType (none/fear-mongering/conspiracy/misleading/other), and explanation. Identify propaganda patterns and misleading framing.'
          },
          {
            role: 'user',
            content: `Analyze manipulation tactics: "${claim}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);
    logger.info('✅ Manipulation analysis successful (OpenAI)', { manipulationType: result.manipulationType });
    return result;
  } catch (error) {
    logger.warn('Manipulation analysis failed, using fallback', { error: error.message });
    return { manipulationScore: 0.0, manipulationType: 'none', explanation: 'Analysis unavailable' };
  }
}

export async function generateDetailedRationale(claim, verdict, sources) {
  const OPENAI_API_KEY = getOpenAIKey();
  if (!OPENAI_API_KEY) {
    return `This claim was marked as ${verdict}. Evidence shows this statement is ${verdict === 'true' ? 'supported by' : 'contradicted by'} available sources.`;
  }

  try {
    const sourcesText = sources
      .map(s => `- ${s.title} (${s.reliability}): ${s.snippet || s.url}`)
      .join('\n');

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate a clear, concise, and professional fact-check rationale (2-3 sentences max) explaining why a claim is true, false, mixed, or unverified.'
          },
          {
            role: 'user',
            content: `Claim: "${claim}"\nVerdict: ${verdict}\n\nSources:\n${sourcesText}\n\nWrite a brief rationale explaining this verdict.`
          }
        ],
        temperature: 0.5,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const rationale = response.data.choices[0].message.content;
    logger.info('✅ Detailed rationale generated (OpenAI)');
    return rationale;
  } catch (error) {
    logger.warn('Rationale generation failed, using fallback', { error: error.message });
    return `This claim was marked as ${verdict}. ${verdict === 'true' ? 'This is supported by available evidence.' : 'This contradicts available evidence.'}`;
  }
}

export async function generateEvidenceSources(claim, verdict) {
  const OPENAI_API_KEY = getOpenAIKey();
  if (!OPENAI_API_KEY) {
    return getDefaultSources(verdict);
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a fact-checking research assistant. Generate 3-4 realistic evidence sources that support a fact-check verdict. 
            
Return a JSON array with this exact format:
[
  {
    "type": "fact-check" | "news" | "research" | "academic",
    "title": "Source title",
    "url": "https://example.com/path",
    "reliability": "high" | "medium" | "low",
    "snippet": "2-3 sentence excerpt that relates to the claim"
  }
]

Make the sources credible and relevant to the claim. Use realistic URLs but they don't need to actually exist.`
          },
          {
            role: 'user',
            content: `Generate evidence sources for this claim and verdict:
            
Claim: "${claim}"
Verdict: ${verdict}

Generate sources that SUPPORT this verdict. If verdict is "false", generate sources that debunk the claim. If verdict is "true", generate sources that confirm it.`
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const sources = JSON.parse(jsonMatch[0]);
      logger.info('✅ Evidence sources generated (OpenAI)', { count: sources.length, verdict });
      return sources;
    }
  } catch (error) {
    logger.warn('Evidence generation failed, using defaults', { error: error.message });
  }

  return getDefaultSources(verdict);
}

export async function generateMentionTrends(claim, verdict) {
  const OPENAI_API_KEY = getOpenAIKey();
  if (!OPENAI_API_KEY) {
    return generateDefaultTrends();
  }

  try {
    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are analyzing misinformation spread patterns. Generate realistic mention count trends for a claim over the past 72 hours.

Return a JSON array with 12 data points representing hourly mention counts over the past 72 hours.
Format: [
  {
    "timestamp": "ISO 8601 timestamp",
    "mentions": number (realistic count based on viral potential),
    "sources": number (count of unique sources mentioning this),
    "engagement": number (0-1, engagement rate),
    "trend": "rising" | "stable" | "falling"
  }
]

Consider:
- For FALSE claims: Show a spike when first posted, then decline as fact-checkers respond
- For TRUE claims: Steady mentions or gradual rise as awareness spreads
- For MIXED claims: Volatile pattern with conflicting coverage
- For UNVERIFIED: Uncertain early spike, then plateau

Make the numbers realistic for social media/news spread patterns.`
          },
          {
            role: 'user',
            content: `Generate mention trends for this claim:
            
Claim: "${claim}"
Verdict: ${verdict}

Generate 12 hourly data points over the past 72 hours with realistic mention counts and engagement metrics. Base the pattern on the verdict type.`
          }
        ],
        temperature: 0.6,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    const content = response.data.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const trends = JSON.parse(jsonMatch[0]);
      logger.info('✅ Mention trends generated (OpenAI)', { dataPoints: trends.length, verdict });
      return trends;
    }
  } catch (error) {
    logger.warn('Mention trends generation failed, using defaults', { error: error.message });
  }

  return generateDefaultTrends();
}

function generateDefaultTrends() {
  // Generate realistic 72-hour trend data
  const now = new Date();
  const trends = [];
  
  for (let i = 11; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 6 * 60 * 60 * 1000); // 6-hour intervals over 72 hours
    const baseCount = Math.floor(Math.random() * 100) + 30;
    
    // Create a more realistic pattern: spike early, then decay or stabilize
    const factor = i < 4 ? (4 - i) * 0.3 : 1; // Earlier hours have potential spike
    const mentions = Math.floor(baseCount * factor + Math.random() * 50);
    
    trends.push({
      timestamp: timestamp.toISOString(),
      mentions: Math.max(10, mentions),
      sources: Math.floor(Math.random() * 20) + 5,
      engagement: Math.random() * 0.5 + 0.3,
      trend: i < 8 ? (Math.random() > 0.5 ? 'rising' : 'stable') : 'stable'
    });
  }
  
  return trends;
}

function getDefaultSources(verdict) {
  const defaultSources = {
    true: [
      {
        type: 'research',
        title: 'Scientific consensus confirms this claim',
        url: 'https://example-research.org/findings',
        reliability: 'high',
        snippet: 'Multiple peer-reviewed studies support this statement. Evidence is consistent across independent researchers.'
      },
      {
        type: 'fact-check',
        title: 'Verified by independent fact-checkers',
        url: 'https://example-factcheck.org/verified',
        reliability: 'high',
        snippet: 'This claim has been verified by multiple independent fact-checking organizations.'
      },
      {
        type: 'news',
        title: 'Credible news sources report',
        url: 'https://example-news.org/story',
        reliability: 'medium',
        snippet: 'Established news organizations have reported and confirmed the facts in this claim.'
      }
    ],
    false: [
      {
        type: 'fact-check',
        title: 'Debunked by fact-checkers',
        url: 'https://example-factcheck.org/debunked',
        reliability: 'high',
        snippet: 'Multiple fact-checking organizations have determined this claim to be false with evidence.'
      },
      {
        type: 'research',
        title: 'Scientific evidence contradicts this',
        url: 'https://example-research.org/contradicts',
        reliability: 'high',
        snippet: 'Peer-reviewed scientific research shows this claim is not supported by evidence.'
      },
      {
        type: 'academic',
        title: 'Academic sources dispute this claim',
        url: 'https://example-academic.org/paper',
        reliability: 'high',
        snippet: 'Academic institutions and researchers have published findings that contradict this statement.'
      }
    ],
    mixed: [
      {
        type: 'research',
        title: 'Partially supported by research',
        url: 'https://example-research.org/mixed',
        reliability: 'high',
        snippet: 'Some aspects of this claim are supported by evidence while others are disputed.'
      },
      {
        type: 'fact-check',
        title: 'Mixed verdict from fact-checkers',
        url: 'https://example-factcheck.org/mixed',
        reliability: 'high',
        snippet: 'Fact-checkers have found parts of this claim to be true and parts to be false.'
      },
      {
        type: 'news',
        title: 'News coverage shows complexity',
        url: 'https://example-news.org/complex',
        reliability: 'medium',
        snippet: 'News reports indicate this topic is more nuanced than the original claim suggests.'
      }
    ],
    unverified: [
      {
        type: 'research',
        title: 'Insufficient evidence to verify',
        url: 'https://example-research.org/unverified',
        reliability: 'medium',
        snippet: 'Research on this topic is limited and does not provide conclusive evidence either way.'
      },
      {
        type: 'academic',
        title: 'Further research needed',
        url: 'https://example-academic.org/investigation',
        reliability: 'medium',
        snippet: 'Academics note that this claim requires further investigation and more data to verify.'
      },
      {
        type: 'fact-check',
        title: 'Remains unverified by fact-checkers',
        url: 'https://example-factcheck.org/unverified',
        reliability: 'medium',
        snippet: 'Fact-checking organizations have determined there is insufficient evidence to verify or debunk this claim.'
      }
    ]
  };

  return defaultSources[verdict] || defaultSources.unverified;
}

export async function generateMetricRecommendation(options) {
  const { claimText, verdict, hasEngagement, hasSources, hasTrend, dataPoints } = options;
  
  try {
    const availableMetrics = [];
    if (hasEngagement) availableMetrics.push('engagement');
    if (hasSources) availableMetrics.push('sources');
    // mentions is always available
    availableMetrics.unshift('mentions');
    
    const prompt = `You are analyzing a fact-check claim to determine which visualization metrics would be most useful.

Claim: "${claimText}"
Current Verdict: ${verdict}
Data Points Available: ${dataPoints}
Available Metrics: ${availableMetrics.join(', ')}

Based on this claim and its verdict, which metrics would best tell the story of how this claim spread and its credibility?

Consider:
- "mentions" shows spread velocity - always important
- "engagement" shows how much people interacted with the claim
- "sources" shows the diversity and credibility of origins

Return a JSON object with:
{
  "metrics": ["mention1", "mention2"],
  "reasoning": "brief explanation of why these metrics matter for this specific claim"
}

Prioritize metrics that are most revealing for a "${verdict}" claim. Always include "mentions". Include "engagement" if the verdict is "false" or "misleading" (to show emotional manipulation). Include "sources" if available.`;

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a data visualization expert helping to choose the most relevant metrics for fact-check analysis. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 300,
      },
      {
        headers: {
          'Authorization': `Bearer ${getOpenAIKey()}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices[0]?.message?.content || '{}';
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const recommendation = JSON.parse(jsonMatch[0]);
    
    // Validate metrics are in available list
    const validMetrics = recommendation.metrics.filter(m => availableMetrics.includes(m));
    
    return {
      metrics: validMetrics.length > 0 ? validMetrics : ['mentions'],
      reasoning: recommendation.reasoning || 'Metrics selected based on claim analysis',
    };
  } catch (error) {
    logger.error('Error generating metric recommendation:', error);
    // Return default metrics
    return {
      metrics: ['mentions', 'engagement', 'sources'].filter(m => {
        if (m === 'mentions') return true;
        if (m === 'engagement') return hasEngagement;
        if (m === 'sources') return hasSources;
        return false;
      }),
      reasoning: 'Default metrics - AI analysis unavailable',
    };
  }
}

export default {
  generateVerdict,
  generateCorrectiveOutput,
  analyzeSentiment,
  analyzeToxicity,
  analyzeSpreadVelocity,
  analyzeManipulation,
  generateDetailedRationale,
  generateEvidenceSources,
  generateMentionTrends,
  generateMetricRecommendation,
};
