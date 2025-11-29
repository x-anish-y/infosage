# Visual Reference - Real-Time Mention Trends

## 📊 Graph Components Explained

```
                                    MENTIONS OVER TIME (72 HOURS)
                                    
     Mentions (Y-Axis)              ╔════════════════════════════════╗
            │                        ║                                ║
        200 ├─────────────────────   ║                                ║
            │                        ║        ╱╲                      ║
        150 ├─────────────────────   ║       ╱  ╲                     ║
            │                        ║      ╱    ╲╱╲                  ║
        100 ├─────────────────────   ║     ╱        ╲╱╲               ║
            │                        ║    ╱            ╲╱╲            ║
         50 ├─────────────────────   ║   ╱                ╲╱────      ║
            │         grid lines     ║  ╱                      ╲______ ║
          0 ├─────────────────────   ║ ╱                            ╲ ║
            └──────────────────────  ╚════════════════════════════════╝
              18:54  20:54  22:54
            (Time - X Axis)

ELEMENTS:
├── Blue line: Mention trend
├── Gradient fill: Visual appeal
├── Data points: 5px circles (white outline)
├── Grid lines: Reference for reading values
├── Axes labels: Time (hours) and Mentions (count)
└── Interactive zone: 15px around each point
```

## 🎯 Hover Interaction

```
Normal State:
┌────────────────────────────────┐
│  Mentions Over Time (72 Hours)  │
│                                │
│    [smooth line graph]         │
│    cursor: crosshair           │
│                                │
└────────────────────────────────┘

Hover Over Data Point:
┌────────────────────────────────┐
│  Mentions Over Time (72 Hours)  │
│                                │
│    [smooth line graph]         │  ┌────────────────────┐
│    cursor: crosshair           │  │ 2025-11-28 20:54  │
│             (point ●)          ◄──│ Mentions: 87      │
│                                │  │ Sources: 12       │
│                                │  │ Engagement: 45%   │
│                                │  │ Trend: Rising ↗   │
└────────────────────────────────┘  └────────────────────┘
                                     ↑ slideUp animation
                                       (appears in 150ms)
```

## 📈 Verdict Pattern Types

### FALSE Claims
```
PATTERN: Spike → Decline → Plateau

    200 │ ╱╲╲
        │╱  ╲╲
    150 │    ╲╲
        │     ╲╲╱
    100 │      ╲ ╲
        │       ╲ ╲
     50 │        ╲_╲___
        │           ╲___
      0 └───────────────── Time (72h)
        0h   24h   48h   72h

Analysis:
├── Hour 0: Posted (warm, viral)
├── Hour 6: Peak (100-150 mentions)
├── Hour 24: Fact-checkers respond (sharp drop)
├── Hour 48: Misinformation debunked (stabilizes low)
└── Hour 72: Dies out (minimal mentions)

Visual Indicators:
├── Trend: Falling ↘ (after peak)
├── Color: Red for downtrend
└── Engagement: Drops from 0.6 → 0.2
```

### TRUE Claims
```
PATTERN: Steady → Growth → Rise

    200 │             ╱╱
        │            ╱╱╱
    150 │      ╱╱╱╱╱╱
        │    ╱╱╱
    100 │ ╱╱╱
        │╱╱
     50 │
      0 └───────────────── Time (72h)
        0h   24h   48h   72h

Analysis:
├── Hour 0: Posted (normal start)
├── Hour 6: Steady spread (60-70 mentions)
├── Hour 24: Growing awareness (80-90 mentions)
├── Hour 48: Continued growth (100-110 mentions)
└── Hour 72: Strong trend (120+ mentions)

Visual Indicators:
├── Trend: Rising ↗ (mostly)
├── Color: Green for uptrend
└── Engagement: Grows from 0.4 → 0.7
```

### MIXED Claims
```
PATTERN: Volatile → Uncertain → Plateau

    200 │  ╱╲  ╱╲╱╲  ╱╲╱
        │ ╱  ╲╱  ╲  ╱  
    150 │╱        ╲╱    ╲
        │                  ╲
    100 │                   ╲╱
        │                   
     50 │                    ╲
      0 └───────────────────── Time (72h)
        0h   24h   48h   72h

Analysis:
├── Hour 0: Posted (conflicting info)
├── Hour 6: Up and down (supporters vs critics)
├── Hour 24: Volatile (misinformation spreads)
├── Hour 48: Still uncertain (mixed coverage)
└── Hour 72: Plateaus at medium (both sides agree to differ)

Visual Indicators:
├── Trend: Stable → (mostly mixed)
├── Color: Purple for uncertain
└── Engagement: High throughout (0.5-0.8)
```

### UNVERIFIED Claims
```
PATTERN: Uncertain → Slow → Plateau

    200 │     ╱╱
        │  ╱╱╱  ╲
    150 │╱╱      ╲╱
        │              
    100 │            ╱╱
        │            ╱╱ ╲
     50 │          ╱    ╲╱───
        │         ╱          ╲
      0 └──────────────────── Time (72h)
        0h   24h   48h   72h

Analysis:
├── Hour 0: Posted (interest spike, maybe)
├── Hour 6: Uncertain (people don't know if true)
├── Hour 24: Slow spread (gradual interest)
├── Hour 48: Plateau (stabilizes)
└── Hour 72: Low plateau (niche interest only)

Visual Indicators:
├── Trend: Stable → (mostly)
├── Color: Purple for uncertain
└── Engagement: Medium throughout (0.4-0.6)
```

## 🎨 Color Coding Guide

```
TREND INDICATORS:

Rising ↗  
├── Color: #16a34a (Green)
├── Example: True claims, growing awareness
├── Icon: Up arrow ↗
└── Meaning: Mentions increasing, spreading

Falling ↘
├── Color: #dc2626 (Red)
├── Example: False claims after debunking
├── Icon: Down arrow ↘
└── Meaning: Mentions decreasing, being debunked

Stable →
├── Color: #8b5cf6 (Purple)
├── Example: Mixed or unverified claims
├── Icon: Right arrow →
└── Meaning: Mentions staying relatively constant
```

## 🖱️ Tooltip Structure

```
┌─────────────────────────────────┐
│ 2025-11-28 20:54:00            │ ← Timestamp (bold, bordered)
├─────────────────────────────────┤
│ Mentions:        87             │ ← Claim mentions
│ Sources:         12             │ ← Unique sources
│ Engagement:      45%            │ ← Interaction rate
│ Trend:    Rising ↗              │ ← Direction with arrow
└─────────────────────────────────┘

STYLING:
├── Background: White (#ffffff)
├── Border: 2px solid #3b82f6
├── Shadow: 0 4px 12px rgba(0,0,0,0.15)
├── Padding: 12px horizontal, 16px vertical
├── Animation: slideUp 0.15s ease-out
├── Position: Fixed (follows mouse)
└── Z-index: 1000 (above everything)

TYPOGRAPHY:
├── Header: Bold 600, dark gray
├── Content: Regular 400, medium gray
├── Separator: Light gray border-top
└── Arrow: Font size 16px, colored per trend
```

## 📱 Responsive Breakpoints

```
DESKTOP (1200px+)
┌──────────────────────────────────────┐
│ Mentions Over Time (72 Hours)        │
├──────────────────────────────────────┤
│                                      │
│          [300px height chart]        │
│                                      │
│     ┌────────────────────────────┐   │
│     │ 2025-11-28 20:54:00       │   │
│     │ Mentions: 87               │   │
│     │ Sources: 12                │   │
│     │ Engagement: 45%            │   │
│     │ Trend: Rising ↗            │   │
│     └────────────────────────────┘   │
│                                      │
└──────────────────────────────────────┘

TABLET (768px-1200px)
┌──────────────────────────┐
│ Mentions Over Time (72h) │
├──────────────────────────┤
│                          │
│   [250px height chart]   │
│                          │
│  ┌────────────────────┐  │
│  │ 2025-11-28 20:54  │  │
│  │ Mentions: 87      │  │
│  │ Sources: 12       │  │
│  │ Engagement: 45%   │  │
│  │ Trend: Rising ↗   │  │
│  └────────────────────┘  │
│                          │
└──────────────────────────┘

MOBILE (<768px)
┌──────────────┐
│  Mentions   │
│  Over Time  │
├──────────────┤
│              │
│ [200px high] │
│ chart view   │
│              │
│ ┌──────────┐ │
│ │ 2025-11│ │
│ │ Menti│87│ │
│ │ Trend↗ │ │
│ └──────────┘ │
└──────────────┘
```

## ⚡ Animation Timeline

```
User hovers over data point:

Time    Action
┌─────────────────────────────────────┐
│ 0ms      Hover detected             │
│          ├─ Calculate distance      │
│          └─ Check if < 15px         │
│                                     │
│ 5ms      Found closest point        │
│          ├─ setHoveredPoint()       │
│          └─ setTooltipPos()         │
│                                     │
│ 10ms     Tooltip ready to render    │
│                                     │
│ 15ms     Render begins              │
│          ├─ Component mounts        │
│          ├─ CSS animation starts    │
│          ├─ slideUp animation       │
│          └─ 0.15s duration          │
│                                     │
│ 165ms    Animation complete         │
│          └─ Tooltip fully visible   │
│                                     │
│ ...      User hovers elsewhere      │
│                                     │
│ X ms     Mouse leaves point         │
│          ├─ mouseleave event        │
│          ├─ setHoveredPoint(null)   │
│          └─ Tooltip disappears      │
└─────────────────────────────────────┘

CSS Animation:
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## 📊 Data Point Calculation

```
Given: 12 data points over 72 hours

Time per point = 72 hours ÷ 11 intervals = ~6.5 hours

Timeline:
Point 1:  Hour 0   (2025-11-28 18:54)
Point 2:  Hour 7   (2025-11-28 25:54) ← wraps to next day
Point 3:  Hour 13  (2025-11-29 07:54)
Point 4:  Hour 20  (2025-11-29 14:54)
Point 5:  Hour 26  (2025-11-29 20:54)
Point 6:  Hour 33  (2025-11-30 03:54)
...
Point 12: Hour 72  (2025-11-30 18:54)

Mention count generation:
├── Base range: 30-180
├── Verdict modifier: Varies by type
├── Random variance: ±20%
├── Minimum: Always 10
└── Maximum: 300+

For FALSE claim:
├── Hour 0-6: High (100-150)
├── Hour 6-24: Medium (50-100)
├── Hour 24+: Low (20-50)

For TRUE claim:
├── Hour 0-6: Medium (60-80)
├── Hour 6-24: Rising (80-110)
├── Hour 24+: High (100-150)
```

## 🎯 Hit Detection Zone

```
Data Point (●) at X=500, Y=150

                Hover Zone
                 15px radius
                   ┌───┐
                   │   │
           ┌───────┤   ├───────┐
           │       │●●●│       │
           │       │●●●│       │
        ┌──┤───────┤●●●├───────├──┐
        │  │       │●●●│       │  │
        │  │       │●●●│       │  │
        │  └───────┤●●●├───────┘  │
        │          │●●●│          │
        │          └─●─┘          │
        │         (point)          │
        │                          │
        └──────────────────────────┘
              15px all around

Mouse Position     Result
└─────────────────────────────┐
├─ (485, 150)  ✅ Show tooltip │
├─ (500, 165)  ✅ Show tooltip │
├─ (515, 140)  ✅ Show tooltip │
├─ (520, 150)  ✅ Show tooltip │
├─ (530, 150)  ❌ Hide tooltip │
├─ (470, 150)  ❌ Hide tooltip │
└─ (500, 180)  ❌ Hide tooltip │

Math:
distance = √[(mouseX - pointX)² + (mouseY - pointY)²]
if (distance < 15) show tooltip
else hide tooltip
```

## 🔍 Zoom Levels

```
FULL VIEW (Default)
- Shows all 12 data points
- Entire 72-hour span visible
- Easy to see overall pattern
- Hover to see details

DESKTOP ZOOM (100%)
- Chart height: 300px
- Point radius: 5px
- Tooltip size: Large
- Text readable from 30cm away

TABLET ZOOM (125%)
- Chart height: 250px
- Point radius: 4px
- Tooltip size: Medium
- Text readable from 40cm away

MOBILE ZOOM (150%)
- Chart height: 200px
- Point radius: 3.5px
- Tooltip size: Small
- Text readable from 20cm away
```

## 🌈 Color Palette

```
PRIMARY COLORS:
├── Chart Blue: #3b82f6 (Line and accent)
├── Chart Fill: rgba(59, 130, 246, 0.3)
└── Grid Gray: #f0f0f0

TREND COLORS:
├── Rising Green: #16a34a (✓ uptrend)
├── Falling Red: #dc2626 (✗ downtrend)
└── Stable Purple: #8b5cf6 (→ neutral)

TEXT COLORS:
├── Headers: #1f2937 (Dark gray, bold)
├── Labels: #6b7280 (Medium gray)
└── Accents: #3b82f6 (Blue, for emphasis)

BACKGROUNDS:
├── Canvas: #ffffff (White)
├── Tooltip: #ffffff (White)
├── Hover zone: Transparent
└── Grid: #f0f0f0 (Light gray)

BORDERS & SHADOWS:
├── Tooltip border: 2px #3b82f6
├── Tooltip shadow: 0 4px 12px rgba(0,0,0,0.15)
├── Grid lines: 1px #e5e7eb
└── Axes: 2px #1f2937
```

---

This visual reference guide helps developers and designers understand the complete user experience of the real-time mention trends feature!

