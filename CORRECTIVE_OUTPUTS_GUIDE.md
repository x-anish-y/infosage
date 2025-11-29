# Corrective Outputs Feature Guide

## Overview
The Corrective Outputs feature allows users to generate and copy fact-check corrective messages in multiple formats using OpenAI's API. Users can create platform-specific content tailored for WhatsApp, SMS, Social Media, and detailed explainers.

## Features

### 1. **Generate with AI Button**
- Generates corrective outputs for all four formats simultaneously
- Shows loading state while processing
- Handles errors gracefully with user-friendly messages

### 2. **Output Formats**

#### 📱 WhatsApp Message
- **Max Length:** 1024 characters
- **Use Case:** Share fact-checks on WhatsApp with friends and groups
- **Features:**
  - Uses emojis for visual engagement
  - Conversational and shareable tone
  - Attention-grabbing hooks
  - Easy to understand corrections

#### 💬 SMS Text
- **Max Length:** 160 characters
- **Use Case:** Send fact-checks via text message
- **Features:**
  - Concise and direct
  - No emojis (SMS compatibility)
  - Clear verdict statement
  - Reference to fact-check resources

#### 𝕏 Social Post
- **Max Length:** 280 characters
- **Use Case:** Post on X (Twitter), Facebook, Instagram
- **Features:**
  - Engaging and shareable
  - Relevant emojis and hashtags (#FactCheck)
  - Creates urgency or importance
  - Clear misinformation correction

#### 📝 Long Explainer
- **Length:** 200-300 words
- **Use Case:** Detailed blog posts, newsletter articles
- **Features:**
  - Structured article format:
    - "The Claim" section
    - "The Facts" section with evidence
    - "Why This Matters" section
    - Reliable sources
  - Accessible language
  - Actionable takeaways

### 3. **Copy to Clipboard**
- One-click copy button for each format
- Visual feedback confirming successful copy
- Character count display for reference
- Optimized for quick sharing

## User Interface

### Component: CorrectiveOutputs.jsx
Located in `frontend/src/components/CorrectiveOutputs.jsx`

**Key Sections:**
1. **Header** - Title and "Generate with AI" button
2. **Output Grid** - Four cards (responsive layout)
3. **Output Cards** - Display message with copy button
4. **States:**
   - No outputs (initial state)
   - Loading (generating)
   - Generated outputs (with copy buttons)
   - Error handling

**Responsive Design:**
- Desktop: 4-column grid with proper spacing
- Tablet: 2-column grid
- Mobile: Single column, full-width buttons

## API Integration

### Endpoint: POST `/api/outputs/generate`

**Request:**
```json
{
  "claimId": "claim-id-here",
  "outputTypes": ["whatsapp", "sms", "social", "explainer"]
}
```

**Response:**
```json
{
  "success": true,
  "claimId": "claim-id",
  "verdict": "false",
  "outputs": {
    "whatsapp": "Generated WhatsApp message...",
    "sms": "Generated SMS text...",
    "social": "Generated social post...",
    "explainer": "Generated detailed article..."
  }
}
```

## Backend Services

### LLM Service: `llmService.js`

**Function:** `generateCorrectiveOutput(claim, verdict, outputType)`

**Parameters:**
- `claim` (string): The original false claim
- `verdict` (object): Contains:
  - `verdict`: 'true', 'false', or 'unverified'
  - `confidence`: 0-1 confidence score
  - `rationale`: Explanation of the verdict
  - `keyFindings`: Array of key evidence points
- `outputType` (string): 'whatsapp', 'sms', 'social', or 'explainer'

**Process:**
1. Validates OpenAI API key
2. Creates context-specific prompt based on output type
3. Calls OpenAI GPT-3.5-turbo API
4. Returns trimmed, formatted response
5. Falls back to stub output if API fails

**Fallback Behavior:**
- If OpenAI API is unavailable, generates placeholder content
- Graceful degradation ensures feature doesn't break
- Logs warnings for monitoring

## Configuration

### Required Environment Variables
```
OPENAI_API_KEY=sk-your-api-key-here
```

### Optional Configuration
- Model: Can be updated from `gpt-3.5-turbo` to `gpt-4` in llmService.js
- Temperature: 0.7 (balanced creativity)
- Max tokens: Varies by output type (300-1000)

## Usage Flow

1. **User navigates to Analysis Detail page**
2. **Clicks "Outputs" tab**
3. **Sees "Generate with AI" button**
4. **Clicks button to generate corrective messages**
5. **Waits for API response (usually 5-10 seconds)**
6. **Selects desired format and clicks "Copy"**
7. **Pastes message into target platform**

## Features & Benefits

### For Content Creators
- Save time creating platform-specific content
- Maintain consistency in fact-checking messaging
- Quick turnaround for responses

### For Fact-Checkers
- Standardized corrective messaging
- Multiple distribution channels
- Easy tracking of corrective reach

### For Audiences
- Accessible fact-checks on their preferred platform
- Clear, concise corrections
- Detailed explanations when needed

## Error Handling

### Scenario 1: Missing OpenAI API Key
- Falls back to stub content
- User sees placeholder messages
- Can still use copy button

### Scenario 2: API Timeout
- Logs error with details
- Shows user-friendly error message
- Suggests retry

### Scenario 3: Missing Data
- Validates claim and analysis exist
- Returns 404 if not found
- Clear error response

## Performance Considerations

- API calls timeout after 30 seconds
- Token limits prevent oversized responses
- Error logging for monitoring
- Audit trail records all generations

## Future Enhancements

1. **Caching** - Store generated outputs to reduce API calls
2. **Customization** - Let users adjust tone/length
3. **Language Support** - Generate in multiple languages
4. **Scheduling** - Queue large batch generations
5. **Analytics** - Track which formats are most copied/shared
6. **A/B Testing** - Compare message effectiveness

## Troubleshooting

### Messages not generating?
1. Check OPENAI_API_KEY is set correctly
2. Verify API key has available credits
3. Check network connectivity
4. Review backend logs for errors

### Copy button not working?
1. Ensure HTTPS context (localhost works)
2. Check browser clipboard permissions
3. Try alternative browser
4. Clear browser cache

### Messages seem generic?
1. Ensure analysis verdict is accurate
2. Check that rationale is populated
3. Try regenerating (may get variations)
4. Consider using GPT-4 for better quality

## Code References

**Frontend Files:**
- `src/components/CorrectiveOutputs.jsx` - Main component
- `src/components/CorrectiveOutputs.css` - Styling
- `src/pages/AnalysisDetail.jsx` - Integration point

**Backend Files:**
- `src/routes/outputs.js` - API endpoint
- `src/services/llmService.js` - LLM integration
- `src/models/Analysis.js` - Data model

## Security Notes

- API key stored in environment variables (never in code)
- Request validation on backend
- User authentication via JWT (implemented in middleware)
- Audit logging of all generations

## Testing Recommendations

1. Test with various claim types
2. Verify character limits
3. Check clipboard functionality across browsers
4. Validate error messages
5. Test on mobile devices
6. Verify API error handling
