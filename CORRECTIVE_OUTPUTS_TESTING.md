# Testing & Verification Guide: Corrective Outputs Feature

## Pre-Deployment Checklist

### Environment Setup
- [ ] OpenAI API key obtained from https://platform.openai.com
- [ ] API key has available credits
- [ ] Backend `.env` file contains `OPENAI_API_KEY`
- [ ] Backend server running on port 4000
- [ ] Frontend server running on port 5173
- [ ] MongoDB connection active
- [ ] Sample claims in database

### Code Review
- [ ] CorrectiveOutputs.jsx component created
- [ ] CorrectiveOutputs.css styling applied
- [ ] AnalysisDetail.jsx updated with component import
- [ ] outputs.js route enhanced
- [ ] llmService.js prompts updated
- [ ] No console errors in development

## Manual Testing Guide

### Test Case 1: Basic Feature Test

**Objective:** Verify the feature appears and generates content

**Steps:**
1. Open the application
2. Login to an account
3. Navigate to Analysis page
4. Click on a claim
5. Click "Outputs" tab
6. Verify "Generate with AI" button is visible

**Expected Results:**
- [ ] Button is blue and clickable
- [ ] No console errors
- [ ] Component loads without errors

**Pass/Fail:** ___________

---

### Test Case 2: Loading State Test

**Objective:** Verify loading indicator appears

**Steps:**
1. From Outputs tab, click "Generate with AI"
2. Observe the interface immediately

**Expected Results:**
- [ ] Loading spinner appears
- [ ] Button text changes to "Generating..."
- [ ] Button is disabled
- [ ] "Generating corrective outputs..." message shows
- [ ] Spinner rotates smoothly

**Pass/Fail:** ___________

---

### Test Case 3: Content Generation Test

**Objective:** Verify all 4 formats generate content

**Steps:**
1. Click "Generate with AI"
2. Wait 5-15 seconds
3. Verify all cards appear with content

**Expected Results:**
- [ ] WhatsApp card shows message
- [ ] SMS card shows message
- [ ] Social card shows message
- [ ] Explainer card shows article
- [ ] No error messages
- [ ] All messages are different
- [ ] Character counts display

**Pass/Fail:** ___________

---

### Test Case 4: Copy Functionality Test

**Objective:** Verify copy-to-clipboard works

**Steps:**
1. After generation, click "📋 Copy" on WhatsApp card
2. Open any text editor (Notepad, Word, etc.)
3. Paste the text (Ctrl+V)

**Expected Results:**
- [ ] Full WhatsApp message pastes into editor
- [ ] Button shows "✓ Copied" confirmation
- [ ] Confirmation disappears after 2 seconds
- [ ] Text is complete and accurate
- [ ] Formatting preserved

**Pass/Fail:** ___________

---

### Test Case 5: All Copy Buttons Test

**Objective:** Verify each format can be copied

**Steps:**
1. Copy SMS message to text editor
2. Clear and copy Social message to text editor
3. Clear and copy Explainer to text editor

**Expected Results:**
- [ ] SMS message (160 chars max) copies correctly
- [ ] Social message (280 chars max) copies correctly
- [ ] Explainer (200-300 words) copies correctly
- [ ] All have accurate character counts
- [ ] Each copy shows confirmation

**Pass/Fail:** ___________

---

### Test Case 6: Format Validation Test

**Objective:** Verify output formats follow specifications

**Steps:**
1. After generation, check each format

**WhatsApp Message:**
- [ ] Contains emojis (✓, ✗, 📍, etc.)
- [ ] Conversational tone
- [ ] Under 1024 characters
- [ ] Mentions verdict clearly
- [ ] Includes key findings

**SMS Message:**
- [ ] Under 160 characters
- [ ] No emojis
- [ ] Direct and concise
- [ ] Clear verdict

**Social Post:**
- [ ] Under 280 characters
- [ ] Contains emojis
- [ ] Has hashtags (#FactCheck)
- [ ] Engaging tone

**Explainer:**
- [ ] 200-300 words range
- [ ] Structured format
- [ ] "The Claim" section
- [ ] "The Facts" section
- [ ] "Why This Matters" section

**Pass/Fail:** ___________

---

### Test Case 7: Responsive Design Test

**Objective:** Verify UI works on different screen sizes

**Desktop (1024px+):**
- [ ] 4-column grid
- [ ] All cards visible
- [ ] Proper spacing
- [ ] Buttons clickable

**Tablet (768px):**
- [ ] 2-column grid
- [ ] Cards properly sized
- [ ] Text readable
- [ ] Copy buttons accessible

**Mobile (360px):**
- [ ] Single column
- [ ] Full-width cards
- [ ] Buttons centered
- [ ] Text readable
- [ ] No horizontal scroll
- [ ] Explainer full-width

**Pass/Fail:** ___________

---

### Test Case 8: Error Handling Test

**Objective:** Verify graceful error handling

**Steps:**
1. Remove/invalidate OPENAI_API_KEY in .env
2. Restart backend
3. Try to generate outputs

**Expected Results:**
- [ ] Error message displays
- [ ] Message is user-friendly
- [ ] No console errors
- [ ] No blank content
- [ ] Placeholder messages shown
- [ ] Copy buttons still work

**Pass/Fail:** ___________

---

### Test Case 9: Different Claim Types Test

**Objective:** Verify feature works with various claims

**Steps:**
1. Test with political claim
2. Test with health claim
3. Test with scientific claim

**Expected Results:**
- [ ] All generate relevant content
- [ ] Messages address specific claim
- [ ] Verdicts are accurate
- [ ] Rationale is clear
- [ ] Content is appropriate

**Pass/Fail:** ___________

---

### Test Case 10: Performance Test

**Objective:** Verify API response time

**Steps:**
1. Open browser DevTools (F12)
2. Click "Generate with AI"
3. Monitor Network tab
4. Note time to response

**Expected Results:**
- [ ] Response under 15 seconds
- [ ] Typical time 5-10 seconds
- [ ] No timeout errors
- [ ] Single API request visible
- [ ] Response status 200

**Pass/Fail:** ___________

**Response Time:** _________ seconds

---

### Test Case 11: Multiple Generations Test

**Objective:** Verify can generate multiple times

**Steps:**
1. Generate outputs
2. Click "Generate with AI" again
3. Wait for new generation
4. Compare with previous

**Expected Results:**
- [ ] Second generation succeeds
- [ ] New content generated (may differ)
- [ ] No stale data shown
- [ ] Loading state appears
- [ ] No errors

**Pass/Fail:** ___________

---

### Test Case 12: Character Count Accuracy Test

**Objective:** Verify character counts are correct

**Steps:**
1. Copy each message to text editor
2. Check character count in editor
3. Compare with displayed count

**Expected Results:**
- [ ] WhatsApp count matches
- [ ] SMS count matches
- [ ] Social count matches
- [ ] Explainer count matches
- [ ] Counts within acceptable range

**Pass/Fail:** ___________

---

## Browser Compatibility Testing

### Chrome/Chromium
- [ ] Component renders
- [ ] Copy works
- [ ] Loading animation smooth
- [ ] Responsive design works

### Firefox
- [ ] Component renders
- [ ] Copy works
- [ ] Loading animation smooth
- [ ] All features functional

### Safari
- [ ] Component renders
- [ ] Copy works
- [ ] Loading animation smooth
- [ ] Mobile view works

### Edge
- [ ] Component renders
- [ ] Copy works
- [ ] Loading animation smooth
- [ ] No compatibility issues

---

## Performance Metrics Verification

### API Response Time
```
Test 1: _____ seconds
Test 2: _____ seconds
Test 3: _____ seconds
Average: _____ seconds
Target: < 15 seconds
Status: PASS / FAIL
```

### Content Quality
```
WhatsApp Quality: ☐ Excellent ☐ Good ☐ Fair ☐ Poor
SMS Quality:      ☐ Excellent ☐ Good ☐ Fair ☐ Poor
Social Quality:   ☐ Excellent ☐ Good ☐ Fair ☐ Poor
Explainer Quality:☐ Excellent ☐ Good ☐ Fair ☐ Poor
```

### User Experience
```
Ease of Use:      ☐ Excellent ☐ Good ☐ Fair ☐ Poor
Loading Feedback: ☐ Excellent ☐ Good ☐ Fair ☐ Poor
Copy Feedback:    ☐ Excellent ☐ Good ☐ Fair ☐ Poor
Error Handling:   ☐ Excellent ☐ Good ☐ Fair ☐ Poor
```

---

## Automated Testing (Optional)

### Unit Tests

**Test: generateOutputs function**
```javascript
describe('CorrectiveOutputs', () => {
  test('should call API on generateOutputs', async () => {
    // Mock API
    // Call generateOutputs
    // Assert API was called with correct params
  });

  test('should update outputs state on success', async () => {
    // Mock API response
    // Call generateOutputs
    // Assert outputs state updated
  });

  test('should show error on API failure', async () => {
    // Mock API to reject
    // Call generateOutputs
    // Assert error state set
  });
});

describe('copyToClipboard', () => {
  test('should copy text to clipboard', () => {
    // Mock navigator.clipboard
    // Call copyToClipboard
    // Assert clipboard.writeText called
  });

  test('should show copied feedback', () => {
    // Call copyToClipboard
    // Assert copiedType state set
    // Assert timeout clears state
  });
});
```

### Integration Tests

**Test: End-to-end flow**
```javascript
describe('Corrective Outputs E2E', () => {
  test('user can generate and copy messages', async () => {
    // Render component
    // Click generate button
    // Wait for API response
    // Click copy button
    // Assert clipboard contains text
  });

  test('error state shows fallback content', async () => {
    // Mock API to fail
    // Click generate button
    // Assert error message shown
    // Assert copy buttons still work
  });
});
```

---

## Database Verification

### Check Sample Data
```javascript
// Verify claims exist
db.claims.find().limit(5)

// Verify analysis exists
db.analysis.find().limit(5)

// Check audit logs
db.auditlogs.find({ action: 'CORRECTIVE_OUTPUT_GENERATED' }).limit(10)
```

---

## Security Testing

### API Endpoint Security
- [ ] Requires authentication token
- [ ] Validates claimId is valid MongoDB ID
- [ ] Returns 404 if claim not found
- [ ] Returns 404 if analysis not found
- [ ] Sanitizes inputs

### Environment Variable Security
- [ ] API key not exposed in frontend code
- [ ] API key not logged
- [ ] API key not sent to client
- [ ] Stored securely in .env file

### CORS & Permissions
- [ ] Request includes valid JWT token
- [ ] Cross-origin requests properly handled
- [ ] User can only access own claims (if applicable)

---

## Logging Verification

### Backend Logs
```
Check for:
☐ "Output generated" log entries
☐ Correct outputType in logs
☐ Correct claimId in logs
☐ Correct text length
☐ Error entries for failures
☐ Audit log entries created
```

### Example Log Entry
```
[INFO] Output generated: { 
  claimId: '507f1f77bcf86cd799439011', 
  outputType: 'whatsapp',
  length: 254
}
```

---

## Regression Testing

### Existing Features
- [ ] Analysis page still works
- [ ] Summary tab works
- [ ] Evidence tab works
- [ ] Spread tab works
- [ ] Other output types work
- [ ] Navigation works
- [ ] Authentication works

---

## Post-Deployment Testing

### Live Environment Verification
- [ ] Feature accessible in production
- [ ] OpenAI API working with production key
- [ ] No 502/503 errors
- [ ] Response times acceptable
- [ ] Errors properly logged
- [ ] Audit trail created

### Monitor First 24 Hours
- [ ] Check error logs hourly
- [ ] Monitor API costs
- [ ] Verify user feedback
- [ ] Check performance metrics
- [ ] Rollback plan ready

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | _________ | _____ | _________ |
| Developer | _________ | _____ | _________ |
| Product | _________ | _____ | _________ |
| DevOps | _________ | _____ | _________ |

---

## Known Issues Found During Testing

| Issue | Severity | Resolution | Status |
|-------|----------|------------|--------|
| _____ | _____ | _____ | _____ |
| _____ | _____ | _____ | _____ |

---

## Recommendations

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

**Testing Date:** _____________
**Tester Name:** _____________
**Overall Status:** ☐ PASS ☐ FAIL (with conditions)
