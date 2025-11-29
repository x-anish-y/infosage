import { useState } from 'react';
import { useData } from '../context/DataContext';
import './SearchBar.css';

export function SearchBar() {
  const [input, setInput] = useState('');
  const [sourceType, setSourceType] = useState('');
  const { createClaim, fetchClusters } = useData();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const result = await createClaim(input, sourceType || 'manual');
      console.log('Claim created:', result);
      setInput('');
      alert('Claim submitted for analysis!');
      
      // Refresh clusters to show the new claim
      setTimeout(() => {
        fetchClusters();
      }, 2000);
    } catch (error) {
      console.error('Submit error details:', error.response?.data || error.message);
      alert('Failed to submit claim: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File upload would be handled by media API
    console.log('File selected:', file.name);
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter claim, paste link, or describe rumor..."
            className="search-input"
            rows="3"
          />
        </div>

        <div className="form-controls">
          <div className="source-select">
            <select value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
              <option value="">Source Type</option>
              <option value="manual">Manual Entry</option>
              <option value="twitter">Twitter</option>
              <option value="telegram">Telegram</option>
              <option value="rss">RSS Feed</option>
              <option value="youtube">YouTube</option>
              <option value="web">Web Article</option>
            </select>
          </div>

          <label className="file-upload">
            📎 Upload Image/Video
            <input type="file" onChange={handleFileUpload} accept="image/*,video/*" />
          </label>

          <button type="submit" className="submit-btn">
            🔍 Analyze
          </button>
        </div>
      </form>
    </div>
  );
}
