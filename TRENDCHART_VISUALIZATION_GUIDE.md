# TrendChart Multi-Metric Visualization Guide

## Chart Structure Overview

```
┌─────────────────────────────────────────────────────────────┐
│ Mentions Over Time (72 Hours)                               │
├─────────────────────────────────────────────────────────────┤
│                                                           Engagement(%)│
│  |                                                             100%  │
│  |     ▲ Mentions (Blue)                                       80%  │
│  |    ╱│╲                                                       60%  │
│  |   ╱ │ ╲ ───── Engagement (Green)                           40%  │
│  |  ╱  │  ╲╱────╲                                             20%  │
│  | ╱   │   ╲    ╲  ─·─·─ Sources (Orange)                     0%  │
│  │     │    ╲    ╲╱─·─·─╲                                        │
│  │     │     ╲         ·───╲                                      │
│  └─────┴──────────────────────────────────────────────────────── │
│  0     6      12      18      24      30      36    Time(hours)   │
│                                                                    │
│ Legend:                                                            │
│ ◼ Mentions  ◼ Engagement  ◼ Sources                              │
└─────────────────────────────────────────────────────────────┘
```

## Metric Display Logic

### Based on Claim Verdict

#### FALSE Claims
```
Recommended Metrics: Mentions + Engagement + Sources
Why: False claims often use emotional manipulation (engagement spike)
     Shows both spread (mentions) and credibility issues (sources)
Visualization: 
  - Mentions: Shows viral spread
  - Engagement: Highlights emotional manipulation
  - Sources: Shows lack of credible origins
```

#### TRUE Claims
```
Recommended Metrics: Mentions + Sources
Why: True claims have credible sources
     Engagement may be lower but demonstrates credibility
Visualization:
  - Mentions: Shows legitimate spread
  - Sources: Demonstrates credibility
  - (Engagement optional: shows impact)
```

#### MIXED/UNVERIFIED Claims
```
Recommended Metrics: Mentions + Engagement + Sources
Why: All metrics important to show nuance
     Need to show both spread and source credibility
Visualization:
  - All three metrics displayed with context
```

## Interactive Tooltip

When user hovers over a data point:

```
┌──────────────────────────┐
│ Time: 14:35:22          │
│ Mentions: 2,847         │
│ Engagement: 34.5%       │
│ Sources: 12             │
│ Trend: Rising           │
└──────────────────────────┘
```

**Only shows metrics in displayMetrics array**
- If chart shows "Mentions + Engagement", tooltip won't show "Sources"
- Tooltip updates dynamically based on AI recommendation

## Color Scheme

| Metric | Color | Hex Code | Use Case |
|--------|-------|----------|----------|
| Mentions | Blue | #3b82f6 | Spread velocity, primary metric |
| Engagement | Green | #10b981 | Emotional impact, interaction rate |
| Sources | Orange | #f59e0b | Credibility, origin diversity |

## Data Point Visualization

```
Primary Metric (Mentions) - Larger circles with outlines:
  ● ● ● ● ● ●  (5px circles, white outline)

Secondary/Tertiary Metrics - Thin lines without points:
  ─ ─ ─ ─ ─ ─  (2-3px lines, no point markers)
```

## OpenAI Recommendation Flow

```
User loads analysis page
          ↓
[TrendChart Component Mount]
          ↓
Collect available metrics:
- hasEngagement? (check data)
- hasSources? (check data)
- mentions? (always true)
          ↓
POST to /api/analysis/recommend-metrics
{
  claimId: "123abc",
  dataPoints: 72,
  hasEngagement: true,
  hasSources: true,
  hasTrend: true
}
          ↓
[Backend Analysis Route]
          ↓
Get claim context from database
          ↓
Call OpenAI GPT-3.5-turbo with:
"Given this FALSE claim about vaccines,
which metrics best show the story?
Available: mentions, engagement, sources
          ↓
[OpenAI Response]
{
  "metrics": ["mentions", "engagement", "sources"],
  "reasoning": "False claims often use emotional 
              manipulation (engagement), show rapid 
              spread (mentions), and lack credible 
              sources"
}
          ↓
Return to Frontend
          ↓
[TrendChart Updates State]
setDisplayMetrics(['mentions', 'engagement', 'sources'])
setAiAnalysis(reasoning)
          ↓
[Canvas Re-renders]
Draws three metric lines with legend
          ↓
Ready for user interaction
```

## Y-Axis Scales

```
LEFT SIDE (Mentions):          RIGHT SIDE (Engagement %):
5000                           100%
4000                            80%
3000                            60%
2000                            40%
1000                            20%
0                               0%

Scaled proportionally to data
minimum values shown above
actual max calculated from data
```

## Time Window

- **X-Axis**: 72 hours (3 days)
- **Labels**: Every 6 hours (0, 6, 12, 18, 24, 30, 36... hours)
- **Format**: HH:MM (24-hour format)
- **Range**: Displays most recent 72 hours of data

## Interaction Patterns

### Hover Detection
```
Mouse position within 15px of data point
       ↓
Show tooltip at mouse location (+10px offset)
       ↓
Display all relevant metrics for that time point
       ↓
Mouse moves outside 15px radius
       ↓
Tooltip hidden
```

### Legend Interaction
```
Displays metrics included in chart:
✓ Mentions (Blue square) - always shown
✓ Engagement (Green square) - if recommended
✓ Sources (Orange square) - if recommended
```

## Error States

### When API Fails
```
Chart still renders with DEFAULT metrics:
['mentions', 'engagement', 'sources']

Reason shown in console:
"Error getting AI recommendation: Network error"

User Experience:
- Chart shows all available data
- No visual indication of error
- Graceful degradation
```

### When Claim Not Found
```
API returns 404 error
Backend falls back to defaults
Chart renders with all metrics available
```

## Performance Characteristics

- **Canvas Rendering**: <50ms per draw
- **Mouse Tracking**: <10ms per event
- **OpenAI API Call**: 1-2 seconds (includes network latency)
- **Metric Recommendation**: Called once per component mount
- **Chart Update**: Immediate when displayMetrics changes

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Canvas API: Required (all modern browsers support)
- Fetch API: Required (no IE11 support)

## Accessibility Notes

- Tooltip information also available via:
  - Data export feature
  - Accessible data table view
- Legend uses color + text labels
- High contrast colors (blue/green/orange)
- Font sizes: 12px (legend), 11px (labels), 10px (tooltip)

## Example Scenarios

### Scenario 1: COVID Vaccine Misinformation
```
Verdict: FALSE
Recommended Metrics: Mentions + Engagement + Sources
Display:
- Mentions: 10,000+ (rapid viral spread)
- Engagement: 45-60% (high emotional reaction)
- Sources: 2-3 origins (limited credible sources)
Story: "False claim spread rapidly with high engagement
        but from unreliable sources"
```

### Scenario 2: Breaking News (True)
```
Verdict: TRUE
Recommended Metrics: Mentions + Sources
Display:
- Mentions: 5,000+ (legitimate news spread)
- Sources: 15+ (multiple credible origins)
- (Engagement not included - less relevant)
Story: "News spread through credible sources"
```

### Scenario 3: Scientific Claim (Mixed)
```
Verdict: MIXED
Recommended Metrics: Mentions + Engagement + Sources
Display:
- Mentions: 3,000+ (moderate spread)
- Engagement: 20-30% (balanced reactions)
- Sources: 8-10 (mix of credible and non-credible)
Story: "Nuanced claim with mixed credibility sources"
```

## Future Enhancement Ideas

1. **Animated Chart**: Show data points appearing over time
2. **Confidence Bands**: Uncertainty ranges for predictions
3. **Peak Detection**: Highlight significant events
4. **Comparison Mode**: Overlay multiple claims on same chart
5. **Data Export**: Download data as CSV with metric analysis
6. **Custom Filters**: Choose which metrics to display manually
7. **Real-time Updates**: Live metrics as new data arrives
