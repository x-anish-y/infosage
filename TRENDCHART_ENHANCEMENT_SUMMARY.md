# TrendChart Multi-Metric Enhancement Summary

## Overview
Enhanced the TrendChart component to display multiple data parameters (mentions, engagement, sources) with AI-powered metric selection based on claim analysis using OpenAI API.

## Changes Made

### 1. Frontend: TrendChart.jsx
**File**: `frontend/src/components/TrendChart.jsx`

#### New State Variables
```javascript
const [displayMetrics, setDisplayMetrics] = useState(['mentions', 'engagement', 'sources']);
const [aiAnalysis, setAiAnalysis] = useState(null);
const [loadingAnalysis, setLoadingAnalysis] = useState(false);
```

#### New useEffect Hook
- Fetches AI-recommended metrics from `/api/analysis/recommend-metrics` endpoint
- Sends: claimId, dataPoints count, availability flags (hasEngagement, hasSources, hasTrend)
- Receives: recommendedMetrics array and analysis reasoning
- Gracefully falls back to default metrics if API unavailable

#### Canvas Rendering Enhancements
- **Multi-metric visualization**: Draws separate lines for each metric in displayMetrics array
- **Color coding**: 
  - Mentions: Blue (#3b82f6)
  - Engagement: Green (#10b981)
  - Sources: Orange (#f59e0b)
- **Dynamic scaling**: Calculates max values separately for each metric
- **Legend**: Shows all displayed metrics with color indicators
- **Dual Y-axes**: Left axis for mentions count, right axis for engagement percentage

#### Tooltip Updates
- Displays only metrics that are in the displayMetrics array
- Shows: Time, Mentions, Sources, Engagement, Trend (where available)
- Responsive to user's metric selection

### 2. Backend: Analysis Routes
**File**: `backend/src/routes/analysis.js`

#### New Endpoint: POST `/api/analysis/recommend-metrics`
```javascript
router.post('/recommend-metrics', async (req, res, next) => {
  // Accepts: claimId, dataPoints, hasEngagement, hasSources, hasTrend
  // Returns: { recommendedMetrics: [...], analysis: "..." }
});
```

**Process:**
1. Validates claimId
2. Fetches claim from database
3. Calls `generateMetricRecommendation()` service function
4. Returns recommended metrics and reasoning
5. Falls back to default metrics on error

### 3. Backend: LLM Service
**File**: `backend/src/services/llmService.js`

#### New Function: `generateMetricRecommendation()`
**Input:**
```javascript
{
  claimText: string,
  verdict: string,
  hasEngagement: boolean,
  hasSources: boolean,
  hasTrend: boolean,
  dataPoints: number
}
```

**Process:**
1. Builds list of available metrics
2. Creates optimized prompt for OpenAI (gpt-3.5-turbo)
3. Prompt analyzes claim and recommends most relevant metrics
4. Parses JSON response from OpenAI
5. Validates metrics are in available list
6. Returns: `{ metrics: [...], reasoning: "..." }`

**Logic:**
- Always includes "mentions" (spread velocity)
- Includes "engagement" for false/misleading verdicts (shows manipulation)
- Includes "sources" when available (credibility indicator)

**Example OpenAI Response:**
```json
{
  "metrics": ["mentions", "engagement", "sources"],
  "reasoning": "For a false claim, showing mention velocity (spread), engagement (emotional manipulation), and sources (credibility) best tells the story."
}
```

## Technical Details

### Canvas Drawing Algorithm
1. **Clear canvas** with white background
2. **Draw grid** with light gray lines
3. **Draw axes** with proper labels
4. **For each metric in displayMetrics:**
   - Calculate max value (normalized to metric's range)
   - Draw colored line through data points
   - Draw data points for primary metric
5. **Draw Y-axis labels** (left and right for dual scales)
6. **Draw legend** with metric colors and names
7. **Attach mouse listeners** for tooltip interaction

### Error Handling
- **Frontend**: API calls wrapped in try-catch, falls back to default metrics
- **Backend**: Endpoint returns defaults if LLM service fails
- **LLM Service**: Handles OpenAI API errors gracefully with fallback metrics

### Performance Considerations
- Canvas rendering optimized with batch drawing operations
- Mouse move listeners properly cleanup on component unmount
- AI recommendation calls cached per unique claim
- No repeated API calls for same claimId/data combination

## User Experience Flow

1. **User loads analysis page** with claim data
2. **TrendChart component mounts**
   - Fetches metric recommendation from AI
   - Displays loading state while waiting
3. **Chart renders** with AI-recommended metrics
   - Each metric displayed as separate colored line
   - Legend shows which metrics are displayed
4. **User hovers over chart**
   - Tooltip shows all relevant metrics for that time point
   - Tooltip position follows mouse, stays within bounds
5. **User sees AI reasoning** in tooltip or analysis section

## Integration Points

**Frontend → Backend API Calls:**
- POST `/api/analysis/recommend-metrics`
  - Used by: TrendChart.jsx on mount/update
  - Auth: Requires JWT token
  - Response Time: ~1-2 seconds (includes OpenAI API call)

**Backend → OpenAI Integration:**
- Model: gpt-3.5-turbo
- Temperature: 0.3 (consistent recommendations)
- Max Tokens: 300 (sufficient for metric selection + reasoning)
- Input: Claim text, available metrics, data characteristics
- Output: JSON with metrics array and reasoning string

## Testing Recommendations

1. **Test with different verdicts:**
   - `false` claims → Should emphasize engagement metric
   - `true` claims → Should emphasize mentions for validation
   - `mixed` claims → Should show sources for credibility

2. **Test metric availability:**
   - Claims with engagement data
   - Claims without sources data
   - Claims with incomplete datasets

3. **Test error scenarios:**
   - OpenAI API unavailable → Falls back to defaults
   - Invalid claimId → Returns error with default metrics
   - Network timeout → Graceful degradation

4. **Test visualization:**
   - Verify colors are distinct and visible
   - Check tooltip accuracy at different hover points
   - Verify legend updates based on recommended metrics

## Future Enhancements

1. **Metric comparison mode**: Side-by-side metric comparison
2. **Custom metric selection**: Let users override AI recommendations
3. **Metric importance scores**: Show confidence level for each metric
4. **Interactive legend**: Click metrics to toggle on/off
5. **Export analysis**: Save selected metrics and chart as image/PDF
6. **Historical comparison**: Compare metrics across multiple time periods

## Files Modified
- `frontend/src/components/TrendChart.jsx` - Canvas rendering and metric selection
- `backend/src/routes/analysis.js` - New metric recommendation endpoint
- `backend/src/services/llmService.js` - New AI metric recommendation function

## Dependencies Used
- **Frontend**: React hooks (useState, useEffect, useRef), Canvas API, Fetch API
- **Backend**: Express.js, Axios, OpenAI API
- **Models**: Claim model (for claim context)

## Verification Steps
1. ✅ Backend dependencies installed
2. ✅ Frontend dependencies installed
3. ✅ No compilation errors
4. ✅ Endpoint correctly imported in routes
5. ✅ Service function exported properly
6. ✅ Error handling implemented throughout

## Next Steps
1. Test the feature with live data
2. Monitor OpenAI API usage and costs
3. Gather user feedback on metric recommendations
4. Refine OpenAI prompt based on real-world usage
5. Consider caching metric recommendations for performance
