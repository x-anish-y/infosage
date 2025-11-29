import { VERDICT_COLORS, VERDICT_LABELS } from '../utils/constants';
import './AnalysisSummary.css';

export function AnalysisSummary({ analysis }) {
  if (!analysis) {
    return <div className="analysis-summary empty">
      <div className="loading-analysis">
        <div className="spinner"></div>
        <p>Analysis in progress... Searching the web for information...</p>
      </div>
    </div>;
  }

  const verdictColor = VERDICT_COLORS[analysis.verdict] || '#6b7280';
  const webResults = analysis.webSearchResults;

  // Format rationale with markdown-style rendering
  const formatRationale = (text) => {
    if (!text) return '';
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="analysis-summary">
      <div className="verdict-section">
        <div className="verdict-badge" style={{ borderColor: verdictColor }}>
          <span className="verdict-label" style={{ color: verdictColor }}>
            {VERDICT_LABELS[analysis.verdict] || analysis.verdict?.toUpperCase()}
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

      {/* Web Search Results - People Info */}
      {webResults?.peopleInfo && webResults.peopleInfo.length > 0 && (
        <div className="web-search-section">
          <h4>👤 People Identified (Web Search)</h4>
          <div className="people-results">
            {webResults.peopleInfo.map((person, i) => (
              <div key={i} className="person-result-card">
                <div className="person-header">
                  <span className="person-name">{person.name}</span>
                  {person.title && <span className="person-title">{person.title}</span>}
                </div>
                {person.verifiedFacts && person.verifiedFacts.length > 0 && (
                  <div className="verified-facts">
                    <strong>✓ Verified Facts:</strong>
                    <ul>
                      {person.verifiedFacts.map((fact, j) => (
                        <li key={j}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {person.relevantNews && (
                  <p className="relevant-news"><strong>📰 Recent:</strong> {person.relevantNews}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Origin Analysis */}
      {webResults?.imageOrigin?.found && (
        <div className="image-origin-section">
          <h4>🔍 Image Origin Analysis</h4>
          <div className="origin-card">
            {webResults.imageOrigin.originalSource && (
              <p><strong>Original Source:</strong> {webResults.imageOrigin.originalSource}</p>
            )}
            {webResults.imageOrigin.dateFirstSeen && (
              <p><strong>First Seen:</strong> {webResults.imageOrigin.dateFirstSeen}</p>
            )}
            {webResults.imageOrigin.isManipulated && (
              <div className="manipulation-warning">
                <strong>⚠️ Manipulation Detected:</strong>
                <p>{webResults.imageOrigin.manipulationDetails}</p>
              </div>
            )}
            {webResults.imageOrigin.previousUsage && webResults.imageOrigin.previousUsage.length > 0 && (
              <div className="previous-usage">
                <strong>Previous Usage:</strong>
                <ul>
                  {webResults.imageOrigin.previousUsage.map((usage, i) => (
                    <li key={i}>{usage}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fact Check Results */}
      {webResults?.factCheckResults && webResults.factCheckResults.length > 0 && (
        <div className="factcheck-section">
          <h4>✅ Fact-Check Results</h4>
          <div className="factcheck-cards">
            {webResults.factCheckResults.map((fc, i) => (
              <div key={i} className="factcheck-card">
                <div className="fc-header">
                  <span className="fc-org">{fc.organization}</span>
                  <span className={`fc-verdict verdict-${fc.verdict?.toLowerCase()}`}>
                    {fc.verdict}
                  </span>
                </div>
                <p className="fc-summary">{fc.summary}</p>
                {fc.url && (
                  <a href={fc.url} target="_blank" rel="noopener noreferrer" className="fc-link">
                    View Full Fact-Check →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {webResults?.warnings && webResults.warnings.length > 0 && (
        <div className="warnings-section">
          <h4>⚠️ Warnings</h4>
          <ul className="warnings-list">
            {webResults.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rationale-section">
        <h4>Analysis Summary</h4>
        <div 
          className="rationale-text"
          dangerouslySetInnerHTML={{ __html: formatRationale(analysis.rationale) }}
        />
      </div>
    </div>
  );
}
