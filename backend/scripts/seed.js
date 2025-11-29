import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';
import Claim from '../src/models/Claim.js';
import Cluster from '../src/models/Cluster.js';
import Analysis from '../src/models/Analysis.js';
import logger from '../src/utils/logger.js';

dotenv.config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/infosage');
        logger.info('Connected to MongoDB for seeding');

        // Clear existing data
        await User.deleteMany({});
        await Claim.deleteMany({});
        await Cluster.deleteMany({});
        await Analysis.deleteMany({});

        // Create users
        const adminPassword = await bcryptjs.hash('admin123', 10);
        const reviewerPassword = await bcryptjs.hash('reviewer123', 10);

        const admin = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            passwordHash: adminPassword,
            role: 'admin',
        });

        const reviewer = await User.create({
            username: 'reviewer',
            email: 'reviewer@example.com',
            passwordHash: reviewerPassword,
            role: 'reviewer',
        });

        const analyst = await User.create({
            username: 'analyst',
            email: 'analyst@example.com',
            passwordHash: await bcryptjs.hash('analyst123', 10),
            role: 'analyst',
        });

        logger.info('Users created');

        // Mock claims
        const mockClaims = [
            {
                text: 'New vaccine approved by health authorities shows 95% effectiveness',
                sourceType: 'web',
                language: 'en',
                status: 'analyzed',
                mentions: 245,
            },
            {
                text: 'Election results disputed in several counties',
                sourceType: 'twitter',
                language: 'en',
                status: 'analyzed',
                mentions: 1200,
            },
            {
                text: 'Local politician makes controversial statement on social media',
                sourceType: 'twitter',
                language: 'en',
                status: 'analyzed',
                mentions: 342,
            },
            {
                text: 'Natural disaster hits coastal regions, authorities respond',
                sourceType: 'rss',
                language: 'en',
                status: 'analyzed',
                mentions: 567,
            },
            {
                text: 'Climate report shows rising temperatures across continents',
                sourceType: 'web',
                language: 'en',
                status: 'analyzed',
                mentions: 890,
            },
        ];

        const createdClaims = await Claim.insertMany(
            mockClaims.map((c) => ({
                ...c,
                embedding: Array(384).fill(0).map(() => Math.random() - 0.5),
            }))
        );

        logger.info(`${createdClaims.length} claims created`);

        // Create clusters
        const cluster1 = await Cluster.create({
            title: 'Vaccine Effectiveness Discussion',
            summary: 'Claims and discussion about vaccine efficacy and approval',
            claimIds: [createdClaims[0]._id],
            riskScore: 0.25,
            riskTier: 'low',
            trend: 'stable',
            geoSpread: [
                { region: 'North America', country: 'USA', count: 150, lat: 37.7749, lng: -122.4194 },
                { region: 'Europe', country: 'UK', count: 95, lat: 51.5074, lng: -0.1278 },
            ],
            channelSpread: [
                { platform: 'twitter', count: 180 },
                { platform: 'web', count: 65 },
            ],
            totalMentions: 245,
            tags: ['health', 'vaccines', 'covid'],
        });

        const cluster2 = await Cluster.create({
            title: 'Political News and Controversy',
            summary: 'Recent political events and statements',
            claimIds: [createdClaims[1]._id, createdClaims[2]._id],
            riskScore: 0.58,
            riskTier: 'medium',
            trend: 'accelerating',
            geoSpread: [
                { region: 'North America', country: 'USA', count: 892, lat: 38.9072, lng: -77.0369 },
            ],
            channelSpread: [
                { platform: 'twitter', count: 1200 },
            ],
            totalMentions: 1542,
            tags: ['politics', 'election', 'controversy'],
        });

        const cluster3 = await Cluster.create({
            title: 'Climate and Environmental Updates',
            summary: 'Climate-related reports and natural disasters',
            claimIds: [createdClaims[3]._id, createdClaims[4]._id],
            riskScore: 0.42,
            riskTier: 'medium',
            trend: 'stable',
            geoSpread: [
                { region: 'Global', country: 'Multiple', count: 1457, lat: 20, lng: 0 },
            ],
            channelSpread: [
                { platform: 'rss', count: 567 },
                { platform: 'web', count: 890 },
                { platform: 'twitter', count: 400 },
            ],
            totalMentions: 1857,
            tags: ['climate', 'environment', 'disaster'],
        });

        logger.info(`${3} clusters created`);

        // Create analyses
        const verdictTypes = ['true', 'false', 'mixed', 'unverified'];
        for (let i = 0; i < createdClaims.length; i++) {
            const claim = createdClaims[i];
            const verdict = verdictTypes[Math.floor(Math.random() * verdictTypes.length)];
            const confidence = Math.random() * 0.4 + 0.6;
            const riskScore = Math.random() * 0.8;

            const verdictPercentageMap = {
                true: 85 + Math.random() * 15,
                false: 10 + Math.random() * 15,
                mixed: 40 + Math.random() * 20,
                unverified: 45 + Math.random() * 10,
            };

            await Analysis.create({
                claimId: claim._id,
                verdict,
                verdictPercentage: Math.round(verdictPercentageMap[verdict]),
                confidence,
                riskScore,
                rationale: `This claim was analyzed using our fact-checking model. ${confidence > 0.75 ? 'High confidence in verdict.' : 'Moderate confidence - further review recommended.'}`,
                features: {
                    sentiment: ['fear', 'anger', 'neutral', 'hope'][Math.floor(Math.random() * 4)],
                    manipulationLikelihood: Math.random() * 0.3,
                    sourceReliability: Math.random() * 0.4 + 0.6,
                    spreadVelocity: Math.random() * 0.8,
                    toxicity: Math.random() * 0.4,
                },
                sources: [
                    {
                        type: 'fact-check',
                        title: 'Fact-Check Organization Assessment',
                        url: 'https://example-factcheck.org/claim-123',
                        reliability: 'high',
                        snippet: 'Our investigation found...',
                    },
                    {
                        type: 'news',
                        title: 'Major News Outlet Report',
                        url: 'https://example-news.org/story',
                        reliability: 'medium',
                        snippet: 'According to our sources...',
                    },
                    {
                        type: 'research',
                        title: 'Research Paper on Topic',
                        url: 'https://example-research.org/paper',
                        reliability: 'high',
                        snippet: 'The study concludes...',
                    },
                ],
                charts: {
                    riskTrend: [0.2, 0.35, riskScore],
                    mentionsOverTime: [
                        { t: new Date(Date.now() - 2 * 60 * 60 * 1000), count: Math.floor(Math.random() * 50) + 10 },
                        { t: new Date(Date.now() - 60 * 60 * 1000), count: Math.floor(Math.random() * 100) + 20 },
                        { t: new Date(), count: Math.floor(Math.random() * 150) + 50 },
                    ],
                },
            });
        }

        logger.info(`${createdClaims.length} analyses created`);

        logger.info('✅ Database seeded successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error("🔥 SEEDING FAILED:");
        console.error(error);            // full error object
        console.error(error.stack);      // stack trace
        process.exit(1);
    }

}

seed();
