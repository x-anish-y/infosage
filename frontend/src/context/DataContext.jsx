import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const DataContext = createContext();

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
      const response = await axios.get('http://localhost:4000/api/clusters', {
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
      const response = await axios.get('http://localhost:4000/api/claims', {
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
      const response = await axios.get(`http://localhost:4000/api/clusters/${clusterId}`);
      setSelectedCluster(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch cluster detail', error);
    }
  };

  const fetchClaimDetail = async (claimId) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/claims/${claimId}`);
      setSelectedClaim(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch claim detail', error);
    }
  };

  const createClaim = async (text, sourceType = 'manual') => {
    try {
      const response = await axios.post('http://localhost:4000/api/claims', {
        text,
        sourceType,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create claim', error);
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
