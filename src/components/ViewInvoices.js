// src/components/ViewInvoices.js

import React, { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { listInvoices } from '../graphql/queries';
import './ViewInvoices.css';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const ViewInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [filteredInvoices, setFilteredInvoices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const invoiceData = await API.graphql(graphqlOperation(listInvoices));
            const invoicesList = invoiceData.data.listInvoices.items;
            setInvoices(invoicesList);
            setFilteredInvoices(invoicesList);

            const uniqueCategories = [...new Set(invoicesList.map(inv => inv.category))];
            setCategories(uniqueCategories);

            const uniqueVendors = [...new Set(invoicesList.map(inv => inv.vendor))];
            setVendors(uniqueVendors);
        } catch (error) {
            console.error('Error fetching invoices:', error);
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
    const chartData = {
        labels: categories,
        datasets: [
            {
                label: 'Gastos por Categoría',
                data: categories.map(cat => {
                    return invoices.filter(inv => inv.category === cat).reduce((acc, curr) => acc + curr.totalPrice, 0);
                }),
                backgroundColor: 'rgba(75,192,192,0.6)',
            }
        ]
    };

    return (
        <div className="view-container">
            <h2>Visualizar Facturas</h2>
            <div className="filters">
                <div className="filter">
                    <label>Filtrar por Categoría:</label>
                    <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">Todas</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="filter">
                    <label>Filtrar por Proveedor:</label>
                    <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)}>
                        <option value="">Todos</option>
                        {vendors.map(vendor => (
                            <option key={vendor} value={vendor}>{vendor}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-buttons">
                    <button onClick={handleFilter}>Filtrar</button>
                    <button onClick={handleReset}>Resetear</button>
                </div>
            </div>
            <div className="chart">
                <Bar data={chartData} />
            </div>
            <div className="invoice-list">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Artículo/Servicio</th>
                            <th>Precio Total</th>
                            <th>Fecha de Emisión</th>
                            <th>Categoría</th>
                            <th>Subcategoría</th>
                            <th>Proveedor</th>
                            <th>Número de Factura</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredInvoices.map(inv => (
                            <tr key={inv.id}>
                                <td>{inv.id}</td>
                                <td>{inv.itemName}</td>
                                <td>{inv.totalPrice}</td>
                                <td>{inv.issueDate}</td>
                                <td>{inv.category}</td>
                                <td>{inv.subcategory}</td>
                                <td>{inv.vendor}</td>
                                <td>{inv.invoiceNumber}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewInvoices;
