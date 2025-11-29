# InfoSage - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### Step 1: Install MongoDB
Make sure MongoDB is running:
```bash
# Mac (with Homebrew)
brew services start mongodb-community

# Windows (if installed)
net start MongoDB

# Linux
sudo systemctl start mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 2: Environment Setup
```bash
# Copy template
cp .env.template .env

# Edit .env and add your API keys
# Get free keys from:
# - Hugging Face: https://huggingface.co/settings/tokens
# - OpenAI: https://platform.openai.com/api-keys (optional)
```

### Step 3: Install & Run
```bash
# From root directory (infosage/)
npm install

# Seed database (optional but recommended)
npm run seed

# Start both frontend and backend
npm run dev
```

### Step 4: Access the App
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### Step 5: Login
Use demo credentials:
- Username: `analyst` Password: `analyst123`
- Or: `reviewer` / `reviewer123`
- Or: `admin` / `admin123`
- Or: any username/password (dev mode auto-creates)

---

## 🎯 What to Try First

### 1. Submit a Claim
- Go to Dashboard
- Enter text in the search bar: "New vaccine approved by health authorities"
- Select "Manual Entry" as source
- Click "Analyze"
- Wait 5-10 seconds for analysis

### 2. View Dashboard
- See trending clusters
- Filter by risk level (High, Medium, Low)
- Click on any cluster card to drill down

### 3. Check Analysis
- See verdict percentage (True/False/Mixed)
- Review confidence and risk scores
- Read the rationale
- Check evidence sources

### 4. Generate Outputs
- Go to "Outputs" tab
- See auto-generated WhatsApp/SMS/social messages
- Use these for fact-correction campaigns

---

## 📊 Database Seeding

The `npm run seed` command populates:
- ✅ 3 demo users (admin, reviewer, analyst)
- ✅ 5 sample claims
- ✅ 3 clusters with related claims
- ✅ Analyses for each claim
- ✅ Mock evidence and charts

Check `backend/scripts/seed.js` to customize data.

---

## 🔌 API Examples

### Create a Claim
```bash
curl -X POST http://localhost:3001/api/claims \
  -H "Content-Type: application/json" \
  -d '{
    "text": "COVID vaccine causes magnetic fields",
    "sourceType": "web",
    "language": "en"
  }'
```

### Get Clusters
```bash
curl http://localhost:3001/api/clusters?riskTier=high
```

### Generate Corrective Output
```bash
curl -X POST http://localhost:3001/api/outputs/generate \
  -H "Content-Type: application/json" \
  -d '{
    "claimId": "YOUR_CLAIM_ID",
    "outputTypes": ["whatsapp", "sms"]
  }'
```

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongo --version

# Start MongoDB if not running
mongod
```

### API Key Issues
- Ensure `.env` file exists and has API keys
- Restart backend after changing `.env`
- Check Hugging Face key isn't expired

### Styling Issues
- Clear browser cache: Ctrl+Shift+Delete
- Rebuild frontend: `rm -rf frontend/node_modules && npm install`

---

## 📝 File Structure Quick Reference

```
infosage/
├── backend/src/
│   ├── server.js              # Main Express server
│   ├── models/                # MongoDB schemas
│   ├── routes/                # API endpoints
│   ├── services/              # AI, clustering, analysis
│   └── middleware/            # Auth, logging
├── frontend/src/
│   ├── App.jsx                # Main app
│   ├── pages/                 # Login, Dashboard, Analysis
│   ├── components/            # ClusterCard, SearchBar, etc
│   ├── context/               # Auth, Data state
│   └── styles/                # CSS
└── README.md                  # Full documentation
```

---

## 🎓 Key Concepts

### Claim
A single piece of information to fact-check (tweet, article, image text, etc.)

### Cluster
A group of similar claims automatically grouped by AI embeddings

### Analysis
The fact-check result for a claim: verdict, confidence, risk score, sources

### Risk Score
Weighted calculation of: confidence, toxicity, spread velocity, novelty
- 0-0.33: Low (green)
- 0.34-0.66: Medium (amber)
- 0.67-1.0: High (red)

### Verdict
- True: Claim is accurate
- False: Claim is inaccurate
- Mixed: Partially accurate
- Unverified: Not enough evidence

---

## 🔐 Authentication & Roles

### Roles
- **Admin**: Full access, can recompute clustering
- **Reviewer**: Can escalate/resolve claims
- **Analyst**: Can create claims and view analysis
- **Public**: Read-only access

### How It Works
- Dev mode: Auto-creates user on any login
- Production: JWT tokens stored in localStorage
- Authorization: Role-based access control on APIs

---

## 📊 Dashboard Features

### Stats Cards
- High/Medium/Low risk counts
- Real-time updates

### Filters
- Risk tier (High, Medium, Low)
- Language
- Time range
- Platform

### Search Bar
- Type/paste claim text
- Select source type
- Upload image/video
- Drag-and-drop support

### Cluster Grid
- Visual cards with risk badges
- Mini trend charts
- Platform distribution chips
- Click to drill down

---

## 🚀 Next Steps After Setup

1. **Customize Data**: Edit `backend/scripts/seed.js` to add domain-specific claims
2. **Fine-tune Risk Scoring**: Adjust weights in `analysisService.js`
3. **Add Sources**: Expand fact-check corpus in `analysisService.js`
4. **Integrate APIs**: Connect to Twitter, Telegram, RSS feeds
5. **Deploy**: Follow deployment notes in README.md

---

## 📞 Support Resources

- **Backend Logs**: `backend/logs/` directory
- **Browser Console**: F12 for frontend errors
- **MongoDB**: Connect with `mongo` CLI or Compass GUI
- **API Testing**: Use Postman or curl

---

## ✅ Success Checklist

- [ ] MongoDB running
- [ ] .env file configured with API keys
- [ ] Backend started (`npm run dev:backend`)
- [ ] Frontend started (`npm run dev:frontend`)
- [ ] Can access http://localhost:3000
- [ ] Can login with demo credentials
- [ ] Can submit a claim
- [ ] Can see analysis results
- [ ] Dashboard loads without errors

---

Enjoy fact-checking with InfoSage! 🎉
