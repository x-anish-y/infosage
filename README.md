# InfoSage - AI-Powered Fact-Checking Platform

A comprehensive, responsive, JavaScript-only fact-checking and rumor detection web application with real-time analysis, clustering, and interactive dashboards.

## Overview

InfoSage ingests claims from multiple sources (text, links, images), automatically detects and clusters related rumors, verifies them against evidence using AI, and produces verdicts with confidence scores and risk assessments. The platform provides an intuitive dashboard with maps, charts, sources, and corrective outputs for misinformation.

## Features

### Core Functionality
- ✅ **Multi-source Ingestion**: Text, links, images (OCR), videos, social IDs
- ✅ **Automatic Clustering**: Groups similar claims using embeddings and k-means clustering
- ✅ **AI-Powered Analysis**: Sentiment, toxicity, manipulation detection, verdict generation
- ✅ **Risk Scoring**: Multi-factor risk assessment (spread velocity, source reliability, novelty)
- ✅ **Evidence Retrieval**: Semantic search over fact-check corpus
- ✅ **Corrective Outputs**: Auto-generated WhatsApp/SMS/social/explainer content
- ✅ **Reviewer Workflow**: Escalation, resolution, audit trails
- ✅ **Real-time Updates**: WebSocket notifications for new clusters and analyses
- ✅ **Multi-language Support**: Hindi, Marathi, English with auto-translation

### Dashboard
- Trending clusters with severity badges
- Crisis-priority items and high-risk flags
- Global filters by language, time range, platform, risk tier
- Live counters and sparkline charts
- Drill-down from cluster → claims → detailed analysis

### Analysis View
- Verdict percentage (True/False/Mixed/Unverified)
- Confidence and risk level gauges
- Evidence sources with citations
- Spread heatmap and trend timeline
- Channel distribution and sentiment analysis
- OCR text extraction and multimedia forensics
- Detailed rationale explaining the decision

## Tech Stack

### Backend
- **Runtime**: Node.js (latest)
- **Framework**: Express.js v4
- **Database**: MongoDB (self-hosted)
- **Real-time**: Socket.io v4
- **AI APIs**: Hugging Face (free), OpenAI (free credits)
- **ML**: ml-kmeans, sentence-transformers embeddings
- **OCR**: Tesseract.js
- **Authentication**: JWT + bcryptjs

### Frontend
- **Framework**: React 18
- **Build**: Vite 5
- **Routing**: React Router v6
- **Charts**: Chart.js + Canvas API
- **Maps**: Leaflet.js
- **HTTP**: Axios
- **WebSocket**: Socket.io-client
- **Styling**: CSS (utilities + components)

### Deployment Ready
- Localhost development with hot-reload
- Environment-based configuration
- Modular architecture for easy swapping of components

## Installation

### Prerequisites
- Node.js v18+ and npm v9+
- MongoDB v5+ running locally (`mongodb://localhost:27017`)
- Hugging Face API key (free tier: https://huggingface.co/settings/tokens)
- OpenAI API key (optional, for enhanced outputs)

### Setup Steps

#### 1. Clone and Navigate
```bash
cd infosage
```

#### 2. Install Dependencies
```bash
# Root level (installs both frontend and backend)
npm install

# Or manually:
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

#### 3. Configure Environment
Copy `.env.template` to `.env` in the root and update:
```bash
cp .env.template .env
```

Edit `.env`:
```env
BACKEND_PORT=3001
MONGODB_URI=mongodb://localhost:27017/infosage
HUGGING_FACE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here (optional)
NODE_ENV=development
```

#### 4. Seed Database (Optional but Recommended)
```bash
npm run seed
```

This creates mock users (admin/analyst/reviewer), sample claims, clusters, and analyses for demo purposes.

#### 5. Start Development Servers
```bash
npm run dev
```

This starts:
- **Backend**: `http://localhost:3001`
- **Frontend**: `http://localhost:3000`

Access the app at `http://localhost:3000`

### Demo Credentials (After Seeding)
- **Admin**: admin / admin123
- **Reviewer**: reviewer / reviewer123
- **Analyst**: analyst / analyst123

Or in dev mode, use any username/password combination.

## API Documentation

### Authentication
- **POST** `/api/auth/login` - Login with username/password
- **POST** `/api/auth/logout` - Logout (client-side token removal)

### Claims
- **POST** `/api/claims` - Create new claim
  ```json
  {
    "text": "Claim text",
    "sourceType": "manual|twitter|telegram|web|image|video",
    "language": "en"
  }
  ```
- **GET** `/api/claims/:id` - Get claim with analysis
- **GET** `/api/claims?query=...&sourceType=...&limit=20` - Search/list claims

### Clusters
- **GET** `/api/clusters` - List trending clusters
- **GET** `/api/clusters/:id` - Get cluster details
- **POST** `/api/clusters/recompute` - Recompute clustering (admin)

### Analysis
- **GET** `/api/analysis/:claimId` - Get analysis for claim
- **POST** `/api/analysis/run/:claimId` - Re-run analysis (reviewer/admin)

### Media
- **POST** `/api/media/upload` - Upload image/video (multipart)
- **GET** `/api/media/:id` - Get media with OCR and forensics

### Outputs
- **POST** `/api/outputs/generate` - Generate corrective content
  ```json
  {
    "claimId": "...",
    "outputTypes": ["whatsapp", "sms", "social", "explainer"]
  }
  ```

### Reviewer Workflow
- **POST** `/api/review/escalate` - Mark as escalated
- **POST** `/api/review/resolve` - Resolve with final verdict

### WebSocket Events
- **newCluster** - New cluster created
- **analysisReady** - Analysis completed
- **reviewRequested** - Escalation triggered
- **clusteringUpdated** - Clustering recomputed

## Data Models

### Collections

#### Users
```javascript
{
  username: String,
  email: String,
  passwordHash: String,
  role: "admin|reviewer|analyst|public",
  createdAt: Date,
  lastLogin: Date,
  status: "active|disabled"
}
```

#### Claims
```javascript
{
  text: String,
  canonicalClaim: String,
  sourceType: "rss|twitter|telegram|youtube|image|video|web|manual",
  sourceLink: String,
  language: String,
  embedding: [Number],
  geo: { country, region, lat, lng },
  createdAt: Date,
  clusterId: ObjectId,
  status: "new|analyzing|analyzed|escalated"
}
```

#### Clusters
```javascript
{
  title: String,
  summary: String,
  claimIds: [ObjectId],
  riskScore: 0-1,
  riskTier: "low|medium|high",
  trend: "accelerating|stable|declining",
  geoSpread: [{ region, country, count, lat, lng }],
  channelSpread: [{ platform, count }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Analysis
```javascript
{
  claimId: ObjectId,
  verdict: "true|false|mixed|unverified",
  verdictPercentage: 0-100,
  confidence: 0-1,
  riskScore: 0-1,
  rationale: String,
  features: {
    sentiment: "fear|anger|neutral|hope|sadness",
    manipulationLikelihood: 0-1,
    sourceReliability: 0-1,
    spreadVelocity: 0-1,
    toxicity: 0-1
  },
  sources: [{ type, title, url, reliability, snippet }],
  charts: {
    riskTrend: [Number],
    mentionsOverTime: [{ t: Date, count: Number }]
  }
}
```

#### Media
```javascript
{
  claimId: ObjectId,
  mediaType: "image|video",
  filePath: String,
  ocrText: String,
  forensics: {
    deepfakeDetected: Boolean,
    manipulationScore: 0-1,
    artifacts: [String],
    reverseImage: [{ url, firstSeen, similarity, source }]
  }
}
```

#### AuditLogs
```javascript
{
  actorUserId: ObjectId,
  action: "create|update|escalate|publish|login|resolve",
  targetType: "claim|cluster|analysis|user|media",
  targetId: ObjectId,
  metadata: Object,
  createdAt: Date
}
```

## AI Services Integration

### Hugging Face
- **Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` for English
- **Multilingual**: `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`
- **Sentiment**: `facebook/bart-large-mnli` for emotion classification
- **Toxicity**: Text classification for NSFW content
- **Image Analysis**: AI-generated image detection

### OpenAI
- **Verdict Generation**: GPT-3.5-turbo for evidence synthesis
- **Corrective Outputs**: Context-aware message generation for different platforms

### Local Processing
- **OCR**: Tesseract.js for image-to-text extraction
- **Clustering**: ml-kmeans for grouping similar claims
- **Risk Scoring**: Weighted multi-factor formula

## Risk Scoring Formula

```
riskScore = w1 * (1 - confidence) + w2 * toxicity + w3 * spreadVelocity + w4 * noveltyScore

Where:
  w1 = 0.3 (confidence inverse weight)
  w2 = 0.2 (toxicity weight)
  w3 = 0.25 (spread velocity weight)
  w4 = 0.25 (novelty weight)

Tiers:
  0.0 - 0.33 = low (green)
  0.34 - 0.66 = medium (amber)
  0.67 - 1.0 = high (red)

Auto-escalation triggers:
  - riskScore > 0.75
  - confidence < 0.6 AND spreadVelocity > 0.5
```

## Development Workflow

### Project Structure
```
infosage/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── middleware/      # Auth, logging, rate limiting
│   │   ├── utils/           # Helpers, logger, cache
│   │   └── server.js        # Express + Socket.io setup
│   ├── scripts/
│   │   └── seed.js          # Database seeding
│   ├── logs/                # Application logs
│   ├── uploads/             # Uploaded media
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/           # Full pages (Login, Dashboard, etc.)
│   │   ├── context/         # React Context (Auth, Data)
│   │   ├── hooks/           # Custom hooks
│   │   ├── styles/          # CSS files
│   │   ├── utils/           # Constants, helpers
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # React DOM render
│   ├── public/
│   │   └── index.html       # HTML template
│   ├── vite.config.js
│   ├── package.json
│   └── .gitignore
├── package.json             # Root package.json
├── .env.template
└── README.md
```

### Common Commands

```bash
# Start development (both servers)
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend
npm run dev:frontend

# Build for production
npm run build

# Seed database with mock data
npm run seed

# Run tests
npm run test
```

### Hot Reload
- **Backend**: Changes to `src/**/*.js` trigger server restart via `node --watch`
- **Frontend**: Vite provides HMR for React components and CSS

## Performance Optimizations

- **Caching**: LRU cache for embeddings (1000 items, 1-hour TTL)
- **Rate Limiting**: 100 requests/15min per IP, 5 login attempts/15min
- **Lazy Loading**: Progressive loading of cluster lists
- **Debouncing**: 500ms debounce on search inputs
- **Pagination**: 20 items per page by default
- **Compression**: Gzip in production builds
- **Indexing**: MongoDB indexes on frequently queried fields (text, createdAt, clusterId)

## Deployment Notes

### For Cloud (AWS/GCP/Azure)
1. Set `NODE_ENV=production` in environment
2. Use managed MongoDB Atlas instead of local
3. Configure CORS for your domain
4. Set up HTTPS with SSL certificates
5. Use environment variable injection for API keys
6. Configure CDN for static frontend assets
7. Set up CI/CD pipeline (GitHub Actions, etc.)

### Docker (Optional)
```bash
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/src ./src
CMD ["node", "src/server.js"]

# Frontend: Build in Dockerfile, serve static files via nginx
```

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`
- Verify credentials if using authentication

### Hugging Face API Errors
- Check API key is valid and has quota
- Verify internet connection
- Check rate limits (free tier: ~5 req/min)

### Frontend Won't Load
- Ensure backend is running on `3001`
- Check browser console for CORS errors
- Verify `.env` REACT_APP_API_URL matches backend

### OCR Not Working
- Tesseract.js requires image files, not URLs
- Supported formats: JPEG, PNG, WebP
- File size limit: 50MB

## Testing

### Unit Tests (Coming Soon)
```bash
npm run test:backend
npm run test:frontend
```

### Manual Testing
1. Create a claim via dashboard search
2. Verify analysis completes within 10 seconds
3. Check clustering: multiple similar claims should group
4. Test escalation and resolution workflow
5. Verify corrective outputs are generated

## Future Enhancements

- [ ] Multi-language UI (Hindi, Marathi)
- [ ] Video caption extraction
- [ ] Advanced deepfake detection (Face-X-Risk)
- [ ] Integration with Twitter/Telegram APIs
- [ ] Custom vector database (Pinecone)
- [ ] Advanced NLP models (T5, BART)
- [ ] Mobile app (React Native)
- [ ] GraphQL API layer
- [ ] Advanced analytics dashboard
- [ ] Explainable AI visualizations

## License

MIT - Free to use, modify, and distribute

## Support

For issues, feature requests, or contributions:
1. Check existing documentation
2. Review API endpoint details
3. Check backend logs in `logs/` directory
4. Check browser console for frontend errors

## Credits

Built with modern web technologies for crisis fact-checking and rapid misinformation detection.
