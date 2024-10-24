import React, { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
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
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      setLoading(true);
      const currentUser = await getCurrentUser();
      const userSub = currentUser.userId;

      const response = await fetch(`https://01i2v9iqjl.execute-api.eu-west-3.amazonaws.com/Talky-Restaurant/invoices/${userSub}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al obtener las facturas');

      const data = await response.json();
      setInvoices(data.items);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const prepareMonthlyData = () => {
    const monthlyTotals = {};
    invoices.forEach(invoice => {
      const date = new Date(invoice['Fecha de emisión'].split('/').reverse().join('-'));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + parseFloat(invoice['Precio total']);
    });

    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({
        month: month,
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

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));
  };

  const prepareProviderData = () => {
    const providerTotals = {};
    invoices.forEach(invoice => {
      const provider = invoice['Proveedor'];
      providerTotals[provider] = (providerTotals[provider] || 0) + parseFloat(invoice['Precio total']);
    });

    return Object.entries(providerTotals).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2))
    }));
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold">{label}</p>
          <p className="text-blue-600">{`Total: ${payload[0].value.toFixed(2)}€`}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-xl font-semibold">Cargando análisis...</div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-600 text-xl font-semibold">{error}</div>
    </div>
  );

  const monthlyData = prepareMonthlyData();
  const categoryData = prepareCategoryData();
  const providerData = prepareProviderData();

  const totalGasto = invoices.reduce((sum, invoice) => 
    sum + parseFloat(invoice['Precio total']), 0
  ).toFixed(2);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-8">Dashboard de Gastos</h1>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGasto}€</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Nº de Facturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gasto Medio por Factura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalGasto / invoices.length).toFixed(2)}€
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Proveedores Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{providerData.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expenses Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Gastos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#0088FE" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Categories Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
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
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Providers Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Proveedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={providerData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {providerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;