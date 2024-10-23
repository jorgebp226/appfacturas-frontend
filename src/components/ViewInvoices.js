import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { listInvoices } from '../graphql/queries';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Visualizar Facturas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por Categoría" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Todas</SelectItem>
                                {categories.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por Proveedor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Todos</SelectItem>
                                {vendors.map(vendor => (
                                    <SelectItem key={vendor} value={vendor}>{vendor}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex space-x-2">
                            <Button onClick={handleFilter} className="flex-1">
                                Filtrar
                            </Button>
                            <Button onClick={handleReset} variant="outline" className="flex-1">
                                Resetear
                            </Button>
                        </div>
                    </div>

                    <div className="w-full h-80 mb-8">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="total" fill="#3B82F6" name="Total Gastos" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="p-3 text-left">ID</th>
                                    <th className="p-3 text-left">Artículo</th>
                                    <th className="p-3 text-right">Precio Total</th>
                                    <th className="p-3 text-left">Fecha</th>
                                    <th className="p-3 text-left">Categoría</th>
                                    <th className="p-3 text-left">Proveedor</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredInvoices.map(inv => (
                                    <tr key={inv.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{inv.id}</td>
                                        <td className="p-3">{inv.itemName}</td>
                                        <td className="p-3 text-right">
                                            ${parseFloat(inv.totalPrice || 0).toFixed(2)}
                                        </td>
                                        <td className="p-3">{new Date(inv.issueDate).toLocaleDateString()}</td>
                                        <td className="p-3">{inv.category}</td>
                                        <td className="p-3">{inv.vendor}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ViewInvoices;