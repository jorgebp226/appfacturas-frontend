import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import { getCurrentUser } from 'aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import config from './aws-exports';
import MainLayout from './components/Layout/MainLayout';
import UploadInvoices from './components/UploadInvoices';
import Analytics from './components/Analytics';
import ViewExpenses from './components/ViewExpenses';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

Amplify.configure(config);

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    } catch (err) {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
    </div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    checkCurrentUser();
  }, []);

  async function checkCurrentUser() {
    try {
      const user = await getCurrentUser();
      setAuthenticated(!!user);
    } catch (err) {
      setAuthenticated(false);
    }
  }

  return (
    <Router>
      <Authenticator>
        {({ signOut }) => (
          <Routes>
            <Route path="/login" element={
              authenticated ? <Navigate to="/digitalizar" /> : <Authenticator />
            } />
            
            <Route path="/digitalizar" element={
              <ProtectedRoute>
                <MainLayout onSignOut={() => setAuthenticated(false)}>
                  <UploadInvoices />
                </MainLayout>
              </ProtectedRoute>
            } />
                        
                        <Route path="/analytics" element={
              <ProtectedRoute>
                <MainLayout onSignOut={() => setAuthenticated(false)}>
                  <Analytics />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/gastos" element={
              <ProtectedRoute>
                <MainLayout onSignOut={() => setAuthenticated(false)}>
                  <ViewExpenses />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/digitalizar" replace />} />
          </Routes>
        )}
      </Authenticator>
    </Router>
  );
};

export default App;