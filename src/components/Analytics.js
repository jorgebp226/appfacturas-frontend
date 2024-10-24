import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { CurrencyEuroIcon, UsersIcon, ChartPieIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { getCurrentUser } from 'aws-amplify/auth';
import './Analytics.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#FF4551'];

const Analytics = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('category'); // Estado para las pestañas

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const currentUser = await getCurrentUser();
      const userSub = currentUser.userId;
      const response = await fetch(`https://01i2v9iqjl.execute-api.eu-west-3.amazonaws.com/Talky-Restaurant/invoices/${userSub}`);
      const data = await response.json();
      setInvoices(data.items);
    } catch (error) {
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  // Función corregida para calcular los totales por mes a partir de las facturas
  const prepareMonthlyData = () => {
    const monthlyTotals = {};
    invoices.forEach(invoice => {
      const date = new Date(invoice['Fecha de emisión']);  // Usamos la fecha de emisión
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + parseFloat(invoice['Precio total']);
    });

    // Convertimos el objeto en un array de objetos con {month, total}
    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({
        month,
        total: Number(total.toFixed(2))
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const prepareCategoryData = () => {
    const categoryTotals = {};
    invoices.forEach(invoice => {
      const category = invoice['Categoría del gasto'];
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(invoice['Precio total']);
    });

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
        percentage: ((value / totalGasto) * 100).toFixed(2)
      }));
  };

  const prepareSubcategoryData = () => {
    const subcategoryTotals = {};
    invoices.forEach(invoice => {
      const subcategory = invoice['Subcategoría del gasto'];
      subcategoryTotals[subcategory] = (subcategoryTotals[subcategory] || 0) + parseFloat(invoice['Precio total']);
    });

    return Object.entries(subcategoryTotals)
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
        percentage: ((value / totalGasto) * 100).toFixed(2)
      }));
  };

  const prepareProviderData = () => {
    const providerTotals = {};
    invoices.forEach(invoice => {
      const provider = invoice['Proveedor'];
      providerTotals[provider] = (providerTotals[provider] || 0) + parseFloat(invoice['Precio total']);
    });

    return Object.entries(providerTotals)
      .map(([name, value]) => ({
        name,
        value: Number(value.toFixed(2)),
        percentage: ((value / totalGasto) * 100).toFixed(2)
      }));
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="animate-pulse text-xl font-semibold">Cargando análisis...</div>
    </div>
  );

  if (error) return (
    <div className="error-screen">
      <div className="text-red-600 text-xl font-semibold">{error}</div>
    </div>
  );

  const totalGasto = invoices.reduce((sum, invoice) => 
    sum + parseFloat(invoice['Precio total']), 0
  ).toFixed(2);

  const monthlyData = prepareMonthlyData();
  const categoryData = prepareCategoryData();
  const subcategoryData = prepareSubcategoryData();
  const providerData = prepareProviderData();
  const activeData = activeTab === 'category' ? categoryData : activeTab === 'subcategory' ? subcategoryData : providerData;

  return (
    <div className="analytics-page">
      <div className="container">
        <h1 className="title">Dashboard Financiero</h1>

        {/* Stats Cards */}
        <div className="stats-grid">
          <StatsCard
            title="Gasto Total"
            value={`${totalGasto}€`}
            icon={<CurrencyEuroIcon className="icon" />}
            trend="+12.3%"
          />
          <StatsCard
            title="Total Facturas"
            value={invoices.length}
            icon={<UsersIcon className="icon" />}
            trend="+4.5%"
          />
          <StatsCard
            title="Gasto Medio"
            value={`${(totalGasto / invoices.length).toFixed(2)}€`}
            icon={<ChartPieIcon className="icon" />}
            trend="+2.7%"
          />
          <StatsCard
            title="Proveedores"
            value={new Set(invoices.map(i => i.Proveedor)).size}
            icon={<BuildingStorefrontIcon className="icon" />}
            trend="+1.2%"
          />
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          
          {/* Monthly Expenses Chart */}
          <div className="chart-container">
            <h2 className="chart-title">Gastos Mensuales</h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="total" stroke="#0088FE" strokeWidth={3} dot={{ fill: '#0088FE', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart Section */}
          <div className="chart-container">
            <h2 className="chart-title">Distribución por Categoría</h2>
            
            {/* Tabs for Category, Subcategory, Provider */}
            <div className="tabs">
              <button className={`tab ${activeTab === 'category' ? 'active' : ''}`} onClick={() => setActiveTab('category')}>Categoría</button>
              <button className={`tab ${activeTab === 'subcategory' ? 'active' : ''}`} onClick={() => setActiveTab('subcategory')}>Subcategoría</button>
              <button className={`tab ${activeTab === 'provider' ? 'active' : ''}`} onClick={() => setActiveTab('provider')}>Proveedor</button>
            </div>

            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie data={activeData} cx="50%" cy="50%" outerRadius={150} dataKey="value" label={(entry) => `${entry.value}€ (${entry.percentage}%)`}>
                  {activeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart for Proveedores */}
          <div className="chart-container">
            <h2 className="chart-title">Gastos por Proveedor</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                <YAxis stroke="#6b7280" tick={{ fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }} />
                <Bar dataKey="total" fill="#82ca9d" />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon, trend }) => (
  <div className="stats-card">
    <div className="stats-header">
      <div className="stats-icon-container">
        {icon}
      </div>
      <span className={`stats-trend ${trend.startsWith('+') ? 'positive' : 'negative'}`}>
        {trend}
      </span>
    </div>
    <h3 className="stats-title">{title}</h3>
    <p className="stats-value">{value}</p>
  </div>
);

export default Analytics;
