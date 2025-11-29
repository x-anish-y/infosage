import { VERDICT_COLORS, VERDICT_LABELS } from '../utils/constants';
import './AnalysisSummary.css';

export function AnalysisSummary({ analysis }) {
  if (!analysis) {
    return <div className="analysis-summary empty">No analysis available yet</div>;
  }

  const verdictColor = VERDICT_COLORS[analysis.verdict] || '#6b7280';

  return (
    <div className="analysis-summary">
      <div className="verdict-section">
        <div className="verdict-badge" style={{ borderColor: verdictColor }}>
          <span className="verdict-label" style={{ color: verdictColor }}>
            {VERDICT_LABELS[analysis.verdict]}
          </span>
          <span className="verdict-percentage">{analysis.verdictPercentage}%</span>
        </div>
      </div>

      <div className="metrics-section">
        <div className="metric-item">
          <span className="metric-label">Confidence</span>
          <div className="metric-bar">
            <div
              className="metric-fill"
              style={{ width: `${analysis.confidence * 100}%`, backgroundColor: '#3b82f6' }}
            />
          </div>
          <span className="metric-value">{(analysis.confidence * 100).toFixed(1)}%</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Risk Score</span>
          <div className="metric-bar">
            <div
              className="metric-fill"
              style={{
                width: `${analysis.riskScore * 100}%`,
                backgroundColor: analysis.riskScore > 0.66 ? '#ef4444' : 
                               analysis.riskScore > 0.33 ? '#f59e0b' : '#10b981',
              }}
            />
          </div>
          <span className="metric-value">{(analysis.riskScore * 100).toFixed(1)}%</span>
        </div>

        {analysis.features && (
          <div className="features-grid">
            <div className="feature">
              <span className="feature-label">Sentiment</span>
              <span className="feature-value">{analysis.features.sentiment}</span>
            </div>
            <div className="feature">
              <span className="feature-label">Toxicity</span>
              <span className="feature-value">{(analysis.features.toxicity * 100).toFixed(0)}%</span>
            </div>
            <div className="feature">
              <span className="feature-label">Spread Velocity</span>
              <span className="feature-value">{(analysis.features.spreadVelocity * 100).toFixed(0)}%</span>
            </div>
            <div className="feature">
              <span className="feature-label">Manipulation</span>
              <span className="feature-value">{(analysis.features.manipulationLikelihood * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="rationale-section">
        <h4>Why we decided this</h4>
        <p>{analysis.rationale}</p>
      </div>
    </div>
  );
}
