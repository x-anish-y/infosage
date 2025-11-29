import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { AnalysisSummary } from '../components/AnalysisSummary';
import { EvidenceList } from '../components/EvidenceList';
import { TrendChart } from '../components/TrendChart';
import '../styles/AnalysisDetail.css';

export function AnalysisDetail({ claimId }) {
  const { fetchClaimDetail } = useData();
  const [claim, setClaim] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    async function load() {
      const data = await fetchClaimDetail(claimId);
      setClaim(data);
      setAnalysis(data?.analysis);
      setLoading(false);
    }
    load();
  }, [claimId]);

  if (loading) return <div className="loading">Loading analysis...</div>;
  if (!claim) return <div className="error">Claim not found</div>;

  // Pass full data objects to TrendChart component with proper timestamp formatting
  const chartData = analysis?.charts?.mentionsOverTime?.map((d) => ({
    t: typeof d.t === 'string' ? new Date(d.t) : d.t,
    count: d.count || 0,
    sources: d.sources || 0,
    engagement: d.engagement || 0,
    trend: d.trend || 'stable'
  })) || [];

  return (
    <div className="analysis-detail">
      <div className="detail-header">
        <h2>Claim Analysis</h2>
        <div className="claim-text-box">
          <p className="claim-text">{claim.text}</p>
          {claim.sourceType && (
            <span className="source-badge">{claim.sourceType.toUpperCase()}</span>
          )}
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`tab-btn ${activeTab === 'evidence' ? 'active' : ''}`}
          onClick={() => setActiveTab('evidence')}
        >
          Evidence
        </button>
        <button
          className={`tab-btn ${activeTab === 'spread' ? 'active' : ''}`}
          onClick={() => setActiveTab('spread')}
        >
          Spread
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'summary' && (
          <AnalysisSummary analysis={analysis} />
        )}

        {activeTab === 'evidence' && (
          <EvidenceList sources={analysis?.sources || []} />
        )}

        {activeTab === 'spread' && (
          <TrendChart data={chartData} />
        )}
      </div>
    </div>
  );
}
