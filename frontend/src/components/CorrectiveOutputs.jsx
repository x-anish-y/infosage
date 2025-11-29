import { useState } from 'react';
import './CorrectiveOutputs.css';

export function CorrectiveOutputs({ claimId, analysis, verdictText }) {
  const [outputs, setOutputs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedType, setCopiedType] = useState(null);

  const generateOutputs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/outputs/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          claimId,
          outputTypes: ['whatsapp', 'sms', 'social', 'explainer'],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate outputs');
      }

      const data = await response.json();
      setOutputs(data.outputs);
    } catch (err) {
      setError(err.message);
      console.error('Error generating outputs:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, type) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const outputsData = [
    {
      type: 'whatsapp',
      icon: '📱',
      title: 'WhatsApp Message',
      description: 'WhatsApp-friendly corrective message',
      key: 'whatsapp',
    },
    {
      type: 'sms',
      icon: '💬',
      title: 'SMS Text',
      description: 'SMS-friendly corrective message (160 chars)',
      key: 'sms',
    },
    {
      type: 'social',
      icon: '𝕏',
      title: 'Social Post',
      description: 'Social media corrective message (280 chars)',
      key: 'social',
    },
    {
      type: 'explainer',
      icon: '📝',
      title: 'Long Explainer',
      description: 'Detailed explanation article',
      key: 'explainer',
      fullWidth: true,
    },
  ];

  return (
    <div className="corrective-outputs">
      <div className="outputs-header">
        <h3>Corrective Outputs</h3>
        <button
          className="generate-btn"
          onClick={generateOutputs}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate with AI'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {!outputs && !loading && (
        <div className="no-outputs">
          <p>Click "Generate with AI" to create corrective messages for different platforms</p>
        </div>
      )}

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Generating corrective outputs...</p>
        </div>
      )}

      {outputs && (
        <div className="outputs-grid">
          {outputsData.map((item) => (
            <div
              key={item.type}
              className={`output-card ${item.fullWidth ? 'full-width' : ''}`}
            >
              <div className="output-header">
                <h4>
                  <span className="output-icon">{item.icon}</span>
                  {item.title}
                </h4>
                <button
                  className={`copy-btn ${copiedType === item.type ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(outputs[item.key], item.type)}
                  title="Copy to clipboard"
                >
                  {copiedType === item.type ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
              <p className="output-description">{item.description}</p>
              <div className="output-text">
                {outputs[item.key] ? (
                  <p>{outputs[item.key]}</p>
                ) : (
                  <p className="placeholder">Unable to generate {item.title.toLowerCase()}</p>
                )}
              </div>
              {outputs[item.key] && (
                <div className="output-meta">
                  <span className="char-count">
                    {outputs[item.key].length} characters
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
