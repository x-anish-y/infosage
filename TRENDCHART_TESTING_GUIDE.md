# TrendChart Enhancement Testing Guide

## Quick Start

### Prerequisites
- MongoDB running locally or connection configured
- OpenAI API key set in `.env`
- Backend running on port 4000
- Frontend running on port 5173 (Vite default)

### Setup Steps

1. **Backend Setup**
```bash
cd backend
npm install
npm start
```
Expected output: `Server running on port 4000`

2. **Frontend Setup** (in new terminal)
```bash
cd frontend
npm install
npm run dev
```
Expected output: `VITE v... ready in ... ms`

3. **Create Test Data**
```bash
cd backend
node scripts/seed.js
```
This creates sample claims and analysis data

4. **Access Application**
Open browser: `http://localhost:5173`

## Feature Testing

### Test Case 1: Multi-Metric Chart Display

**Objective**: Verify chart displays multiple metric lines with different colors

**Steps**:
1. Log in to application
2. Navigate to an analyzed claim
3. Scroll to "Trends" section
4. Look for TrendChart component

**Expected Results**:
- [ ] Chart title: "Mentions Over Time (72 Hours)"
- [ ] Blue line representing mentions
- [ ] Green line representing engagement (if data available)
- [ ] Orange line representing sources (if data available)
- [ ] Legend showing which metrics are displayed
- [ ] Left Y-axis labeled "Mentions" with numbers
- [ ] Right Y-axis labeled "Engagement (%)" with percentages
- [ ] X-axis showing times (0, 6, 12, 18, 24 hours)

**Pass Criteria**: All 8 visual elements present and correctly positioned

---

### Test Case 2: AI Metric Recommendation

**Objective**: Verify OpenAI API correctly recommends metrics based on verdict

**Steps**:
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Navigate to a claim analysis page
4. Watch for API calls

**Expected Behavior**:
- API call to `POST /api/analysis/recommend-metrics` triggers within 2 seconds
- Request body contains: `{ claimId, dataPoints, hasEngagement, hasSources, hasTrend }`
- Response contains: `{ recommendedMetrics: [...], analysis: "..." }`
- Chart re-renders with recommended metrics

**Test for Each Verdict**:

#### FALSE Claims
- [ ] OpenAI recommends: engagement, mentions, sources
- [ ] Reasoning mentions "emotional manipulation" or "false spread"
- [ ] Engagement line visible on chart
- [ ] Sources line visible on chart

#### TRUE Claims  
- [ ] OpenAI recommends: mentions, sources (possibly engagement)
- [ ] Reasoning mentions "credible sources" or "legitimate spread"
- [ ] All metrics present or appropriate subset

#### MIXED Claims
- [ ] OpenAI recommends: mentions, engagement, sources
- [ ] Reasoning mentions "nuanced" or "mixed"
- [ ] All metrics displayed

---

### Test Case 3: Tooltip Interaction

**Objective**: Verify tooltip displays correct metric values on hover

**Steps**:
1. Open TrendChart
2. Move mouse to first data point
3. Hover for 1 second
4. Observe tooltip
5. Move to next point
6. Repeat for 5+ points

**Expected Behavior**:
- [ ] Tooltip appears within 100ms of hover
- [ ] Tooltip positioned at +10px offset from data point
- [ ] Tooltip includes: Time, Mentions, and other relevant metrics
- [ ] Only displays metrics in displayMetrics array
- [ ] Time format correct: "HH:MM:SS"
- [ ] Numbers properly formatted
- [ ] Tooltip disappears when mouse exits 15px radius
- [ ] No tooltip jitter or flashing

**Data Validation**:
- [ ] Mentions value matches visual line position
- [ ] Engagement value shown as percentage (0-100%)
- [ ] Sources value is a number or "N/A"
- [ ] All values are non-negative

---

### Test Case 4: Error Handling - API Failure

**Objective**: Verify graceful degradation when OpenAI API unavailable

**Steps**:
1. Temporarily set invalid OpenAI API key
2. Navigate to claim analysis
3. Observe TrendChart

**Expected Behavior**:
- [ ] Chart still renders
- [ ] All available metrics displayed as fallback
- [ ] Console shows error but no crash
- [ ] User can still interact with chart
- [ ] No visible error message on UI

**Recovery**:
- [ ] Fix API key
- [ ] Refresh page
- [ ] Verification: Chart now shows AI-recommended metrics (not all metrics)

---

### Test Case 5: Canvas Rendering Quality

**Objective**: Verify canvas draws smoothly and clearly

**Steps**:
1. Open TrendChart
2. Zoom browser to 150%
3. Zoom back to 100%
4. Check line quality at different zoom levels
5. Take screenshot

**Expected Results**:
- [ ] Lines are smooth and continuous
- [ ] No pixel jitter or aliasing artifacts
- [ ] Grid lines visible but not distracting
- [ ] Data points clearly marked
- [ ] Legend readable at all zoom levels
- [ ] Colors distinct and distinguishable
- [ ] Chart adapts to window resize

---

### Test Case 6: Performance Benchmarking

**Objective**: Verify chart renders within acceptable time

**Steps**:
1. Open Developer Tools
2. Go to Performance tab
3. Start recording
4. Navigate to claim analysis page (wait for chart to load)
5. Stop recording
6. Analyze metrics

**Expected Performance**:
- [ ] Canvas rendering: < 50ms per frame
- [ ] Mouse move events: < 10ms per event
- [ ] No main thread blocking
- [ ] Frame rate: 60fps while interacting
- [ ] Memory usage: < 10MB for chart data

**Stress Test** (with 1000+ data points):
- [ ] Chart still renders smoothly
- [ ] Hover interactions remain responsive
- [ ] No memory leaks after 5 minutes of interaction

---

### Test Case 7: Different Data Scenarios

**Objective**: Test chart with various data characteristics

#### Scenario A: Missing Engagement Data
```javascript
data = [
  { t: new Date(), count: 100, sources: 5 },  // no engagement
  { t: new Date(), count: 150, sources: 6 },
]
```
- [ ] Chart shows mentions and sources only
- [ ] No engagement line drawn
- [ ] Tooltip doesn't show engagement field
- [ ] Legend shows only 2 metrics

#### Scenario B: Missing Sources Data
```javascript
data = [
  { t: new Date(), count: 100, engagement: 0.3 },  // no sources
  { t: new Date(), count: 150, engagement: 0.35 },
]
```
- [ ] Chart shows mentions and engagement only
- [ ] No sources line drawn
- [ ] API recommendation reflects available data

#### Scenario C: Single Data Point
```javascript
data = [{ t: new Date(), count: 100, engagement: 0.3, sources: 5 }]
```
- [ ] Chart still renders
- [ ] No lines drawn (need 2+ points for line chart)
- [ ] Data point(s) visible
- [ ] No console errors

#### Scenario D: Invalid Date Data
```javascript
data = [
  { t: 'invalid-date', count: 100 },  // invalid date
  { t: new Date(), count: 150 },
]
```
- [ ] Invalid point is filtered out
- [ ] Only valid points displayed
- [ ] No chart crash

---

### Test Case 8: Cross-Browser Compatibility

**Test on Each Browser**:

| Browser | Canvas Support | Fetch API | Test Result |
|---------|----------------|-----------|-------------|
| Chrome | ✓ | ✓ | [ ] Pass |
| Firefox | ✓ | ✓ | [ ] Pass |
| Edge | ✓ | ✓ | [ ] Pass |
| Safari | ✓ | ✓ | [ ] Pass |

**Verification for Each Browser**:
- [ ] Chart renders without errors
- [ ] Colors display correctly
- [ ] Tooltips work on hover
- [ ] No console errors
- [ ] Responsive design works

---

### Test Case 9: Responsive Design

**Objective**: Verify chart adapts to different screen sizes

**Test Breakpoints**:

#### Mobile (375px wide)
- [ ] Chart readable
- [ ] Legend positioned inside chart
- [ ] Tooltip visible without cutoff
- [ ] No horizontal scroll

#### Tablet (768px wide)
- [ ] Chart fully visible
- [ ] Legend on right side
- [ ] All metrics readable
- [ ] Smooth interaction

#### Desktop (1920px wide)
- [ ] Chart maximized
- [ ] Legend positioned well
- [ ] All detail visible
- [ ] Hover areas responsive

**Resize Test**:
1. Open chart at 1920px width
2. Gradually drag window smaller
3. Verify chart adapts smoothly
4. No layout shifts or jumping

---

### Test Case 10: Authentication & Authorization

**Objective**: Verify API requires proper authentication

**Steps**:
1. Open Network tab in DevTools
2. Make API call without token: `fetch('/api/analysis/recommend-metrics')`
3. Verify request includes Authorization header
4. Try with invalid token
5. Try with valid token

**Expected Results**:
- [ ] API call includes: `Authorization: Bearer <token>`
- [ ] Invalid token returns 401 Unauthorized
- [ ] Valid token returns 200 OK with metrics
- [ ] No sensitive data in response when unauthorized

---

## Performance Benchmarks

### Acceptable Ranges

| Metric | Target | Max Acceptable |
|--------|--------|----------------|
| Chart Render Time | 20ms | 50ms |
| Mouse Hover Response | 5ms | 10ms |
| Tooltip Display | < 1 frame | 20ms |
| API Call Duration | 1s | 3s |
| Memory Usage | 5MB | 15MB |
| Frame Rate | 60fps | 30fps minimum |

### How to Measure

```javascript
// In browser console during testing:

// Measure canvas render time
console.time('canvasRender');
// Trigger chart render
console.timeEnd('canvasRender');

// Monitor memory
console.memory;

// Check frame rate
const fpsTest = () => {
  let frames = 0;
  let start = Date.now();
  const counter = () => {
    frames++;
    if (Date.now() - start >= 1000) {
      console.log(`FPS: ${frames}`);
    } else {
      requestAnimationFrame(counter);
    }
  };
  requestAnimationFrame(counter);
};
```

---

## OpenAI API Monitoring

### Track API Usage
- Monitor API calls in backend logs
- Check OpenAI usage dashboard
- Expected calls: 1 per claim analysis page load
- Cost estimate: ~$0.001 per call (gpt-3.5-turbo)

### Sample OpenAI Prompts Sent

```
Topic: False Vaccine Claim
Prompt: "You are analyzing a fact-check claim to determine which visualization 
metrics would be most useful.

Claim: 'COVID vaccines contain microchips'
Current Verdict: false
Data Points Available: 72
Available Metrics: mentions, engagement, sources

Based on this claim and its verdict, which metrics would best tell the story..."

Response: {
  "metrics": ["mentions", "engagement", "sources"],
  "reasoning": "False claims spread through emotional engagement with false vaccines 
               often lacking credible sources..."
}
```

### Monitor Response Quality
- [ ] Recommendations make logical sense
- [ ] Reasoning is coherent
- [ ] Metrics chosen match verdict type
- [ ] No consistently recommending all metrics
- [ ] Variety in recommendations across different claims

---

## Common Issues & Troubleshooting

### Issue: Chart Not Displaying
**Diagnosis**:
- Check browser console for errors
- Verify canvas element is in DOM
- Check data is being passed correctly

**Solution**:
```javascript
// Add to TrendChart to debug:
useEffect(() => {
  console.log('Canvas ref:', canvasRef.current);
  console.log('Valid data:', validData);
  console.log('Display metrics:', displayMetrics);
}, [validData, displayMetrics]);
```

### Issue: API Call Failing (401)
**Diagnosis**:
- Check localStorage for auth token
- Verify token is passed in headers
- Check token expiration

**Solution**:
```bash
# Clear storage and re-login
localStorage.clear()
# Then login again
```

### Issue: Chart Appears Frozen
**Diagnosis**:
- Main thread is blocked
- Too much data being rendered
- Mouse event listener not cleaning up

**Solution**:
- Reduce data points (sample every Nth point)
- Optimize canvas drawing operations
- Check for memory leaks

### Issue: OpenAI API Timeouts
**Diagnosis**:
- Network connectivity issue
- OpenAI API overloaded
- Invalid API key

**Solution**:
```bash
# Test connectivity
curl -X GET https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Check API status
# Visit: https://status.openai.com
```

---

## Regression Testing Checklist

Run before each deployment:

- [ ] Chart renders without errors
- [ ] All three metrics display correctly
- [ ] Tooltips show accurate data
- [ ] OpenAI recommendations make sense
- [ ] Error handling works (graceful fallback)
- [ ] Performance benchmarks met
- [ ] No console errors or warnings
- [ ] Mobile responsive design works
- [ ] Cross-browser compatibility verified
- [ ] Authentication working
- [ ] Previous features still functional (no regression)

---

## Sign-Off Checklist

When feature is ready for production:

- [ ] All test cases passed
- [ ] No known bugs remaining
- [ ] Performance acceptable
- [ ] Error handling complete
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Team reviewed code
- [ ] Deployment plan created
- [ ] Rollback procedure documented
- [ ] Monitoring alerts configured
