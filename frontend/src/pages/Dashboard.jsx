import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { SearchBar } from '../components/SearchBar';
import { ClusterCard } from '../components/ClusterCard';
import '../styles/Dashboard.css';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clusters, filters, setFilters, fetchClusters, fetchClusterDetail } = useData();

  useEffect(() => {
    fetchClusters();
  }, []);

  const riskCounts = {
    high: clusters.filter((c) => c.riskTier === 'high').length,
    medium: clusters.filter((c) => c.riskTier === 'medium').length,
    low: clusters.filter((c) => c.riskTier === 'low').length,
  };

  const trendingCluster = clusters.sort((a, b) => b.totalMentions - a.totalMentions)[0];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>InfoSage Dashboard</h1>
          <p>Welcome, {user?.username}! Fact-checking in real-time.</p>
        </div>
        <div className="header-stats">
          <div className="stat-card high">
            <span className="stat-number">{riskCounts.high}</span>
            <span className="stat-label">High Risk</span>
          </div>
          <div className="stat-card medium">
            <span className="stat-number">{riskCounts.medium}</span>
            <span className="stat-label">Medium Risk</span>
          </div>
          <div className="stat-card low">
            <span className="stat-number">{riskCounts.low}</span>
            <span className="stat-label">Low Risk</span>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <SearchBar />

        <section className="filters-section">
          <h2>Filters</h2>
          <div className="filters">
            <label>
              Risk Tier:
              <select value={filters.riskTier || ''} onChange={(e) => setFilters({ ...filters, riskTier: e.target.value || null })}>
                <option value="">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </div>
        </section>

        <section className="trending-section">
          {trendingCluster && (
            <div className="trending-item">
              <h3>🔥 Trending Now</h3>
              <p className="trending-title">{trendingCluster.title}</p>
              <p className="trending-mentions">
                {trendingCluster.totalMentions?.toLocaleString() || 0} mentions
              </p>
            </div>
          )}
        </section>

        <section className="clusters-section">
          <h2>Recent Clusters ({clusters.length})</h2>
          <div className="clusters-grid">
            {clusters.length > 0 ? (
              clusters.map((cluster) => (
                <ClusterCard
                  key={cluster._id}
                  cluster={cluster}
                  onClick={() => {
                    // Navigate to the first claim in the cluster
                    const claimId = cluster.claimIds?.[0];
                    if (claimId) {
                      navigate(`/claim/${claimId}`);
                    }
                  }}
                />
              ))
            ) : (
              <p className="empty-state">No clusters available yet</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
