import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AnalysisDetail } from './pages/AnalysisDetail';
import './styles/App.css';

function AnalysisDetailWrapper() {
  const { id } = useParams();
  return <AnalysisDetail claimId={id} />;
}

function AppRoutes() {
  const { token } = useAuth();
  const navigate = useNavigate();

  if (!token) {
    return <Login />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-brand">
          <h1>InfoSage</h1>
        </div>
        <div className="header-nav">
          <button onClick={() => navigate('/')}>Dashboard</button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/claim/:id" element={<AnalysisDetailWrapper />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
