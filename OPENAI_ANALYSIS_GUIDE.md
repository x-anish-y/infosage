# OpenAI Enhanced Analysis Implementation

## Overview
The InfoSage backend now uses OpenAI's GPT-3.5-turbo model to generate comprehensive, AI-powered analysis for every claim. This includes detailed sentiment analysis, toxicity detection, viral spread potential assessment, and manipulation detection.

## New OpenAI Analysis Functions

### 1. **analyzeSentiment(claim)**
Analyzes the emotional tone of a claim.

**Input:**
```javascript
claim: "Vaccines are dangerous and cause autism"
```

**Output:**
```json
{
  "sentiment": "fear",
  "confidence": 0.85,
  "explanation": "The claim uses fear-inducing language about vaccine safety and health risks."
}
```

**Sentiments Detected:** fear, anger, neutral, hope, sadness

---

### 2. **analyzeToxicity(claim)**
Detects harmful, hateful, or offensive language in claims.

**Input:**
```javascript
claim: "I hate all politicians, they're destroying our country!"
```

**Output:**
```json
{
  "toxicityScore": 0.72,
  "risk": "high",
  "explanation": "Contains hate speech and aggressive language targeting a group of people."
}
```

**Risk Levels:** low (< 0.33), medium (0.33-0.66), high (> 0.66)

---

### 3. **analyzeSpreadVelocity(claim)**
Evaluates how likely a claim is to spread virally.

**Input:**
```javascript
claim: "BREAKING: Major scandal discovered! Everyone needs to share this immediately!"
```

**Output:**
```json
{
  "spreadVelocity": 0.78,
  "viralPotential": "high",
  "explanation": "Uses sensational language ('BREAKING', 'scandal'), urgency ('immediately'), and explicit call-to-action that encourages sharing."
}
```

**Viral Potential:** low (< 0.33), medium (0.33-0.66), high (> 0.66)

---

### 4. **analyzeManipulation(claim)**
Detects propaganda and manipulation tactics used in claims.

**Input:**
```javascript
claim: "They don't want you to know the truth! Do your own research!"
```

**Output:**
```json
{
  "manipulationScore": 0.85,
  "manipulationType": "conspiracy",
  "explanation": "Uses classic conspiracy theory framing ('They don't want you to know') and encourages distrust of institutional sources."
}
```

**Manipulation Types:** none, fear-mongering, conspiracy, misleading, other

---

### 5. **generateDetailedRationale(claim, verdict, sources)**
Generates a professional, evidence-based explanation for why a claim is true, false, mixed, or unverified.

**Input:**
```javascript
claim: "The Earth is flat"
verdict: "false"
sources: [
  {
    title: "NASA - Earth Shape",
    reliability: "high",
    snippet: "Earth is an oblate spheroid confirmed by satellite imagery."
  }
]
```

**Output:**
```
"Scientific evidence overwhelmingly demonstrates that Earth is a spheroid, not flat. Satellite imagery, GPS technology, and centuries of astronomical observation all confirm this basic fact of science."
```

---

## Frontend Display Format

The AnalysisSummary component displays all metrics in a user-friendly format:

```jsx
<div className="analysis-summary">
  <div className="verdict-section">
    <!-- FALSE, TRUE, MIXED, or UNVERIFIED -->
    <span className="verdict-label">FALSE</span>
    <span className="verdict-percentage">10%</span>
  </div>

  <div className="metrics-section">
    <div className="metric-item">
      <span>Confidence: 100.0%</span>
    </div>
    <div className="metric-item">
      <span>Risk Score: 17.0%</span>
    </div>

    <div className="features-grid">
      <!-- All metrics from OpenAI analysis -->
      <div className="feature">
        <span>Sentiment: neutral</span> <!-- from analyzeSentiment() -->
      </div>
      <div className="feature">
        <span>Toxicity: 10%</span> <!-- from analyzeToxicity() -->
      </div>
      <div className="feature">
        <span>Spread Velocity: 30%</span> <!-- from analyzeSpreadVelocity() -->
      </div>
      <div className="feature">
        <span>Manipulation: 0%</span> <!-- from analyzeManipulation() -->
      </div>
    </div>
  </div>

  <div className="rationale-section">
    <h4>Why we decided this</h4>
    <p><!-- from generateDetailedRationale() --></p>
    <p>Evidence shows this statement is factually incorrect. (High confidence)</p>
  </div>
</div>
```

---

## Data Flow

### 1. Claim Submission
```
User submits claim → Backend receives request
```

### 2. OpenAI Analysis
```
analyzeClaimFull() calls:
├─ generateVerdict() - Fact check verdict
├─ analyzeSentiment() - Emotional tone
├─ analyzeToxicity() - Harmful language
├─ analyzeSpreadVelocity() - Viral potential
├─ analyzeManipulation() - Propaganda tactics
└─ generateDetailedRationale() - Explanation
```

### 3. Data Storage
```
Analysis results saved to MongoDB:
{
  claimId: ObjectId,
  verdict: "false",
  confidence: 1.0,
  riskScore: 0.17,
  rationale: "...",
  features: {
    sentiment: "neutral",
    toxicity: 0.1,
    spreadVelocity: 0.3,
    manipulationLikelihood: 0.0
  },
  sources: [...]
}
```

### 4. Frontend Display
```
API returns analysis data → Frontend displays metrics in AnalysisSummary component
```

---

## Example Analysis Results

### Example 1: False Claim
```
Claim: "The Earth is flat"

Output:
{
  verdict: "false",
  confidence: 0.95,
  riskScore: 0.42,
  features: {
    sentiment: "neutral",
    toxicity: 0.15,
    spreadVelocity: 0.65,
    manipulationLikelihood: 0.8
  }
}

Frontend Display:
- Verdict: FALSE (10%)
- Confidence: 95%
- Risk: 42%
- Sentiment: neutral
- Toxicity: 15%
- Spread Velocity: 65%
- Manipulation: 80%
```

### Example 2: True Claim
```
Claim: "Water boils at 100 degrees Celsius at sea level"

Output:
{
  verdict: "true",
  confidence: 0.99,
  riskScore: 0.05,
  features: {
    sentiment: "neutral",
    toxicity: 0.0,
    spreadVelocity: 0.1,
    manipulationLikelihood: 0.0
  }
}

Frontend Display:
- Verdict: TRUE (90%)
- Confidence: 99%
- Risk: 5%
- Sentiment: neutral
- Toxicity: 0%
- Spread Velocity: 10%
- Manipulation: 0%
```

### Example 3: Conspiratorial Claim
```
Claim: "5G causes COVID-19 and the government is hiding the truth!"

Output:
{
  verdict: "false",
  confidence: 0.92,
  riskScore: 0.78,
  features: {
    sentiment: "fear",
    toxicity: 0.35,
    spreadVelocity: 0.85,
    manipulationLikelihood: 0.95
  }
}

Frontend Display:
- Verdict: FALSE (10%)
- Confidence: 92%
- Risk: 78%
- Sentiment: fear
- Toxicity: 35%
- Spread Velocity: 85%
- Manipulation: 95%
```

---

## API Endpoints

### Create Claim with Full Analysis
```
POST /api/claims
{
  "text": "Claim to analyze",
  "sourceType": "manual",
  "language": "en"
}
```

**Response:** Returns claim with OpenAI analysis results

### Retrieve Analysis
```
GET /api/analysis/:claimId
```

**Response:**
```json
{
  "_id": "...",
  "claimId": "...",
  "verdict": "false",
  "confidence": 0.95,
  "riskScore": 0.42,
  "rationale": "...",
  "features": {
    "sentiment": "neutral",
    "toxicity": 0.15,
    "spreadVelocity": 0.65,
    "manipulationLikelihood": 0.8
  },
  "sources": [...],
  "charts": {...}
}
```

---

## Configuration

### Environment Variables
```
OPENAI_API_KEY=sk-proj-... (Your OpenAI API key)
```

### Supported Models
- `text-embedding-3-small` - For semantic embeddings
- `gpt-3.5-turbo` - For all text analysis and verdict generation

---

## Error Handling

If OpenAI API fails:
- ✅ Graceful fallback to mock analysis
- ✅ Returns reasonable default values
- ✅ Application continues to function
- ✅ Error logged for debugging

### Fallback Example
```json
{
  "sentiment": "neutral",
  "confidence": 0.5,
  "explanation": "Analysis unavailable"
}
```

---

## Performance Notes

- ⚡ ~2-4 seconds for complete analysis (all 5 functions in parallel)
- ⚡ Rate limited to 3 concurrent API calls
- ⚡ Exponential backoff for retries (429 errors)
- ⚡ 15-30 second timeouts per request

---

## Testing the Integration

### Step 1: Submit a Test Claim
Navigate to http://localhost:5173 and submit a claim through the UI

### Step 2: View Results
The AnalysisSummary component will display:
- ✅ Verdict with confidence
- ✅ Risk score
- ✅ Sentiment (from analyzeSentiment)
- ✅ Toxicity % (from analyzeToxicity)
- ✅ Spread Velocity % (from analyzeSpreadVelocity)
- ✅ Manipulation % (from analyzeManipulation)
- ✅ Detailed rationale (from generateDetailedRationale)

### Step 3: Check Backend Logs
Look for messages like:
```
✅ Sentiment analysis successful (OpenAI)
✅ Toxicity analysis successful (OpenAI)
✅ Spread velocity analysis successful (OpenAI)
✅ Manipulation analysis successful (OpenAI)
✅ Detailed rationale generated (OpenAI)
```

---

## Summary

The integration provides:

1. **Comprehensive Analysis** - 5 different AI-powered metrics per claim
2. **Professional Explanations** - Human-readable rationale for each verdict
3. **Real-time Processing** - Analysis completes in 2-4 seconds
4. **Robust Error Handling** - Fallback mechanisms ensure the app never breaks
5. **Clean Frontend Integration** - All data automatically displays in UI

Users now see detailed, professionally-written analysis powered by OpenAI's advanced language model!
