# InfoSage Project File Reference

## 📂 Directory Structure & Key Files

### Root Level
```
infosage/
├── package.json                  # Root package with dev scripts
├── .env.template                 # Environment variables template
├── .gitignore                    # Git ignore rules
├── README.md                     # Full documentation (500+ lines)
├── QUICKSTART.md                 # 5-minute quick start guide
├── IMPLEMENTATION_SUMMARY.md     # This project summary
```

---

## 🔧 Backend (`backend/`)

### Configuration & Entry
```
backend/
├── package.json                  # Dependencies (Express, MongoDB, Socket.io, etc.)
├── .env                         # Environment file (git-ignored)
├── .gitignore                   # Backend-specific ignores
└── src/
    └── server.js                # ⭐ Main Express server + Socket.io setup
```

### Models (`backend/src/models/`)
```
User.js                          # User authentication & roles schema
Claim.js                         # Individual claim documents
Cluster.js                       # Grouped claims with risk metrics
Analysis.js                      # Fact-check verdicts & confidence
Media.js                         # Images/videos with OCR & forensics
AuditLog.js                      # Action history for compliance
```

### Routes (`backend/src/routes/`)
```
auth.js                          # Login/logout endpoints
claims.js                        # Create, search, get claims
clusters.js                      # List, detail, recompute clusters
analysis.js                      # Get/run analysis
media.js                         # Upload & process images/videos
outputs.js                       # Generate corrective content
review.js                        # Escalate/resolve workflow
```

### Services (`backend/src/services/`)
```
huggingFaceService.js           # Embeddings, sentiment, toxicity, image analysis
llmService.js                   # OpenAI verdict & corrective output generation
mediaService.js                 # OCR (Tesseract), manipulation detection, reverse image
analysisService.js              # Risk scoring, auto-escalation logic
clusteringService.js            # K-means clustering, similarity search
```

### Middleware (`backend/src/middleware/`)
```
auth.js                         # JWT verification, role-based access control
rateLimiter.js                  # Express rate-limit middleware
```

### Utilities (`backend/src/utils/`)
```
logger.js                       # Winston logger with file + console output
cache.js                        # LRU cache implementation
```

### Scripts (`backend/scripts/`)
```
seed.js                         # Database seeding with mock data
```

---

## ⚛️ Frontend (`frontend/`)

### Configuration & Build
```
frontend/
├── package.json                 # Dependencies (React, Vite, Axios, etc.)
├── vite.config.js              # Vite bundler configuration
├── tsconfig.json               # TypeScript config (for IDE hints)
├── .gitignore                  # Frontend ignores
└── public/
    └── index.html              # HTML entry point
```

### Source Code (`frontend/src/`)

#### App Entry
```
main.jsx                        # React DOM render point
App.jsx                         # Main routing & layout component
```

#### Pages (`frontend/src/pages/`)
```
Login.jsx                       # 🔐 Login form with demo buttons
Dashboard.jsx                   # 📊 Main dashboard with clusters grid
AnalysisDetail.jsx              # 🔍 Multi-tab claim analysis view
```

#### Components (`frontend/src/components/`)
```
ClusterCard.jsx + .css          # Cluster display card with metrics
SearchBar.jsx + .css            # Multi-input search & submit form
AnalysisSummary.jsx + .css      # Verdict display with gauges
EvidenceList.jsx + .css         # Evidence sources with reliability
TrendChart.jsx + .css           # Mentions over time line chart
```

#### Context (`frontend/src/context/`)
```
AuthContext.jsx                 # Login state, token, user info
DataContext.jsx                 # Clusters, claims, filters, API calls
```

#### Hooks (`frontend/src/hooks/`)
```
index.js                        # useSocket, useNotification, useDebouncedValue
```

#### Utilities (`frontend/src/utils/`)
```
constants.js                    # Colors, labels, platforms, enums
```

#### Styles (`frontend/src/styles/`)
```
index.css                       # Global styles & reset
App.css                         # Layout & header styles
Login.css                       # Login page styling
Dashboard.css                   # Dashboard layout & cards
AnalysisDetail.css              # Tabs & analysis panel styling
ClusterCard.css                 # Card component styling
SearchBar.css                   # Search form styling
AnalysisSummary.css             # Summary panel styling
EvidenceList.css                # Evidence cards styling
TrendChart.css                  # Chart container styling
```

---

## 📊 Data Flow

### User Submission Flow
```
User Input (SearchBar)
    ↓
POST /api/claims
    ↓
Backend: generateEmbedding()
    ↓
Backend: findSimilarClaims()
    ↓
setImmediate: analyzeClaimFull() [background]
    ↓
Backend: classifyText() + detectToxicity()
    ↓
Backend: retrieveEvidence()
    ↓
Backend: generateVerdict() [OpenAI]
    ↓
Backend: calculateRiskScore()
    ↓
Save Analysis document
    ↓
Emit 'analysisReady' via Socket.io
    ↓
Frontend: Receive update → Refresh dashboard
```

### Dashboard Display Flow
```
Browser loads http://localhost:3000
    ↓
AuthContext: Check localStorage token
    ↓
No token → Show Login page
    ↓
Token exists → Show Dashboard
    ↓
DataContext: Fetch clusters & claims
    ↓
Render ClusterCards grid
    ↓
Subscribe to Socket.io events
    ↓
Real-time updates: newCluster, analysisReady
```

---

## 🔌 API Response Examples

### Create Claim
```bash
POST /api/claims
Content-Type: application/json

{
  "text": "New vaccine shows side effects",
  "sourceType": "web",
  "language": "en"
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439011",
  "text": "New vaccine shows side effects",
  "status": "new",
  "message": "Claim created. Analysis in progress."
}
```

### Get Analysis
```bash
GET /api/analysis/507f1f77bcf86cd799439011

Response (200):
{
  "_id": "507f...",
  "claimId": "507f...",
  "verdict": "false",
  "verdictPercentage": 15,
  "confidence": 0.87,
  "riskScore": 0.32,
  "rationale": "Studies show vaccine is safe...",
  "features": {
    "sentiment": "fear",
    "toxicity": 0.21,
    "manipulationLikelihood": 0.08,
    "spreadVelocity": 0.45,
    "sourceReliability": 0.92
  },
  "sources": [
    {
      "type": "fact-check",
      "title": "WHO Vaccine Safety Report",
      "url": "https://...",
      "reliability": "high",
      "snippet": "Extensive trials show..."
    }
  ]
}
```

---

## 🎯 Key Algorithms & Formulas

### Risk Score Calculation
```javascript
// Located in: backend/src/services/analysisService.js
riskScore = 
  0.3 * (1 - confidence) +          // Lower confidence = higher risk
  0.2 * toxicity +                  // Offensive language increases risk
  0.25 * spreadVelocity +           // Fast spread increases risk
  0.25 * noveltyScore               // New patterns increase risk
```

### Cosine Similarity (Clustering)
```javascript
// Located in: backend/src/services/clusteringService.js
similarity = (a · b) / (||a|| * ||b||)
// Used to find similar claims for grouping
```

### K-means Clustering
```javascript
// Located in: backend/src/services/clusteringService.js
// Groups similar embeddings into clusters
// Number of clusters: sqrt(numClaims / 2), max 10
```

---

## 📡 WebSocket Events

### From Server
```javascript
socket.emit('newCluster', {
  id: '507f...',
  title: 'Vaccine Discussion',
  riskScore: 0.65
})

socket.emit('analysisReady', {
  claimId: '507f...',
  analysisId: '507f...',
  verdict: 'false'
})

socket.emit('reviewRequested', {
  type: 'claim|cluster',
  id: '507f...',
  reason: 'Auto-escalated due to high risk'
})
```

### From Client
```javascript
socket.emit('refreshDashboard')
socket.emit('subscribeToCluster', clusterId)
```

---

## 🔐 Authentication & Authorization

### JWT Structure
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  username: "analyst",
  email: "analyst@localhost",
  role: "analyst",
  iat: 1234567890,
  exp: 1234654290
}
```

### Role-Based Endpoints
```
Public:
  GET /api/clusters
  GET /api/claims

Analyst (+ Public):
  POST /api/claims
  GET /api/analysis/:claimId

Reviewer (+ Analyst):
  POST /api/analysis/run/:claimId
  POST /api/review/escalate
  POST /api/review/resolve

Admin (+ All):
  POST /api/clusters/recompute
```

---

## 🗄️ MongoDB Collections

### Indexes Created
```javascript
Users: username, email, role, createdAt
Claims: text+canonicalClaim, createdAt, sourceType, clusterId, language, status
Clusters: title+summary, createdAt, riskTier, trend, riskScore, updatedAt
Analysis: claimId, verdict, confidence, riskScore, createdAt
Media: claimId, mediaType, fileHash
AuditLogs: actorUserId, action, targetType, targetId, createdAt
```

### Data Relationships
```
User (1) ---- (many) AuditLog
User (1) ---- (many) Claim [via userId implicit]
Claim (1) ---- (1) Analysis
Claim (1) ---- (1) Media
Claim (many) ---- (1) Cluster
Cluster (1) ---- (many) Claim
```

---

## 🚀 Environment Variables

### Required
```
BACKEND_PORT=3001
MONGODB_URI=mongodb://localhost:27017/infosage
HUGGING_FACE_API_KEY=hf_...
REACT_APP_API_URL=http://localhost:3001
```

### Optional but Recommended
```
OPENAI_API_KEY=sk_...
NODE_ENV=development
REACT_APP_WS_URL=ws://localhost:3001
```

### Feature Flags
```
ENABLE_DEEPFAKE_DETECTION=true
ENABLE_MULTILINGUAL=true
ENABLE_REVERSE_IMAGE_SEARCH=true
```

---

## 📦 Dependencies Summary

### Backend Key Packages
- `express` v4.18.2 - Web framework
- `mongoose` v8.0.0 - MongoDB ORM
- `socket.io` v4.7.2 - Real-time communication
- `jsonwebtoken` v9.1.0 - JWT auth
- `bcryptjs` v2.4.3 - Password hashing
- `axios` v1.6.2 - HTTP client
- `tesseract.js` v5.0.4 - OCR
- `ml-kmeans` v3.1.0 - Clustering

### Frontend Key Packages
- `react` v18.2.0 - UI framework
- `react-router-dom` v6.20.0 - Routing
- `axios` v1.6.2 - HTTP client
- `chart.js` v4.4.0 - Charting
- `leaflet` v1.9.4 - Maps
- `socket.io-client` v4.7.2 - Real-time client

---

## 🧪 Testing Files (Stubs Ready)

```
backend/tests/
  ├── embedding.test.js
  ├── clustering.test.js
  ├── riskScoring.test.js
  └── api.integration.test.js

frontend/tests/
  ├── components.test.jsx
  ├── context.test.jsx
  └── pages.test.jsx
```

---

## 📚 Quick Command Reference

```bash
# Setup
npm install                    # Install all dependencies
npm run seed                   # Load demo data
npm run dev                    # Start both servers

# Development
npm run dev:backend           # Start backend only
npm run dev:frontend          # Start frontend only

# Production
npm run build                 # Build both
npm run start:prod            # Run production backend

# Maintenance
npm run test                  # Run tests (when added)
npm run lint                  # Lint code (when added)
```

---

## 🎯 File Navigation Guide

**For New Features**:
1. Add route in `backend/src/routes/`
2. Add service logic in `backend/src/services/`
3. Add React page/component in `frontend/src/`
4. Add styling in `frontend/src/styles/`

**For Bug Fixes**:
1. Check backend logs in `backend/logs/`
2. Check browser console (F12)
3. Search relevant service/component
4. Add error handling

**For Deployment**:
1. Check `.env` configuration
2. Review API keys
3. Build: `npm run build`
4. Deploy backend + frontend separately

---

This file structure supports rapid development, easy debugging, and production deployment.
