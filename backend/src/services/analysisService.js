import logger from '../utils/logger.js';
import { generateEmbedding, classifyText, detectToxicity } from './huggingFaceService.js';
import { generateVerdict, analyzeSentiment, analyzeToxicity, analyzeSpreadVelocity, analyzeManipulation, generateDetailedRationale, generateEvidenceSources, generateMentionTrends } from './llmService.js';
import Analysis from '../models/Analysis.js';
import Claim from '../models/Claim.js';
import Cluster from '../models/Cluster.js';

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
    logger.info('Starting full analysis', { claimId: claim._id });

    // Get initial verdict to know what type of sources to generate
    const initialSources = getRelevantSources(claim.text);
    const verdictData = await generateVerdict(claim.text, initialSources);

    // Now generate real evidence sources and mention trends using OpenAI
    const [evidenceSources, mentionTrends] = await Promise.all([
      generateEvidenceSources(claim.text, verdictData.verdict),
      generateMentionTrends(claim.text, verdictData.verdict),
    ]);

    // Get detailed analysis using OpenAI API for all metrics
    const [sentimentAnalysis, toxicityAnalysis, spreadAnalysis, manipulationAnalysis, detailedRationale] = await Promise.all([
      analyzeSentiment(claim.text),
      analyzeToxicity(claim.text),
      analyzeSpreadVelocity(claim.text),
      analyzeManipulation(claim.text),
      generateDetailedRationale(claim.text, verdictData.verdict, evidenceSources),
    ]);

    const sentiment = sentimentAnalysis?.sentiment || 'neutral';
    const toxicity = (toxicityAnalysis?.toxicityScore || 0);
    const spreadVelocity = (spreadAnalysis?.spreadVelocity || 0.3);
    const manipulationScore = (manipulationAnalysis?.manipulationScore || 0);

    // Calculate risk score
    const riskScore = calculateRiskScore({
      verdictConfidence: verdictData.confidence,
      toxicity,
      spreadVelocity,
      noveltyScore: 0.5, // Default novelty
    });

    // Map verdict to percentage
    const verdictPercentageMap = {
      true: 90,
      false: 10,
      mixed: 50,
      unverified: 50,
    };

    // Create analysis document with detailed OpenAI insights and real evidence sources
    const analysis = new Analysis({
      claimId: claim._id,
      verdict: verdictData.verdict,
      verdictPercentage: verdictPercentageMap[verdictData.verdict] || 50,
      confidence: verdictData.confidence,
      riskScore,
      rationale: detailedRationale,
      features: {
        sentiment,
        manipulationLikelihood: manipulationScore,
        sourceReliability: 0.8,
        spreadVelocity,
        toxicity,
      },
      sources: evidenceSources,
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
    logger.info('Analysis completed', { claimId: claim._id, verdict: verdictData.verdict, sentiment, toxicity: Math.round(toxicity * 100), sources: evidenceSources.length });

    // Create or update cluster
    try {
      const riskScore = analysis.riskScore;
      const riskTier = getRiskTier(riskScore);
      
      // Create a new cluster for this claim
      const cluster = await Cluster.create({
        title: claim.text.substring(0, 50) + (claim.text.length > 50 ? '...' : ''),
        summary: detailedRationale || 'New fact-check analysis',
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
