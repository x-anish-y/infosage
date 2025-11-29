import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const DataContext = createContext();

const API_URL = 'http://localhost:4000';

export function DataProvider({ children }) {
  const [clusters, setClusters] = useState([]);
  const [claims, setClaims] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    riskTier: null,
    language: 'en',
    timeRange: 7, // days
  });

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/clusters`, {
        params: {
          riskTier: filters.riskTier,
          limit: 50,
        },
      });
      setClusters(response.data.clusters || []);
    } catch (error) {
      console.error('Failed to fetch clusters', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async (query = '') => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/claims`, {
        params: {
          query,
          language: filters.language,
          limit: 50,
        },
      });
      setClaims(response.data.claims || []);
    } catch (error) {
      console.error('Failed to fetch claims', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClusterDetail = async (clusterId) => {
    try {
      const response = await axios.get(`${API_URL}/api/clusters/${clusterId}`);
      setSelectedCluster(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cluster detail', error);
    }
  };

  const fetchClaimDetail = async (claimId) => {
    try {
      const response = await axios.get(`${API_URL}/api/claims/${claimId}`);
      setSelectedClaim(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch claim detail', error);
    }
  };

  const createClaim = async (text, sourceType = 'manual') => {
    try {
      const response = await axios.post(`${API_URL}/api/claims`, {
        text,
        sourceType,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create claim', error);
      throw error;
    }
  };

  const createClaimWithMedia = async (text, file, sourceType = 'image') => {
    try {
      // Step 1: Upload image and get comprehensive OpenAI Vision analysis
      const formData = new FormData();
      formData.append('file', file);
      formData.append('extractText', 'true');

      const uploadResponse = await axios.post(`${API_URL}/api/media/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { ocrText, fullAnalysis, contextInfo, forensics, filePath, identifiedPeople, preliminaryVerdict } = uploadResponse.data;

      // Step 2: Build claim text from AI analysis
      let claimText = text?.trim() || '';
      
      // Add identified people to claim if found
      if (identifiedPeople && identifiedPeople.length > 0) {
        const peopleStr = identifiedPeople.map(p => `${p.name}${p.role ? ` (${p.role})` : ''}`).join(', ');
        if (claimText) {
          claimText = `${claimText}\n\n[People identified]: ${peopleStr}`;
        } else {
          claimText = `Claim about: ${peopleStr}`;
        }
      }
      
      // Use the AI's main claim identification if available
      if (fullAnalysis?.mainClaim) {
        if (claimText && !claimText.includes(fullAnalysis.mainClaim)) {
          claimText = `${claimText}\n\n[AI Analysis]: ${fullAnalysis.mainClaim}`;
        } else if (!claimText) {
          claimText = fullAnalysis.mainClaim;
        }
      } else if (ocrText && ocrText.trim().length > 10) {
        // Fallback to extracted text
        if (claimText) {
          claimText = `${claimText}\n\n[Extracted from image]: ${ocrText.trim()}`;
        } else {
          claimText = ocrText.trim();
        }
      }

      // If still no text, use image description
      if (!claimText && fullAnalysis?.imageDescription) {
        claimText = `[Image shows]: ${fullAnalysis.imageDescription}`;
      }

      // Final fallback
      if (!claimText) {
        claimText = '[Image uploaded for fact-check analysis]';
      }

      // Step 3: Create claim with all analysis data
      const claimResponse = await axios.post(`${API_URL}/api/claims`, {
        text: claimText,
        sourceType,
        mediaAnalysis: {
          hasImage: true,
          imagePath: filePath,
          ocrText: ocrText || '',
          extractedText: fullAnalysis?.extractedText || '',
          imageDescription: fullAnalysis?.imageDescription || '',
          mainClaim: fullAnalysis?.mainClaim || '',
          context: fullAnalysis?.context || '',
          concerns: fullAnalysis?.concerns || [],
          // Person/object identification
          people: fullAnalysis?.people || [],
          objects: fullAnalysis?.objects || [],
          scene: fullAnalysis?.scene || {},
          factCheckContext: fullAnalysis?.factCheckContext || '',
          knownFacts: fullAnalysis?.knownFacts || [],
          verificationSuggestions: fullAnalysis?.verificationSuggestions || [],
          // Context search results
          contextInfo: contextInfo || {},
          forensics: forensics || {},
        },
      });

      return {
        ...claimResponse.data,
        ocrText,
        fullAnalysis,
        contextInfo,
        identifiedPeople,
        preliminaryVerdict,
        forensics,
        imagePath: filePath,
      };
    } catch (error) {
      console.error('Failed to create claim with media', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchClusters();
  }, [filters]);

  return (
    <DataContext.Provider
      value={{
        clusters,
        claims,
        selectedCluster,
        selectedClaim,
        loading,
        filters,
        setFilters,
        fetchClusters,
        fetchClaims,
        fetchClusterDetail,
        fetchClaimDetail,
        createClaim,
        createClaimWithMedia,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
