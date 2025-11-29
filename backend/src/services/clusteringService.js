import kmeans from 'ml-kmeans';
import logger from '../utils/logger.js';
import Claim from '../models/Claim.js';
import Cluster from '../models/Cluster.js';

// Cosine similarity
function cosineSimilarity(a, b) {
  if (!a.length || !b.length) return 0;

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function clusterClaims(embeddings, numClusters = 5) {
  try {
    if (embeddings.length < numClusters) {
      numClusters = Math.max(1, embeddings.length);
    }

    const result = kmeans.default(embeddings, numClusters);
    return result;
  } catch (error) {
    logger.error('Clustering failed', { error: error.message });
    return { centroids: [], clusters: [], iterations: 0 };
  }
}

export async function findSimilarClaims(embedding, threshold = 0.7) {
  try {
    const allClaims = await Claim.find({ embedding: { $exists: true } }).lean();

    const similar = allClaims
      .map((claim) => ({
        ...claim,
        similarity: cosineSimilarity(embedding, claim.embedding),
      }))
      .filter((claim) => claim.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);

    return similar;
  } catch (error) {
    logger.error('Finding similar claims failed', { error: error.message });
    return [];
  }
}

export async function updateClustering() {
  try {
    const claims = await Claim.find({ embedding: { $exists: true, $ne: [] } }).lean();

    if (claims.length < 2) {
      logger.info('Not enough claims to cluster');
      return { clustersCreated: 0 };
    }

    const embeddings = claims.map((c) => c.embedding);
    const numClusters = Math.min(Math.ceil(Math.sqrt(claims.length / 2)), 10);

    const clusterResult = await clusterClaims(embeddings, numClusters);
    const clusters = clusterResult.clusters || [];

    // Group claims by cluster assignment
    const clusterGroups = {};
    claims.forEach((claim, index) => {
      const clusterIdx = clusters[index];
      if (!clusterGroups[clusterIdx]) {
        clusterGroups[clusterIdx] = [];
      }
      clusterGroups[clusterIdx].push(claim._id);
    });

    // Create or update cluster documents
    let clustersCreated = 0;
    for (const clusterIdx in clusterGroups) {
      const claimIds = clusterGroups[clusterIdx];
      const clusterClaims = claims.filter((c) => claimIds.includes(c._id));

      const title = generateClusterTitle(clusterClaims);
      const summary = `Cluster of ${claimIds.length} related claims`;

      const existingCluster = await Cluster.findOneAndUpdate(
        { claimIds: { $in: claimIds } },
        {
          title,
          summary,
          claimIds,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!existingCluster) {
        await Cluster.create({
          title,
          summary,
          claimIds,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        clustersCreated++;
      }
    }

    return { clustersCreated, totalClaims: claims.length, numClusters };
  } catch (error) {
    logger.error('Clustering update failed', { error: error.message });
    return { clustersCreated: 0, error: error.message };
  }
}

function generateClusterTitle(claims) {
  if (claims.length === 0) return 'Cluster';

  // Use first claim's text as basis for title
  const firstText = claims[0].text || '';
  const words = firstText.split(' ').slice(0, 5).join(' ');
  return `${words}...`;
}

export default {
  clusterClaims,
  findSimilarClaims,
  updateClustering,
};
