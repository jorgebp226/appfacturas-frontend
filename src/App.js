// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UploadInvoices from './components/UploadInvoices';
import ViewInvoices from './components/ViewInvoices';
import './App.css';

const App = () => {
    return (
        <Router>
            <div className="app-container">
                <nav>
                    <ul>
                        <li><Link to="/">Subir Facturas</Link></li>
                        <li><Link to="/view">Visualizar Facturas</Link></li>
                    </ul>
                </nav>
                <Routes>
                    <Route path="/" element={<UploadInvoices />} />
                    <Route path="/view" element={<ViewInvoices />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
