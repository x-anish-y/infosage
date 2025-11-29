# Corrective Outputs Visual Reference Guide

## UI Component Layout

### Main Interface

```
┌────────────────────────────────────────────────────────────────┐
│  ANALYSIS DETAIL PAGE                                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [Summary] [Evidence] [Spread] [Outputs] ◄── Click here       │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Corrective Outputs                    [Generate with AI]      │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ No outputs yet                                           │ │
│  │ Click "Generate with AI" to create corrective messages  │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### After Clicking "Generate with AI"

#### Loading State
```
┌────────────────────────────────────────────────────────────────┐
│                      LOADING STATE                             │
│                                                                │
│                         ↻ Loading                              │
│                                                                │
│                  Generating corrective outputs...              │
│                                                                │
│                     (5-10 seconds)                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

#### Success State (Generated Outputs)

```
┌────────────────────────────────────────────────────────────────┐
│  Corrective Outputs                    [Generate with AI]      │
│                                                                │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ 📱 WhatsApp Message  │  │ 💬 SMS Text         │            │
│  │ [📋 Copy]            │  │ [📋 Copy]           │            │
│  │                      │  │                      │            │
│  │ WhatsApp-friendly... │  │ SMS-friendly...      │            │
│  │                      │  │                      │            │
│  │ Lorem ipsum dolor    │  │ Lorem ipsum dolor    │            │
│  │ sit amet, consectetur│  │ sit amet...          │            │
│  │                      │  │                      │            │
│  │ 245 characters       │  │ 160 characters       │            │
│  └──────────────────────┘  └──────────────────────┘            │
│                                                                │
│  ┌──────────────────────┐  ┌──────────────────────┐            │
│  │ 𝕏 Social Post        │  │ 📝 Long Explainer   │            │
│  │ [📋 Copy]            │  │ [📋 Copy]           │            │
│  │                      │  │                      │            │
│  │ Social media corre...│  │ Social media correct │            │
│  │                      │  │ message here...      │            │
│  │ Lorem ipsum dolor    │  │                      │            │
│  │ sit amet...          │  │ Lorem ipsum dolor    │            │
│  │                      │  │ sit amet, consectetur│            │
│  │ 280 characters       │  │ adipiscing elit...   │            │
│  └──────────────────────┘  │                      │            │
│                            │ Lorem ipsum dolor    │            │
│                            │ sit amet...          │            │
│                            │                      │            │
│                            │ 412 characters       │            │
│                            └──────────────────────┘            │
└────────────────────────────────────────────────────────────────┘
```

#### Copy Feedback

```
Before Copy:              After Copy:
┌──────────────────────┐  ┌──────────────────────┐
│ 📱 WhatsApp Message  │  │ 📱 WhatsApp Message  │
│ [📋 Copy]            │  │ [✓ Copied]           │
│                      │  │ (GREEN BUTTON)       │
└──────────────────────┘  └──────────────────────┘
                          (Feedback for 2 seconds)
```

## Output Format Examples

### 📱 WhatsApp Message (1024 char max)

```
🌍 FACT-CHECK ALERT 🌍

The claim that "The Earth is flat" is MISLEADING.

The FACTS:
✓ The Earth is an oblate spheroid (slightly flattened sphere)
✓ Confirmed by 500+ years of scientific evidence
✓ Satellite imagery proves spherical shape
✓ We've circled the globe multiple times

🔍 Why it matters:
Understanding basic Earth science helps us evaluate other claims critically.

Share this with anyone spreading this myth! 📲

─────────────────────────────────────────
254 characters
```

### 💬 SMS Text (160 char limit)

```
FACT-CHECK: Earth is NOT flat. It's an oblate spheroid, 
confirmed by centuries of scientific evidence & satellite 
imagery. Learn more at factcheck.org

─────────────────────────────────────────
160 characters
```

### 𝕏 Social Post (280 char limit)

```
🌍 MYTH BUSTED: Earth is NOT flat! It's an oblate spheroid, 
proven by centuries of science and satellite data. Stop the 
misinformation. #FactCheck #Science

─────────────────────────────────────────
280 characters
```

### 📝 Long Explainer (200-300 words)

```
THE CLAIM
Some people claim the Earth is flat, contradicting all modern 
scientific evidence.

THE FACTS
Scientific evidence overwhelmingly demonstrates Earth is an 
oblate spheroid:
- Satellite imagery from multiple countries confirms the spherical shape
- Circumnavigation has been completed hundreds of times
- Physics of gravity naturally creates spherical celestial bodies
- Ancient Greeks calculated Earth's circumference accurately
- International space stations orbit above our curved planet

WHY THIS MATTERS
This misconception can undermine trust in other scientific 
findings like climate change, vaccines, and medicine. Critical 
thinking requires accepting evidence-based facts.

RELIABLE SOURCES
- NASA Earth Observatory
- International Space Station imagery
- NOAA satellite data
- Peer-reviewed geology journals

TAKEAWAY
The Earth's spherical shape is not a matter of opinion—it's an 
established scientific fact supported by centuries of evidence and 
modern technology.

─────────────────────────────────────────
287 words
```

## Component Structure

```
CorrectiveOutputs (Main Component)
├── Header Section
│   ├── Title: "Corrective Outputs"
│   └── Button: "Generate with AI"
│
├── Status States
│   ├── No Outputs (default)
│   ├── Loading (spinner)
│   ├── Success (4 cards)
│   └── Error (error message)
│
├── Outputs Grid (4 columns responsive)
│   ├── WhatsApp Card
│   │   ├── Icon + Title
│   │   ├── Copy Button
│   │   ├── Description
│   │   ├── Message Content
│   │   └── Character Count
│   │
│   ├── SMS Card
│   │   ├── Icon + Title
│   │   ├── Copy Button
│   │   ├── Description
│   │   ├── Message Content
│   │   └── Character Count
│   │
│   ├── Social Card
│   │   ├── Icon + Title
│   │   ├── Copy Button
│   │   ├── Description
│   │   ├── Message Content
│   │   └── Character Count
│   │
│   └── Explainer Card (Full Width)
│       ├── Icon + Title
│       ├── Copy Button
│       ├── Description
│       ├── Message Content
│       └── Character Count
```

## Responsive Breakpoints

### Desktop (1024px+)
```
┌─────────────┬─────────────┐
│   Card 1    │   Card 2    │
├─────────────┼─────────────┤
│   Card 3    │   Card 4    │
└─────────────┴─────────────┘
```

### Tablet (768px - 1023px)
```
┌──────────────────────┐
│   Card 1   │ Card 2  │
├────────────┼─────────┤
│   Card 3   │ Card 4  │
└──────────────────────┘
```

### Mobile (< 768px)
```
┌────────────────┐
│    Card 1      │
├────────────────┤
│    Card 2      │
├────────────────┤
│    Card 3      │
├────────────────┤
│    Card 4      │
│  (Full Width)  │
└────────────────┘
```

## Color Scheme

### Light Mode
```
Backgrounds:
- Card Background: #f9fafb (Light Gray)
- Text: #1f2937 (Dark Gray)
- Border: #e5e7eb (Light Border)
- Hover: Lighter with shadow

Buttons:
- Generate: Linear gradient (Blue)
- Copy: Light Blue with text
- Copied: Light Green with text

Accents:
- Primary: #3b82f6 (Blue)
- Success: #10b981 (Green)
- Error: #ef4444 (Red)
```

## State Transitions

```
Initial State
│
├─ User clicks "Generate with AI"
│
▼
Loading State (Show Spinner)
│ ↻ ↻ ↻
│ (5-10 seconds)
│
├─ Success: Show outputs
│ (4 cards with messages)
│
├─ Error: Show error message
│ (User can retry)
│
▼
User Ready to Copy
│
├─ User clicks Copy
│ └─ Show "✓ Copied" (2 seconds)
│
└─ Text in clipboard
   (Ready to paste)
```

## API Flow Diagram

```
Frontend                      Backend                     OpenAI
   │                           │                           │
   │ POST /api/outputs/generate│                           │
   ├──────────────────────────>│                           │
   │                           │                           │
   │ Show Loading Spinner      │ Fetch Claim               │
   │                           │ Fetch Analysis            │
   │                           │                           │
   │                           │ For each output type:     │
   │                           ├──────────────────────────>│
   │                           │ Send Prompt               │
   │                           │ (WhatsApp/SMS/Social/     │
   │                           │  Explainer)               │
   │                           │                           │
   │                           │<──────────────────────────┤
   │                           │ Receive Generated Text    │
   │                           │                           │
   │                           │ (Repeat 3 more times)     │
   │                           │                           │
   │<──────────────────────────┤                           │
   │ JSON Response             │                           │
   │ (All 4 outputs)           │                           │
   │                           │                           │
   │ Hide Loading              │                           │
   │ Display Cards             │                           │
   │                           │                           │
```

## Error States

### Error: API Not Available
```
┌────────────────────────────────────────┐
│ ⚠️ Failed to generate outputs           │
│                                        │
│ Please check your connection and try   │
│ again. If the problem persists, please │
│ contact support.                       │
└────────────────────────────────────────┘
```

### Error: Partial Generation
```
WhatsApp Card: ✓ Generated
SMS Card: ✗ Failed
Social Card: ✓ Generated
Explainer Card: ✓ Generated
```

## Interaction Flowchart

```
                    ┌─ USER ─┐
                    │ Loads   │
                    │ Analysis│
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │ Clicks  │
                    │ Outputs │
                    │ Tab     │
                    └────┬────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         ┌────▼────┐           ┌────▼────┐
         │ Sees    │           │ No      │
         │"Generate│           │Outputs  │
         │with AI" │           │Message  │
         └────┬────┘           └─────────┘
              │
              │ Clicks Button
              │
         ┌────▼────────────┐
         │ Loading Spinner │
         │ (5-10 seconds)  │
         └────┬────────────┘
              │
         ┌────▼──────────────┐
         │ 4 Output Cards    │
         │ with Copy Buttons │
         └────┬──────────────┘
              │
    ┌─────────┼─────────┬─────────┐
    │         │         │         │
┌───▼──┐ ┌───▼──┐ ┌───▼──┐ ┌───▼───┐
│Click │ │Click │ │Click │ │Click  │
│Copy  │ │Copy  │ │Copy  │ │Copy   │
│(WA)  │ │(SMS) │ │(Soc) │ │(Expl) │
└───┬──┘ └───┬──┘ └───┬──┘ └───┬───┘
    │        │        │        │
    ├────────┼────────┼────────┤
    │  Text Copied to Clipboard  │
    │  (Visible Confirmation)    │
    │                            │
    └─ User Pastes Message ──────┘
       Into Target Platform
```

## Visual Feedback States

### Button States

```
DEFAULT STATE:
┌─────────────────────┐
│ 📋 Copy             │
└─────────────────────┘

HOVER STATE:
┌─────────────────────┐
│ 📋 Copy             │ ← Darker border
└─────────────────────┘

CLICKED/COPIED STATE:
┌─────────────────────┐
│ ✓ Copied            │ ← Green background
└─────────────────────┘ (2 second timeout)
```

### Loading Spinner Animation

```
Frame 1:    Frame 2:    Frame 3:    Frame 4:
  ↻           ↻           ↺           ↺
 (top)      (right)     (bottom)     (left)
```

## Typography & Spacing

```
Page Title:      1.125rem, Bold (#1f2937)
Card Title:      0.95rem, Bold (#1f2937)
Description:     0.8rem, Regular (#9ca3af)
Content:         0.875rem, Regular (#1f2937)
Metadata:        0.75rem, Regular (#9ca3af)

Spacing:
- Large Gap:     2rem
- Medium Gap:    1.5rem
- Small Gap:     1rem
- Tiny Gap:      0.5rem

Card Padding:    1.5rem
Text Padding:    1rem
```

---

This visual reference helps understand the complete UI/UX flow of the Corrective Outputs feature.
