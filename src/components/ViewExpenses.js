import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getCurrentUser } from 'aws-amplify/auth';
import './ViewExpenses.css';

const ViewExpenses = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    dateRange: 'all',
    category: 'all',
    subcategory: 'all',
    proveedor: 'all'
  });
  const [stats, setStats] = useState({
    total: 0,
    alimentos: 0,
    servicios: 0,
    suministros: 0
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      
      // Obtener el usuario actual autenticado con la nueva API
      const currentUser = await getCurrentUser();
      const userSub = currentUser.userId;

      const response = await fetch(`https://01i2v9iqjl.execute-api.eu-west-3.amazonaws.com/Talky-Restaurant/invoices/${userSub}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al obtener las facturas');
      }

      const data = await response.json();
      setInvoices(data.items);
      calculateStats(data.items);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = data.reduce((acc, invoice) => {
      acc.total += parseFloat(invoice['Precio total']) || 0;
      switch (invoice['Categoría del gasto']) {
        case 'Alimentos':
          acc.alimentos += parseFloat(invoice['Precio total']) || 0;
          break;
        case 'Servicios':
          acc.servicios += parseFloat(invoice['Precio total']) || 0;
          break;
        case 'Suministros':
          acc.suministros += parseFloat(invoice['Precio total']) || 0;
          break;
        default:
          break;
      }
      return acc;
    }, { total: 0, alimentos: 0, servicios: 0, suministros: 0 });

    setStats(stats);
  };

  const filterInvoices = () => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        invoice['Nombre del artículo o servicio'].toLowerCase().includes(filters.search.toLowerCase()) ||
        invoice['Proveedor'].toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = filters.category === 'all' || 
        invoice['Categoría del gasto'] === filters.category;
      
      const matchesSubcategory = filters.subcategory === 'all' || 
        invoice['Subcategoría del gasto'] === filters.subcategory;
        
      const matchesProveedor = filters.proveedor === 'all' || 
        invoice['Proveedor'] === filters.proveedor;

      return matchesSearch && matchesCategory && matchesSubcategory && matchesProveedor;
    });
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const filteredInvoices = filterInvoices();

  // Obtener proveedores únicos para el filtro
  const uniqueProveedores = Array.from(new Set(invoices.map(invoice => invoice['Proveedor'])));

  return (
    <div className="expenses-container">
      {/* Tarjetas de Estadísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Gastos</div>
          <div className="stat-value">{stats.total.toFixed(2)}€</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Alimentos</div>
          <div className="stat-value">{stats.alimentos.toFixed(2)}€</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Servicios</div>
          <div className="stat-value">{stats.servicios.toFixed(2)}€</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Suministros</div>
          <div className="stat-value">{stats.suministros.toFixed(2)}€</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Buscar</label>
            <div className="relative">
              <input
                type="text"
                className="filter-input"
                placeholder="Buscar por artículo o proveedor..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Categoría</label>
            <select
              className="filter-input"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="all">Todas</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Servicios">Servicios</option>
              <option value="Suministros">Suministros</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Subcategoría</label>
            <select
              className="filter-input"
              value={filters.subcategory}
              onChange={(e) => setFilters({...filters, subcategory: e.target.value})}
            >
              <option value="all">Todas</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Carnes">Carnes</option>
              {/* Agrega más subcategorías según tus datos */}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Proveedor</label>
            <select
              className="filter-input"
              value={filters.proveedor}
              onChange={(e) => setFilters({...filters, proveedor: e.target.value})}
            >
              <option value="all">Todos</option>
              {uniqueProveedores.map((proveedor, index) => (
                <option key={index} value={proveedor}>{proveedor}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de Documentos */}
      <div className="documents-section">
        <div className="table-header">
          <h2 className="text-lg font-semibold">
            Documentos ({filteredInvoices.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Artículo/Servicio</th>
                <th>Cantidad</th>
                <th>Unidad</th>
                <th>Precio/Unidad</th>
                <th>Total</th>
                <th>Categoría</th>
                <th>Subcategoría</th>
                <th>Proveedor</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice['Fecha de emisión']}</td>
                  <td>{invoice['Nombre del artículo o servicio']}</td>
                  <td>{invoice['Cantidad de unidades']}</td>
                  <td>{invoice['Unidad de medida']}</td>
                  <td>{parseFloat(invoice['Precio por unidad']).toFixed(2)}€</td>
                  <td>{parseFloat(invoice['Precio total']).toFixed(2)}€</td>
                  <td>{invoice['Categoría del gasto']}</td>
                  <td>{invoice['Subcategoría del gasto']}</td>
                  <td>{invoice['Proveedor']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ViewExpenses;