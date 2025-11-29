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

  // Format claim text - clean up AI analysis prefixes for display
  const formatClaimText = (text) => {
    if (!text) return '';
    // Clean up various prefixes for cleaner display
    return text
      .replace(/\[Text extracted from image\]:\s*/g, '')
      .replace(/\[AI Analysis\]:\s*/g, '')
      .replace(/\[Extracted from image\]:\s*/g, '')
      .replace(/\[Image shows\]:\s*/g, '')
      .trim();
  };

  // Get image URL if available
  const getImageUrl = () => {
    if (claim.mediaAnalysis?.imagePath) {
      // Convert file path to URL
      const filename = claim.mediaAnalysis.imagePath.split(/[/\\]/).pop();
      return `http://localhost:4000/uploads/${filename}`;
    }
    return null;
  };

  const imageUrl = getImageUrl();
  const mediaAnalysis = claim.mediaAnalysis;

  return (
    <div className="analysis-detail">
      <div className="detail-header">
        <h2>Claim Analysis</h2>
        <div className="claim-content-box">
          {/* Show uploaded image if available */}
          {imageUrl && (
            <div className="claim-image-container">
              <img 
                src={imageUrl} 
                alt="Uploaded content" 
                className="claim-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
          <div className="claim-text-box">
            <p className="claim-text">{formatClaimText(claim.text)}</p>
            
            {/* Show identified people */}
            {mediaAnalysis?.people && mediaAnalysis.people.length > 0 && (
              <div className="people-identified-box">
                <h4>👤 People Identified</h4>
                <div className="people-list">
                  {mediaAnalysis.people.filter(p => p.name !== 'Unknown person').map((person, i) => (
                    <div key={i} className="person-card">
                      <span className="person-name">{person.name}</span>
                      {person.role && <span className="person-role">{person.role}</span>}
                      {person.confidence && (
                        <span className={`confidence-badge ${person.confidence}`}>
                          {person.confidence} confidence
                        </span>
                      )}
                      {person.description && <p className="person-desc">{person.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Show AI-extracted details if available */}
            {mediaAnalysis?.imageDescription && (
              <div className="ai-analysis-box">
                <h4>🔍 AI Image Analysis</h4>
                <p className="image-description">
                  <strong>Image shows:</strong> {mediaAnalysis.imageDescription}
                </p>
                
                {/* Scene info */}
                {mediaAnalysis.scene && (mediaAnalysis.scene.location || mediaAnalysis.scene.event) && (
                  <div className="scene-info">
                    {mediaAnalysis.scene.location && (
                      <p><strong>📍 Location:</strong> {mediaAnalysis.scene.location}</p>
                    )}
                    {mediaAnalysis.scene.event && (
                      <p><strong>📅 Event:</strong> {mediaAnalysis.scene.event}</p>
                    )}
                    {mediaAnalysis.scene.timeframe && (
                      <p><strong>🕐 Timeframe:</strong> {mediaAnalysis.scene.timeframe}</p>
                    )}
                  </div>
                )}
                
                {mediaAnalysis.extractedText && mediaAnalysis.extractedText !== mediaAnalysis.mainClaim && (
                  <p className="extracted-text">
                    <strong>Text in image:</strong> {mediaAnalysis.extractedText}
                  </p>
                )}
                
                {/* Objects identified */}
                {mediaAnalysis.objects && mediaAnalysis.objects.length > 0 && (
                  <p className="objects-list">
                    <strong>Objects:</strong> {mediaAnalysis.objects.join(', ')}
                  </p>
                )}
                
                {/* Fact-check context */}
                {mediaAnalysis.factCheckContext && (
                  <div className="factcheck-context">
                    <strong>📚 Background:</strong>
                    <p>{mediaAnalysis.factCheckContext}</p>
                  </div>
                )}
                
                {/* Known facts */}
                {mediaAnalysis.knownFacts && mediaAnalysis.knownFacts.length > 0 && (
                  <div className="known-facts">
                    <strong>✓ Verified Facts:</strong>
                    <ul>
                      {mediaAnalysis.knownFacts.map((fact, i) => (
                        <li key={i}>{fact}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Context info from research */}
            {mediaAnalysis?.contextInfo?.peopleInfo && mediaAnalysis.contextInfo.peopleInfo.length > 0 && (
              <div className="context-research-box">
                <h4>🔬 Research Context</h4>
                {mediaAnalysis.contextInfo.peopleInfo.map((person, i) => (
                  <div key={i} className="person-research">
                    <h5>{person.name}</h5>
                    {person.verifiedFacts && person.verifiedFacts.length > 0 && (
                      <div className="verified-facts">
                        <strong>Verified:</strong>
                        <ul>
                          {person.verifiedFacts.map((fact, j) => (
                            <li key={j}>{fact}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {person.commonMisinformation && person.commonMisinformation.length > 0 && (
                      <div className="common-misinfo">
                        <strong>⚠️ Common Misinformation:</strong>
                        <ul>
                          {person.commonMisinformation.map((misinfo, j) => (
                            <li key={j}>{misinfo}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Preliminary verdict from AI */}
                {mediaAnalysis.contextInfo.claimAnalysis && (
                  <div className={`preliminary-verdict verdict-${mediaAnalysis.contextInfo.claimAnalysis.likelyVerdict}`}>
                    <strong>AI Preliminary Verdict:</strong> 
                    <span className="verdict-label">
                      {mediaAnalysis.contextInfo.claimAnalysis.likelyVerdict?.toUpperCase()}
                    </span>
                    <span className="verdict-confidence">
                      ({mediaAnalysis.contextInfo.claimAnalysis.confidence} confidence)
                    </span>
                    <p className="verdict-reasoning">{mediaAnalysis.contextInfo.claimAnalysis.reasoning}</p>
                  </div>
                )}
              </div>
            )}
            
            {/* Concerns and red flags */}
            {mediaAnalysis?.concerns && mediaAnalysis.concerns.length > 0 && (
              <div className="concerns-list">
                <strong>⚠️ Concerns:</strong>
                <ul>
                  {mediaAnalysis.concerns.map((concern, i) => (
                    <li key={i}>{concern}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Verification suggestions */}
            {mediaAnalysis?.verificationSuggestions && mediaAnalysis.verificationSuggestions.length > 0 && (
              <div className="verification-suggestions">
                <strong>🔍 How to Verify:</strong>
                <ul>
                  {mediaAnalysis.verificationSuggestions.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="claim-badges">
              {claim.sourceType && (
                <span className="source-badge">{claim.sourceType.toUpperCase()}</span>
              )}
              {mediaAnalysis?.hasImage && (
                <span className="source-badge image-badge">📷 IMAGE</span>
              )}
              {mediaAnalysis?.people && mediaAnalysis.people.filter(p => p.name !== 'Unknown person').length > 0 && (
                <span className="source-badge people-badge">
                  👤 {mediaAnalysis.people.filter(p => p.name !== 'Unknown person').length} IDENTIFIED
                </span>
              )}
            </div>
          </div>
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
