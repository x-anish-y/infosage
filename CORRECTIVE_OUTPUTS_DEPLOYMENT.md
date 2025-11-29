# 🚀 Corrective Outputs Feature - Deployment Guide

## Quick Deployment (5 minutes)

### Step 1: Set Up OpenAI API Key (1 minute)

1. Go to https://platform.openai.com
2. Sign in to your account
3. Navigate to API keys section
4. Create a new API key
5. Copy the key

### Step 2: Configure Backend (1 minute)

**Windows (PowerShell):**
```powershell
# Navigate to backend
cd backend

# Create or edit .env file
echo 'OPENAI_API_KEY=sk-your-api-key-here' > .env
```

**Linux/Mac:**
```bash
cd backend
echo 'OPENAI_API_KEY=sk-your-api-key-here' > .env
```

### Step 3: Restart Servers (2 minutes)

```bash
# Kill existing processes
taskkill /IM node.exe /F

# Restart backend
cd backend
npm start

# In new terminal, start frontend
cd frontend
npm run dev
```

### Step 4: Test Feature (1 minute)

1. Open http://localhost:5173
2. Login
3. Go to any analysis
4. Click "Outputs" tab
5. Click "Generate with AI"
6. See messages generate in 5-10 seconds
7. Click "Copy" on any message

## Installation Verification

### ✓ Check Files Exist

**Frontend:**
```bash
ls frontend/src/components/CorrectiveOutputs.jsx
ls frontend/src/components/CorrectiveOutputs.css
```

**Backend:**
```bash
grep -n "generateCorrectiveOutput" backend/src/services/llmService.js
grep -n "POST /generate" backend/src/routes/outputs.js
```

### ✓ Verify Dependencies

All required packages already installed:
```json
// Already in package.json
"express": "^4.18.2",
"axios": "^1.6.2",
"dotenv": "^16.3.1"
```

### ✓ Check Configuration

```bash
# Verify .env exists
cat backend/.env | grep OPENAI_API_KEY

# Verify API key is set
echo $OPENAI_API_KEY  # (Linux/Mac)
echo $env:OPENAI_API_KEY  # (PowerShell)
```

## Production Deployment

### 1. Environment Setup

**Create production .env:**
```bash
OPENAI_API_KEY=sk-prod-api-key-here
MONGODB_URI=mongodb+srv://user:pass@prod.mongodb.net/infosage
NODE_ENV=production
```

### 2. Backend Deployment

```bash
# Install dependencies
npm install

# Build (if applicable)
npm run build

# Start server
npm start

# Or use PM2 for production
pm2 start src/server.js --name infosage-backend
```

### 3. Frontend Deployment

```bash
# Build for production
npm run build

# Serve build
npm install -g serve
serve -s dist -l 3000
```

### 4. Environment Variables

**Set in your hosting platform:**
- Vercel: Settings → Environment Variables
- Heroku: Config Vars
- AWS: Parameter Store / Secrets Manager
- Docker: Environment file

## Docker Deployment (Optional)

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY backend/package.json .
RUN npm install

COPY backend/src ./src

ENV OPENAI_API_KEY=${OPENAI_API_KEY}
ENV NODE_ENV=production

CMD ["npm", "start"]

EXPOSE 4000
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY frontend/package.json .
RUN npm install

COPY frontend .
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      MONGODB_URI: mongodb://mongo:27017/infosage
    depends_on:
      - mongo
    volumes:
      - ./backend/logs:/app/logs

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## Monitoring & Logging

### Check Logs

**Backend logs:**
```bash
tail -f backend/logs/error.log
tail -f backend/logs/combined.log
```

**Watch for:**
- OpenAI API errors
- Timeout errors
- Authentication failures

### Monitor Metrics

```bash
# API usage tracking
grep "Output generated" backend/logs/combined.log | wc -l

# Error rate
grep "Output generation failed" backend/logs/error.log | wc -l

# Average response time
grep "Output generated" backend/logs/combined.log | head -20
```

## Troubleshooting

### Issue: "No API key found"

**Solution:**
```bash
# Verify .env exists
cat backend/.env

# Verify key is set
echo $OPENAI_API_KEY

# Update .env
OPENAI_API_KEY=sk-your-key-here
```

### Issue: "Failed to generate outputs"

**Solutions:**
1. Check API key validity: https://platform.openai.com/account/api-keys
2. Check API credits: https://platform.openai.com/account/usage/overview
3. Check rate limits
4. Restart backend server

### Issue: CORS Error

**Solution in backend:**
```javascript
// In server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Issue: Port Already in Use

**Solution:**
```bash
# Kill process using port 4000
lsof -ti:4000 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :4000    # Windows

# Or use different port
PORT=5000 npm start
```

## Performance Tuning

### Reduce API Costs

1. **Implement Caching:**
```javascript
// Cache generated outputs
const cache = new Map();

if (cache.has(claimId)) {
  return cache.get(claimId);
}
// ... generate ...
cache.set(claimId, outputs);
```

2. **Use Faster Model (if available):**
```javascript
// In llmService.js
model: 'gpt-3.5-turbo'  // Faster and cheaper
// vs
model: 'gpt-4'  // More capable but slower/expensive
```

3. **Batch Generation:**
```javascript
// Generate during off-peak hours
scheduler.schedule('0 2 * * *', generateBatchOutputs);
```

### Optimize Response Time

1. **Increase Timeout (for slow networks):**
```javascript
timeout: 45000  // 45 seconds instead of 30
```

2. **Parallel Processing:**
```javascript
// Already implemented - all 4 formats generated in parallel
await Promise.all(promises);
```

3. **Enable Compression:**
```javascript
app.use(compression());
```

## Security Hardening

### 1. API Key Rotation

```bash
# Generate new key
# Update .env
# Restart server
# Revoke old key

# Schedule rotation
crontab -e
# 0 0 1 * * /path/to/rotate-keys.sh
```

### 2. Rate Limiting

```javascript
// Already configured in middleware/rateLimiter.js
// Limit requests per IP
```

### 3. Input Validation

```javascript
// Validate claim ID format
if (!mongoose.Types.ObjectId.isValid(claimId)) {
  return res.status(400).json({ error: 'Invalid claim ID' });
}
```

### 4. Audit Logging

```javascript
// Every generation is logged
await AuditLog.create({
  action: 'CORRECTIVE_OUTPUT_GENERATED',
  claimId,
  userId,
  timestamp: new Date()
});
```

## Rollback Plan

### If Issues Occur

1. **Immediate Rollback:**
```bash
# Revert to previous version
git checkout HEAD~1

# Kill current server
taskkill /IM node.exe /F

# Restart
npm start
```

2. **Database Rollback:**
```bash
# Rollback MongoDB
mongorestore --drop /path/to/backup
```

3. **Feature Disable:**
```javascript
// In AnalysisDetail.jsx, comment out:
// <CorrectiveOutputs ... />

// Or use feature flag:
if (features.correctiveOutputs) {
  // render component
}
```

## Cost Management

### Monitor OpenAI Usage

```bash
# Check usage
curl https://api.openai.com/v1/usage \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Set Spending Limits

1. Go to https://platform.openai.com/account/billing/limits
2. Set Hard Limit
3. Set Soft Limit (email notification)

### Optimize Costs

```
Current: GPT-3.5-turbo @ ~$0.002 per request
Options:
- Use smaller models for simple tasks
- Implement caching to reduce API calls
- Batch requests during off-peak
- Monitor and alert on overages
```

## Success Metrics

### Track These KPIs

| Metric | Target | Check |
|--------|--------|-------|
| API Success Rate | > 95% | Daily |
| Response Time | < 15s | Hourly |
| User Adoption | Increasing | Weekly |
| Error Rate | < 1% | Daily |
| Cost per Request | < $0.005 | Weekly |

## Maintenance Schedule

### Daily
- [ ] Check error logs
- [ ] Verify API health

### Weekly
- [ ] Monitor costs
- [ ] Review user feedback
- [ ] Check performance metrics

### Monthly
- [ ] Rotate API keys
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Optimize prompts based on usage

### Quarterly
- [ ] Full system backup
- [ ] Security audit
- [ ] Performance review
- [ ] Plan enhancements

## Support Contacts

| Role | Responsibility | Contact |
|------|-----------------|---------|
| DevOps | Infrastructure | deploy@company.com |
| Backend | API/Services | backend@company.com |
| Frontend | UI/UX | frontend@company.com |
| Security | Secrets/Keys | security@company.com |

## Documentation Links

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Express.js Guide](https://expressjs.com)
- [React Documentation](https://react.dev)
- [MongoDB Docs](https://docs.mongodb.com)
- [Project README](./README.md)

---

**Deployment Date:** _____________
**Deployed By:** _____________
**Version:** 1.0
**Status:** ✅ READY FOR PRODUCTION

For issues, contact the DevOps team or refer to troubleshooting section above.
