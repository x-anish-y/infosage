import { useState, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

export function SearchBar() {
  const [input, setInput] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef(null);
  const { createClaim, createClaimWithMedia, fetchClusters } = useData();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    setIsAnalyzing(true);
    setUploadProgress('Submitting claim...');

    try {
      let result;
      
      if (selectedFile) {
        // Upload with media
        setUploadProgress('Uploading image...');
        result = await createClaimWithMedia(input, selectedFile, sourceType || 'manual');
        setUploadProgress('Extracting text from image...');
      } else {
        // Text only
        result = await createClaim(input, sourceType || 'manual');
      }

      console.log('Claim created:', result);
      setInput('');
      clearFile();
      setUploadProgress('');
      
      // Navigate to the claim analysis page
      if (result?._id) {
        // Wait a moment for analysis to start
        setUploadProgress('Analyzing claim...');
        setTimeout(() => {
          setIsAnalyzing(false);
          navigate(`/claim/${result._id}`);
        }, 2000);
      } else {
        setIsAnalyzing(false);
        alert('Claim submitted for analysis!');
        fetchClusters();
      }
    } catch (error) {
      console.error('Submit error details:', error.response?.data || error.message);
      alert('Failed to submit claim: ' + (error.response?.data?.error || error.message));
      setIsAnalyzing(false);
      setUploadProgress('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        {/* Image Preview Area */}
        {previewUrl && (
          <div className="image-preview-container">
            <div className="image-preview">
              <img src={previewUrl} alt="Upload preview" />
              <button 
                type="button" 
                className="remove-image-btn"
                onClick={clearFile}
                title="Remove image"
              >
                ✕
              </button>
            </div>
            <div className="image-info">
              <span className="file-name">{selectedFile?.name}</span>
              <span className="file-size">
                {(selectedFile?.size / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>
        )}

        <div className="input-group">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={selectedFile 
              ? "Add context or description for the image (optional)..." 
              : "Enter claim, paste link, or describe rumor..."}
            className="search-input"
            rows="3"
            disabled={isAnalyzing}
          />
        </div>

        {uploadProgress && (
          <div className="upload-progress">
            <div className="progress-spinner"></div>
            <span>{uploadProgress}</span>
          </div>
        )}

        <div className="form-controls">
          <div className="source-select">
            <select 
              value={sourceType} 
              onChange={(e) => setSourceType(e.target.value)}
              disabled={isAnalyzing}
            >
              <option value="">Source Type</option>
              <option value="manual">Manual Entry</option>
              <option value="twitter">Twitter</option>
              <option value="telegram">Telegram</option>
              <option value="rss">RSS Feed</option>
              <option value="youtube">YouTube</option>
              <option value="web">Web Article</option>
              <option value="image">Image/Screenshot</option>
            </select>
          </div>

          <button 
            type="button" 
            className={`file-upload-btn ${selectedFile ? 'has-file' : ''}`}
            onClick={triggerFileInput}
            disabled={isAnalyzing}
          >
            {selectedFile ? '📷 Change Image' : '📎 Upload Image/Video'}
          </button>
          <input 
            ref={fileInputRef}
            type="file" 
            onChange={handleFileUpload} 
            accept="image/*"
            style={{ display: 'none' }}
          />

          <button 
            type="submit" 
            className="submit-btn"
            disabled={isAnalyzing || (!input.trim() && !selectedFile)}
          >
            {isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze'}
          </button>
        </div>
      </form>
    </div>
  );
}
