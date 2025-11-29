import logger from '../utils/logger.js';
import axios from 'axios';
import { generateEmbedding, classifyText, detectToxicity } from './huggingFaceService.js';
import { generateVerdict, analyzeSentiment, analyzeToxicity, analyzeSpreadVelocity, analyzeManipulation, generateDetailedRationale, generateEvidenceSources, generateMentionTrends } from './llmService.js';
import Analysis from '../models/Analysis.js';
import Claim from '../models/Claim.js';
import Cluster from '../models/Cluster.js';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

function getOpenAIKey() {
  return process.env.OPENAI_API_KEY;
}

// Web search simulation using OpenAI's knowledge
async function searchWebForContext(searchQuery, imageAnalysis = null) {
  const OPENAI_API_KEY = getOpenAIKey();
  if (!OPENAI_API_KEY) {
    return null;
  }

  try {
    // Build search context from image analysis
    let searchContext = searchQuery;
    let peopleContext = '';
    
    if (imageAnalysis) {
      if (imageAnalysis.people && imageAnalysis.people.length > 0) {
        const identifiedPeople = imageAnalysis.people
          .filter(p => p.name && p.name !== 'Unknown person')
          .map(p => p.name);
        if (identifiedPeople.length > 0) {
          peopleContext = identifiedPeople.join(', ');
          searchContext = `${peopleContext}: ${searchQuery}`;
        }
      }
      
      if (imageAnalysis.scene?.event) {
        searchContext += ` Event: ${imageAnalysis.scene.event}`;
      }
    }

    logger.info('Searching web for context', { searchContext: searchContext.substring(0, 100) });

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a fact-checking research assistant with access to comprehensive knowledge. When given a claim or image description, provide thorough research as if you searched the internet.

Your task:
1. IDENTIFY the subject (people, events, organizations mentioned)
2. PROVIDE verified facts about these subjects from reliable sources
3. CHECK if this claim/image matches known events or is potentially fake/manipulated
4. FIND any previous fact-checks of similar claims
5. LOOK for the original source of the image/claim if possible

Respond in JSON format:
{
  "searchResults": [
    {
      "title": "Source title",
      "url": "https://reliable-source.com/article",
      "type": "news|fact-check|official|academic|social",
      "reliability": "high|medium|low",
      "snippet": "Relevant excerpt from the source",
      "date": "Publication date if known",
      "verdict": "What this source says about the claim"
    }
  ],
  "peopleInfo": [
    {
      "name": "Person name",
      "title": "Their actual title/position",
      "verifiedFacts": ["Verified fact 1", "Verified fact 2"],
      "relevantNews": "Recent news about this person related to the claim"
    }
  ],
  "imageOrigin": {
    "found": true/false,
    "originalSource": "Where the image originally came from",
    "dateFirstSeen": "When the image first appeared",
    "previousUsage": ["How this image has been used before"],
    "isManipulated": true/false,
    "manipulationDetails": "Details if manipulated"
  },
  "factCheckResults": [
    {
      "organization": "Fact-checker name",
      "verdict": "Their verdict",
      "url": "Link to fact-check",
      "summary": "What they found"
    }
  ],
  "claimAnalysis": {
    "verdict": "true|false|misleading|unverified|satire|out-of-context",
    "confidence": 0.0-1.0,
    "reasoning": "Detailed explanation of the verdict",
    "keyEvidence": ["Key evidence point 1", "Key evidence point 2"]
  },
  "warnings": ["Any warnings about this claim/image"]
}`
          },
          {
            role: 'user',
            content: `Research this claim/image thoroughly as if searching the internet:

CLAIM/DESCRIPTION: ${searchContext}

${peopleContext ? `IDENTIFIED PEOPLE: ${peopleContext}` : ''}
${imageAnalysis?.imageDescription ? `IMAGE SHOWS: ${imageAnalysis.imageDescription}` : ''}
${imageAnalysis?.extractedText ? `TEXT IN IMAGE: ${imageAnalysis.extractedText}` : ''}
${imageAnalysis?.scene?.location ? `LOCATION: ${imageAnalysis.scene.location}` : ''}
${imageAnalysis?.scene?.event ? `EVENT: ${imageAnalysis.scene.event}` : ''}

Search for:
1. Who are these people and their real positions/titles?
2. Is this image/claim from a real event?
3. Has this been fact-checked before?
4. Is this image the original or has it been manipulated/taken out of context?
5. What do reliable sources say about this?`
          }
        ],
        max_tokens: 2000,
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 90000
      }
    );

    const content = response.data.choices[0].message.content;
    
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const results = JSON.parse(jsonMatch[0]);
        logger.info('Web search complete', {
          resultsCount: results.searchResults?.length || 0,
          peopleFound: results.peopleInfo?.length || 0,
          verdict: results.claimAnalysis?.verdict
        });
        return results;
      }
    } catch (e) {
      logger.warn('Failed to parse web search results');
    }
    
    return null;
  } catch (error) {
    logger.error('Web search failed', { error: error.message });
    return null;
  }
}

// Mock corpus of fact-check sources
const factCheckCorpus = [
  {
    type: 'fact-check',
    title: 'Verified: Common vaccine claims',
    url: 'https://example-factcheck.org/vaccines',
    reliability: 'high',
    snippet:
      'Vaccines have been extensively studied and shown to be safe and effective.',
  },
  {
    type: 'fact-check',
    title: 'Debunking election fraud myths',
    url: 'https://example-factcheck.org/elections',
    reliability: 'high',
    snippet:
      'Election fraud is rare and investigated by election officials.',
  },
  {
    type: 'news',
    title: 'Health official responds to misinformation',
    url: 'https://example-news.org/health',
    reliability: 'medium',
    snippet: 'Health authorities address misconceptions about disease transmission.',
  },
  {
    type: 'research',
    title: 'Scientific study on claim verification',
    url: 'https://example-research.org/study',
    reliability: 'high',
    snippet: 'Peer-reviewed research confirms safety protocols.',
  },
];

// Smart inference functions for fallback analysis
function inferSentimentFromClaim(text) {
  const lowerText = text.toLowerCase();
  const fearWords = ['afraid', 'terrified', 'danger', 'threat', 'risk'];
  const angerWords = ['angry', 'furious', 'outraged', 'disgusted'];
  const hopeWords = ['hopeful', 'wonderful', 'great', 'amazing'];
  
  let sentimentScore = { fear: 0, anger: 0, hope: 0, sadness: 0, neutral: 1 };
  
  if (fearWords.some(w => lowerText.includes(w))) sentimentScore.fear = 0.7;
  if (angerWords.some(w => lowerText.includes(w))) sentimentScore.anger = 0.7;
  if (hopeWords.some(w => lowerText.includes(w))) sentimentScore.hope = 0.7;
  
  return Object.entries(sentimentScore).sort((a, b) => b[1] - a[1])[0][0];
}

function detectToxicityPatterns(text) {
  const lowerText = text.toLowerCase();
  const toxicPatterns = [
    /\b(kill|murder|destroy|hate|death)\b/gi,
    /\b(stupid|idiot|moron|crazy)\b/gi,
    /[!]{2,}/, // Multiple exclamation marks
  ];
  
  let toxicityScore = 0;
  toxicPatterns.forEach(pattern => {
    const matches = lowerText.match(pattern);
    if (matches) toxicityScore += matches.length * 0.1;
  });
  
  return Math.min(0.8, toxicityScore);
}

function estimateSpreadVelocity(text) {
  const lowerText = text.toLowerCase();
  const viralWords = ['must share', 'everyone should know', 'breaking', 'exclusive', 'shocking'];
  const hasViralLanguage = viralWords.some(w => lowerText.includes(w));
  return hasViralLanguage ? 0.7 : 0.3;
}

function estimateNovelty(text) {
  const lowerText = text.toLowerCase();
  const newWords = ['new', 'first', 'discovered', 'secret'];
  const hasNewLanguage = newWords.some(w => lowerText.includes(w));
  return hasNewLanguage ? 0.6 : 0.3;
}

function estimateManipulation(text) {
  const lowerText = text.toLowerCase();
  const manipulationPatterns = [
    /they don't want you to know/gi,
    /do your own research/gi,
    /the truth is/gi,
    /wake up people/gi,
  ];
  
  let manipulationScore = 0;
  manipulationPatterns.forEach(pattern => {
    if (pattern.test(lowerText)) manipulationScore += 0.2;
  });
  
  return Math.min(1, manipulationScore);
}

export async function analyzeClaimFull(claim) {
  try {
    logger.info('Starting full analysis', { claimId: claim._id, hasImage: !!claim.mediaAnalysis?.hasImage });

    // Check if claim has image analysis data
    const imageAnalysis = claim.mediaAnalysis || null;
    let webSearchResults = null;
    
    // Step 1: Search the web for context about this claim/image
    if (imageAnalysis?.hasImage || claim.text) {
      logger.info('Performing web search for claim verification...');
      webSearchResults = await searchWebForContext(claim.text, imageAnalysis);
    }

    // Build sources from web search results
    let evidenceSources = [];
    if (webSearchResults?.searchResults) {
      evidenceSources = webSearchResults.searchResults.map(r => ({
        type: r.type || 'news',
        title: r.title,
        url: r.url,
        reliability: r.reliability || 'medium',
        snippet: r.snippet || r.verdict,
        date: r.date
      }));
    }
    
    // Add fact-check results as sources
    if (webSearchResults?.factCheckResults) {
      webSearchResults.factCheckResults.forEach(fc => {
        evidenceSources.push({
          type: 'fact-check',
          title: `${fc.organization}: ${fc.verdict}`,
          url: fc.url || 'https://factcheck.org',
          reliability: 'high',
          snippet: fc.summary
        });
      });
    }

    // Use web search verdict if available, otherwise generate one
    let verdictData;
    if (webSearchResults?.claimAnalysis) {
      verdictData = {
        verdict: webSearchResults.claimAnalysis.verdict,
        confidence: webSearchResults.claimAnalysis.confidence,
        rationale: webSearchResults.claimAnalysis.reasoning,
        keyFindings: webSearchResults.claimAnalysis.keyEvidence || []
      };
      logger.info('Using web search verdict', { verdict: verdictData.verdict, confidence: verdictData.confidence });
    } else {
      // Fallback to regular verdict generation
      const initialSources = getRelevantSources(claim.text);
      verdictData = await generateVerdict(claim.text, initialSources);
    }

    // If no sources from web search, generate them
    if (evidenceSources.length === 0) {
      evidenceSources = await generateEvidenceSources(claim.text, verdictData.verdict);
    }

    // Generate mention trends
    const mentionTrends = await generateMentionTrends(claim.text, verdictData.verdict);

    // Get detailed analysis using OpenAI API for all metrics
    const [sentimentAnalysis, toxicityAnalysis, spreadAnalysis, manipulationAnalysis] = await Promise.all([
      analyzeSentiment(claim.text),
      analyzeToxicity(claim.text),
      analyzeSpreadVelocity(claim.text),
      analyzeManipulation(claim.text),
    ]);

    const sentiment = sentimentAnalysis?.sentiment || 'neutral';
    const toxicity = (toxicityAnalysis?.toxicityScore || 0);
    const spreadVelocity = (spreadAnalysis?.spreadVelocity || 0.3);
    const manipulationScore = (manipulationAnalysis?.manipulationScore || 0);

    // Build comprehensive rationale
    let rationale = verdictData.rationale || '';
    
    // Add people info to rationale
    if (webSearchResults?.peopleInfo && webSearchResults.peopleInfo.length > 0) {
      rationale += '\n\n**People Identified:**\n';
      webSearchResults.peopleInfo.forEach(p => {
        rationale += `• ${p.name} (${p.title}): ${p.verifiedFacts?.join('. ') || p.relevantNews || ''}\n`;
      });
    }
    
    // Add image origin info
    if (webSearchResults?.imageOrigin?.found) {
      rationale += '\n\n**Image Analysis:**\n';
      rationale += `Original source: ${webSearchResults.imageOrigin.originalSource || 'Unknown'}\n`;
      if (webSearchResults.imageOrigin.isManipulated) {
        rationale += `⚠️ Manipulation detected: ${webSearchResults.imageOrigin.manipulationDetails}\n`;
      }
      if (webSearchResults.imageOrigin.previousUsage?.length > 0) {
        rationale += `Previous usage: ${webSearchResults.imageOrigin.previousUsage.join(', ')}\n`;
      }
    }
    
    // Add warnings
    if (webSearchResults?.warnings && webSearchResults.warnings.length > 0) {
      rationale += '\n\n**⚠️ Warnings:**\n';
      webSearchResults.warnings.forEach(w => {
        rationale += `• ${w}\n`;
      });
    }

    // Calculate risk score
    const riskScore = calculateRiskScore({
      verdictConfidence: verdictData.confidence,
      toxicity,
      spreadVelocity,
      noveltyScore: 0.5,
    });

    // Map verdict to percentage
    const verdictPercentageMap = {
      true: 90,
      false: 10,
      mixed: 50,
      misleading: 25,
      'out-of-context': 30,
      satire: 40,
      unverified: 50,
    };

    // Create analysis document with web search results
    const analysis = new Analysis({
      claimId: claim._id,
      verdict: verdictData.verdict,
      verdictPercentage: verdictPercentageMap[verdictData.verdict] || 50,
      confidence: verdictData.confidence,
      riskScore,
      rationale: rationale,
      features: {
        sentiment,
        manipulationLikelihood: manipulationScore,
        sourceReliability: evidenceSources.some(s => s.reliability === 'high') ? 0.85 : 0.6,
        spreadVelocity,
        toxicity,
      },
      sources: evidenceSources,
      // Store web search results for reference
      webSearchResults: webSearchResults ? {
        peopleInfo: webSearchResults.peopleInfo,
        imageOrigin: webSearchResults.imageOrigin,
        factCheckResults: webSearchResults.factCheckResults,
        warnings: webSearchResults.warnings,
      } : null,
      charts: {
        riskTrend: [0.2, 0.35, riskScore],
        mentionsOverTime: mentionTrends.map(t => ({
          t: new Date(t.timestamp),
          count: t.mentions,
          sources: t.sources,
          engagement: t.engagement,
          trend: t.trend,
        })),
      },
    });

    await analysis.save();
    logger.info('Analysis completed', { 
      claimId: claim._id, 
      verdict: verdictData.verdict, 
      confidence: verdictData.confidence,
      sourcesCount: evidenceSources.length,
      hasWebSearch: !!webSearchResults 
    });

    // Create or update cluster
    try {
      const riskTier = getRiskTier(riskScore);
      
      const cluster = await Cluster.create({
        title: claim.text.substring(0, 50) + (claim.text.length > 50 ? '...' : ''),
        summary: rationale.substring(0, 200),
        claimIds: [claim._id],
        riskScore,
        riskTier,
        trend: 'stable',
        verdict: verdictData.verdict,
        confidence: verdictData.confidence,
        sources: evidenceSources.length,
        charts: analysis.charts,
        geo: claim.geo || 'global',
        language: claim.language || 'en',
        status: 'active',
      });
      
      logger.info('Cluster created', { clusterId: cluster._id, claimId: claim._id });
    } catch (clusterError) {
      logger.warn('Failed to create cluster', { error: clusterError.message });
    }

    return analysis;
  } catch (error) {
    logger.error('Claim analysis failed', { error: error.message });
    throw error;
  }
}

function getRelevantSources(claimText) {
  // Mock retrieval based on keyword matching
  const keywords = claimText.toLowerCase().split(' ');

  return factCheckCorpus
    .filter((source) => {
      const sourceText = (source.title + ' ' + source.snippet).toLowerCase();
      return keywords.some((keyword) => sourceText.includes(keyword));
    })
    .slice(0, 3)
    .map((source) => ({
      type: source.type,
      title: source.title,
      url: source.url,
      reliability: source.reliability,
      snippet: source.snippet,
    }));
}

function calculateRiskScore(features) {
  const weights = {
    confidenceInverse: 0.3, // Lower confidence = higher risk
    toxicity: 0.2,
    spreadVelocity: 0.25,
    noveltyScore: 0.25,
  };

  const score =
    weights.confidenceInverse * (1 - features.verdictConfidence) +
    weights.toxicity * features.toxicity +
    weights.spreadVelocity * features.spreadVelocity +
    weights.noveltyScore * features.noveltyScore;

  return Math.min(1, Math.max(0, score));
}

export function getRiskTier(riskScore) {
  if (riskScore <= 0.33) return 'low';
  if (riskScore <= 0.66) return 'medium';
  return 'high';
}

export async function shouldEscalate(analysis) {
  const autoEscalate = analysis.riskScore > 0.75 || 
    (analysis.confidence < 0.6 && analysis.features.spreadVelocity > 0.5);
  
  return autoEscalate;
}

function generateSmartRationale(claimText, verdict, confidence, sourceCount) {
  const rationales = {
    true: [
      `This claim is verified by multiple reliable sources.`,
      `Supporting evidence confirms the accuracy of this statement.`,
      `Fact-checkers have verified this claim as accurate.`,
    ],
    false: [
      `This claim contradicts established facts and reliable sources.`,
      `Evidence shows this statement is factually incorrect.`,
      `Multiple sources debunk this false claim.`,
    ],
    mixed: [
      `This claim contains both true and false elements.`,
      `The claim is partially supported by evidence.`,
      `Some aspects are verified, others are disputed.`,
    ],
    unverified: [
      sourceCount > 0 
        ? `Limited evidence available; requires additional sources.`
        : `No reliable sources found to verify this claim.`,
      `Insufficient information to make a definitive verdict.`,
      `More research needed to verify this statement.`,
    ],
  };

  const verdictRationales = rationales[verdict] || rationales.unverified;
  const selectedRationale = verdictRationales[Math.floor(Math.random() * verdictRationales.length)];
  
  // Add confidence note
  const confidenceNote = confidence < 0.5 
    ? ` (Low confidence - more evidence needed)`
    : confidence < 0.75
    ? ` (Moderate confidence)`
    : ` (High confidence)`;

  return selectedRationale + confidenceNote;
}

export default {
  analyzeClaimFull,
  getRiskTier,
  shouldEscalate,
};
