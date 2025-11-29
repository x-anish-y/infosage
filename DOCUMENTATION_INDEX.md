# 📖 InfoSage Documentation Index

Complete navigation guide for the InfoSage fact-checking platform.

---

## 🚀 Getting Started

### Quick Links
- **[QUICKSTART.md](./QUICKSTART.md)** - 5-minute setup guide ⭐ START HERE
- **[README.md](./README.md)** - Comprehensive documentation
- **[FILE_REFERENCE.md](./FILE_REFERENCE.md)** - Code organization & key files
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Project overview

---

## 📚 Documentation by Topic

### Setup & Installation
1. **Prerequisites**: Node.js v18+, MongoDB v5+, API keys (HF, OpenAI)
2. **[QUICKSTART.md](./QUICKSTART.md)** - Step-by-step installation
3. Environment variables in `.env.template`
4. Database seeding with `npm run seed`

### Features & Architecture
- **[README.md](./README.md#overview)** - Complete feature list
- **[README.md](./README.md#tech-stack)** - Technology choices
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md#-architecture-highlights)** - System design

### API Documentation
- **[README.md](./README.md#api-documentation)** - All endpoints
- **[FILE_REFERENCE.md](./FILE_REFERENCE.md#-api-response-examples)** - Request/response examples
- **[README.md](./README.md#websocket-events)** - Real-time events

### Database
- **[README.md](./README.md#data-models)** - Collection schemas
- **[FILE_REFERENCE.md](./FILE_REFERENCE.md#-mongodb-collections)** - Indexes & relationships
- **[backend/scripts/seed.js](./backend/scripts/seed.js)** - Sample data

### Frontend
- **[README.md](./README.md#frontend-architecture-and-components-react--htmlcssjs)** - Components
- **[FILE_REFERENCE.md](./FILE_REFERENCE.md#-frontend-frontendnot-foundgoogleaccountinventory)** - File structure
- **[frontend/src/pages/](./frontend/src/pages/)** - Login, Dashboard, Analysis pages

### Backend
- **[README.md](./README.md#backend-api-nodejsexpress-js-only)** - API design
- **[backend/src/server.js](./backend/src/server.js)** - Entry point
- **[backend/src/services/](./backend/src/services/)** - AI integration & business logic

---

## 🎯 Common Tasks

### First Run
```bash
1. Read: QUICKSTART.md (sections 1-4)
2. Install: npm install
3. Configure: Edit .env
4. Seed: npm run seed
5. Run: npm run dev
6. Access: http://localhost:3000
```

### Submit a Claim
```bash
1. Go to Dashboard
2. Enter text in search bar
3. Click "Analyze"
4. Wait for analysis (5-10s)
5. View results in cluster grid
6. Click cluster card to drill down
```

### View Analysis Details
```bash
1. Go to Dashboard
2. Click any cluster card
3. See cluster details page
4. View claims in cluster
5. Click claim for full analysis
6. Explore tabs: Summary, Evidence, Spread, Outputs
```

### Add API Keys
```bash
1. Get HF token: https://huggingface.co/settings/tokens
2. Get OpenAI key: https://platform.openai.com/api-keys
3. Edit .env file
4. Restart backend
```

---

## 🔍 Code Navigation

### I want to...

**Add a new API endpoint**
- Files: Backend route in `backend/src/routes/`
- Example: `backend/src/routes/claims.js`
- Service logic: `backend/src/services/`

**Add a new React component**
- Files: Component in `frontend/src/components/`
- Styles: `frontend/src/components/ComponentName.css`
- Example: `frontend/src/components/ClusterCard.jsx`

**Integrate new AI service**
- File: `backend/src/services/huggingFaceService.js` or new file
- Usage: Import in `analysisService.js`
- Error handling: Add logging + fallbacks

**Deploy to production**
- Guide: [README.md#deployment-notes](./README.md#deployment-notes)
- Build: `npm run build`
- Config: Update `.env` for cloud URLs
- Database: Switch to MongoDB Atlas

**Debug an issue**
- Backend logs: `backend/logs/` directory
- Browser console: F12 → Console tab
- Database: Check MongoDB directly
- API: Test with curl or Postman

---

## 📊 Quick Reference

### Endpoints (20+)
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/auth/login | User login |
| POST | /api/claims | Create claim |
| GET | /api/claims | List claims |
| GET | /api/clusters | Trending clusters |
| POST | /api/outputs/generate | Corrective content |
| POST | /api/review/escalate | Flag high-risk |

See [README.md#api-documentation](./README.md#api-documentation) for complete list.

### Database Collections (6)
```
Users, Claims, Clusters, Analysis, Media, AuditLogs
```
Details: [README.md#data-models](./README.md#data-models)

### React Components (5)
```
ClusterCard, SearchBar, AnalysisSummary, EvidenceList, TrendChart
```
Code: [frontend/src/components/](./frontend/src/components/)

### Services (5)
```
HuggingFace, LLM, Media, Analysis, Clustering
```
Code: [backend/src/services/](./backend/src/services/)

---

## 🎓 Learning Path

### Beginner (30 min)
1. Read: QUICKSTART.md
2. Run: `npm run dev`
3. Access: http://localhost:3000
4. Login with demo credentials
5. Submit a test claim
6. View dashboard

### Intermediate (2 hours)
1. Read: README.md (overview section)
2. Explore: API endpoints with curl
3. Check: Database in MongoDB
4. Review: Frontend components
5. Trace: Full claim submission flow

### Advanced (4 hours)
1. Study: Backend architecture
2. Review: AI integration services
3. Understand: Risk scoring formula
4. Examine: React context/state management
5. Plan: Custom enhancements

### Expert (1 day)
1. Deploy: Set up production environment
2. Customize: Risk scoring weights
3. Extend: Add new AI models
4. Optimize: Database queries
5. Monitor: Logging & performance

---

## 🐛 Troubleshooting

### Common Issues
- **MongoDB won't connect**: Check `mongod` is running, verify URI
- **API key errors**: Validate key in `.env`, check quota
- **Frontend won't load**: Clear cache, restart servers
- **Claims not analyzing**: Check backend logs, verify HF API

See: [QUICKSTART.md#troubleshooting](./QUICKSTART.md#troubleshooting)

### Getting Help
1. Check relevant documentation file
2. Review backend logs: `backend/logs/`
3. Check browser console (F12)
4. Search code for similar functionality
5. Review error messages carefully

---

## 📈 Performance Tips

- **Search**: Debounced at 500ms
- **Lists**: Pagination with 20 items/page
- **Cache**: LRU cache with 1000 embeddings
- **Rate Limit**: 100 requests per 15 minutes

See: [README.md#performance-optimizations](./README.md#performance-optimizations)

---

## 🚀 Deployment Paths

### Local Development
- Current: `http://localhost:3000`
- Always works: `npm run dev`

### Cloud (AWS/GCP/Azure)
- Guide: [README.md#deployment-notes](./README.md#deployment-notes)
- Database: Use managed MongoDB (Atlas)
- Frontend: Deploy to CDN (S3, Cloud Storage)
- Backend: Deploy to container (ECS, Cloud Run)

### Docker
- Create Dockerfile for backend
- Use nginx for frontend
- Compose with MongoDB container

---

## 📚 Key Files to Know

### Essential
- **package.json** - Dependencies & scripts
- **.env.template** - Configuration template
- **README.md** - Full documentation
- **backend/src/server.js** - Backend entry
- **frontend/src/App.jsx** - Frontend entry

### Important
- **backend/scripts/seed.js** - Demo data
- **backend/src/services/** - Business logic
- **frontend/src/pages/** - UI pages
- **frontend/src/context/** - State management

### Reference
- **QUICKSTART.md** - Quick setup
- **IMPLEMENTATION_SUMMARY.md** - Architecture
- **FILE_REFERENCE.md** - Code map
- **This file** - Documentation index

---

## ✨ Features Checklist

- ✅ Multi-source ingestion
- ✅ AI-powered clustering
- ✅ Verdict generation
- ✅ Risk scoring
- ✅ Evidence retrieval
- ✅ Corrective outputs
- ✅ Reviewer workflow
- ✅ Real-time updates
- ✅ Dashboard
- ✅ Mobile responsive

See: [IMPLEMENTATION_SUMMARY.md#-key-features-implemented](./IMPLEMENTATION_SUMMARY.md#-key-features-implemented)

---

## 🎯 Next Steps

1. **Start**: Follow [QUICKSTART.md](./QUICKSTART.md)
2. **Explore**: Submit claims via dashboard
3. **Learn**: Read [README.md](./README.md) sections
4. **Code**: Check [FILE_REFERENCE.md](./FILE_REFERENCE.md)
5. **Extend**: Add custom features
6. **Deploy**: Use production guide

---

## 📞 Resources

- **Hugging Face**: https://huggingface.co
- **OpenAI**: https://openai.com
- **MongoDB**: https://mongodb.com
- **React**: https://react.dev
- **Node.js**: https://nodejs.org

---

## 🎉 You're Ready!

Everything is set up and documented. Start with:

```bash
npm install
npm run seed
npm run dev
```

Then visit: **http://localhost:3000**

Welcome to InfoSage! 🚀
