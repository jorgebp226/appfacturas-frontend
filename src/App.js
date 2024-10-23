import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Authenticator } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify';
import UploadInvoices from './components/UploadInvoices';
import ViewInvoices from './components/ViewInvoices';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      await Auth.currentAuthenticatedUser();
      setIsAuthenticated(true);
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

const NavigationBar = ({ signOut }) => (
  <nav className="p-4 bg-gray-800 text-white">
    <ul className="flex space-x-4">
      <li><Link to="/" className="hover:text-gray-300">Subir Facturas</Link></li>
      <li><Link to="/view" className="hover:text-gray-300">Visualizar Facturas</Link></li>
      <li><button onClick={signOut} className="hover:text-gray-300">Cerrar Sesión</button></li>
    </ul>
  </nav>
);

const App = () => {
  return (
    <Router>
      <Authenticator>
        {({ signOut, user }) => (
          <div className="min-h-screen bg-gray-100">
            <Routes>
              <Route path="/login" element={
                user ? <Navigate to="/" /> : <Authenticator />
              } />
              
              <Route path="/" element={
                <ProtectedRoute>
                  <div className="app-container">
                    <NavigationBar signOut={signOut} />
                    <UploadInvoices />
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/view" element={
                <ProtectedRoute>
                  <div className="app-container">
                    <NavigationBar signOut={signOut} />
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