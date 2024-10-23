import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listInvoices } from '../graphql/queries';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ViewInvoices.css';

const ViewInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const client = generateClient();

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            const invoiceData = await client.graphql({
                query: listInvoices,
                authMode: 'AMAZON_COGNITO_USER_POOLS'
            });
            
            const invoicesList = invoiceData.data.listInvoices.items.filter(item => !item._deleted);
            setInvoices(invoicesList);
            setFilteredInvoices(invoicesList);

            const uniqueCategories = [...new Set(invoicesList.map(inv => inv.category))];
            const uniqueVendors = [...new Set(invoicesList.map(inv => inv.vendor))];
            
            setCategories(uniqueCategories);
            setVendors(uniqueVendors);
        } catch (error) {
            console.error('Error fetching invoices:', error);
            setError('Error al cargar las facturas. Por favor, intente de nuevo más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        let filtered = invoices;
        
        if (selectedCategory) {
            filtered = filtered.filter(inv => inv.category === selectedCategory);
        }
        
        if (selectedVendor) {
            filtered = filtered.filter(inv => inv.vendor === selectedVendor);
        }
        
        setFilteredInvoices(filtered);
    };

    const handleReset = () => {
        setSelectedCategory('');
        setSelectedVendor('');
        setFilteredInvoices(invoices);
    };

    // Preparar datos para el gráfico
    const chartData = categories.map(cat => ({
        name: cat,
        total: filteredInvoices
            .filter(inv => inv.category === cat)
            .reduce((acc, curr) => acc + parseFloat(curr.totalPrice || 0), 0)
            .toFixed(2)
    }));

    if (loading) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="view-container">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">Visualizar Facturas</h2>
                </div>
                
                <div className="filters-container">
                    <div className="filter-group">
                        <label className="filter-label">Categoría</label>
                        <select 
                            className="filter-select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Proveedor</label>
                        <select 
                            className="filter-select"
                            value={selectedVendor}
                            onChange={(e) => setSelectedVendor(e.target.value)}
                        >
                            <option value="">Todos los proveedores</option>
                            {vendors.map(vendor => (
                                <option key={vendor} value={vendor}>{vendor}</option>
                            ))}
                        </select>
                    </div>

                    <div className="button-group">
                        <button onClick={handleFilter} className="button button-primary">
                            Filtrar
                        </button>
                        <button onClick={handleReset} className="button button-secondary">
                            Resetear
                        </button>
                    </div>
                </div>

                <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total" fill="#2563eb" name="Total Gastos" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Artículo</th>
                                <th>Precio Total</th>
                                <th>Fecha</th>
                                <th>Categoría</th>
                                <th>Proveedor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map(inv => (
                                <tr key={inv.id}>
                                    <td>{inv.id}</td>
                                    <td>{inv.itemName}</td>
                                    <td>${parseFloat(inv.totalPrice || 0).toFixed(2)}</td>
                                    <td>{new Date(inv.issueDate).toLocaleDateString()}</td>
                                    <td>{inv.category}</td>
                                    <td>{inv.vendor}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViewInvoices;