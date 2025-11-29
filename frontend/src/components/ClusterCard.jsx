import './ClusterCard.css';
import { RISK_COLORS, VERDICT_COLORS } from '../utils/constants';

export function ClusterCard({ cluster, onClick }) {
  const riskColor = RISK_COLORS[cluster.riskTier] || '#6b7280';
  const trendEmoji = {
    accelerating: '📈',
    stable: '➡️',
    declining: '📉',
  }[cluster.trend];

  const mentionTrend = cluster.charts?.mentionsOverTime || [];
  const latestMentions = mentionTrend[mentionTrend.length - 1]?.count || 0;

  return (
    <div className="cluster-card" onClick={onClick}>
      <div className="cluster-header">
        <h3 className="cluster-title">{cluster.title || 'Untitled Cluster'}</h3>
        <span className="risk-badge" style={{ backgroundColor: riskColor }}>
          {cluster.riskTier?.toUpperCase()}
        </span>
      </div>

      <p className="cluster-summary">{cluster.summary || 'No summary available'}</p>

      <div className="cluster-metrics">
        <div className="metric">
          <span className="label">Risk Score</span>
          <div className="risk-bar">
            <div
              className="risk-fill"
              style={{
                width: `${cluster.riskScore * 100}%`,
                backgroundColor: riskColor,
              }}
            />
          </div>
          <span className="value">{(cluster.riskScore * 100).toFixed(0)}%</span>
        </div>

        <div className="metric">
          <span className="label">Trend {trendEmoji}</span>
          <span className="value">{cluster.trend}</span>
        </div>

        <div className="metric">
          <span className="label">Mentions</span>
          <span className="value">{latestMentions.toLocaleString()}</span>
        </div>

        <div className="metric">
          <span className="label">Claims</span>
          <span className="value">{cluster.claimIds?.length || 0}</span>
        </div>
      </div>

      <div className="cluster-platforms">
        {cluster.channelSpread?.slice(0, 4).map((channel) => (
          <span key={channel.platform} className="platform-chip">
            {channel.platform} ({channel.count})
          </span>
        ))}
      </div>
    </div>
  );
}
