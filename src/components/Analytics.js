import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { CurrencyEuroIcon, UsersIcon, ChartPieIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import { getCurrentUser } from 'aws-amplify/auth';


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Analytics = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const prepareMonthlyData = () => {
    const monthlyTotals = {};
    invoices.forEach(invoice => {
      const date = new Date(invoice['Fecha de emisión']);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + parseFloat(invoice['Precio total']);
    });

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
        value: Number(value.toFixed(2))
      }));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-pulse text-xl font-semibold">Cargando análisis...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-600 text-xl font-semibold">{error}</div>
    </div>
  );

  const monthlyData = prepareMonthlyData();
  const categoryData = prepareCategoryData();
  const totalGasto = invoices.reduce((sum, invoice) => 
    sum + parseFloat(invoice['Precio total']), 0
  ).toFixed(2);

  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Financiero</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Gasto Total"
            value={`${totalGasto}€`}
            icon={<CurrencyEuroIcon className="h-6 w-6" />}
            trend="+12.3%"
          />
          <StatsCard
            title="Total Facturas"
            value={invoices.length}
            icon={<UsersIcon className="h-6 w-6" />}
            trend="+4.5%"
          />
          <StatsCard
            title="Gasto Medio"
            value={`${(totalGasto / invoices.length).toFixed(2)}€`}
            icon={<ChartPieIcon className="h-6 w-6" />}
            trend="+2.7%"
          />
          <StatsCard
            title="Proveedores"
            value={new Set(invoices.map(i => i.Proveedor)).size}
            icon={<BuildingStorefrontIcon className="h-6 w-6" />}
            trend="+1.2%"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Expenses Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 col-span-2">
            <h2 className="text-lg font-semibold mb-4">Gastos Mensuales</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#0088FE" 
                    strokeWidth={3}
                    dot={{ fill: '#0088FE', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Distribución por Categoría</h2>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon, trend }) => (
  <div className="bg-white rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-lg">
        {icon}
      </div>
      <span className={`text-sm font-medium ${
        trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
      }`}>
        {trend}
      </span>
    </div>
    <h3 className="mt-4 text-sm font-medium text-gray-500">{title}</h3>
    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

export default Analytics;