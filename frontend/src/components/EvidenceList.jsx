import './EvidenceList.css';

export function EvidenceList({ sources = [] }) {
  if (!sources || sources.length === 0) {
    return <div className="evidence-list empty">No sources available</div>;
  }

  const reliabilityColor = {
    high: '#10b981',
    medium: '#f59e0b',
    low: '#ef4444',
  };

  return (
    <div className="evidence-list">
      <h3>Evidence & Sources</h3>
      <div className="sources-container">
        {sources.map((source, idx) => (
          <div key={idx} className="source-card">
            <div className="source-header">
              <div className="source-type-badge">{source.type}</div>
              <div
                className="reliability-badge"
                style={{ backgroundColor: reliabilityColor[source.reliability] || '#6b7280' }}
              >
                {source.reliability}
              </div>
            </div>
            <h4 className="source-title">{source.title}</h4>
            {source.snippet && <p className="source-snippet">{source.snippet}</p>}
            {source.url && (
              <a href={source.url} target="_blank" rel="noopener noreferrer" className="source-link">
                View source →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
