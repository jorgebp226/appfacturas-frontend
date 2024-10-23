import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import UploadInvoices from './components/UploadInvoices';
import ViewInvoices from './components/ViewInvoices';
import '@aws-amplify/ui-react/styles.css';
import './App.css';
import Amplify from 'aws-amplify';
import awsconfig from './aws-exports'; // Asegúrate de que el archivo esté en el directorio correcto

Amplify.configure(awsconfig);


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
    return <div>Cargando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const NavigationBar = ({ onSignOut }) => {
  const handleSignOut = async () => {
    try {
      await signOut();
      onSignOut();
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <nav className="p-4 bg-gray-800 text-white">
      <ul className="flex space-x-4">
        <li><Link to="/" className="hover:text-gray-300">Subir Facturas</Link></li>
        <li><Link to="/view" className="hover:text-gray-300">Visualizar Facturas</Link></li>
        <li><button onClick={handleSignOut} className="hover:text-gray-300">Cerrar Sesión</button></li>
      </ul>
    </nav>
  );
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
        {({ user }) => (
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/login" element={
                authenticated ? <Navigate to="/" /> : <Authenticator />
              } />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <div className="app-container">
                    <NavigationBar onSignOut={() => setAuthenticated(false)} />
                    <UploadInvoices />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/view" element={
                <ProtectedRoute>
                  <div className="app-container">
                    <NavigationBar onSignOut={() => setAuthenticated(false)} />
                    <ViewInvoices />
                  </div>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        )}
      </Authenticator>
    </Router>
  );
};

export default App;