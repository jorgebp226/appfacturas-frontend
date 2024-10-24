import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';
import { listInvoices } from '../../graphql/queries';
import { Search, Filter, Grid, List, MoreVertical } from 'lucide-react';
import './ViewExpenses.css';

const ViewExpenses = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    dateRange: 'all',
    status: 'all',
    category: 'all'
  });
  const [view, setView] = useState('list');
  const [stats, setStats] = useState({
    total: 0,
    accepted: 0,
    pending: 0,
    overdue: 0
  });

  const client = generateClient();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      
      const response = await client.graphql({
        query: listInvoices,
        variables: {
          filter: {
            userId: { eq: user.userId },
            _deleted: { ne: true }
          }
        },
        authMode: 'AMAZON_COGNITO_USER_POOLS'
      });

      const invoiceData = response.data.listInvoices.items;
      setInvoices(invoiceData);
      calculateStats(invoiceData);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const stats = data.reduce((acc, invoice) => {
      acc.total += invoice.totalPrice || 0;
      if (invoice.status === 'ACCEPTED') acc.accepted += invoice.totalPrice || 0;
      if (invoice.status === 'PENDING') acc.pending += invoice.totalPrice || 0;
      if (invoice.status === 'OVERDUE') acc.overdue += invoice.totalPrice || 0;
      return acc;
    }, { total: 0, accepted: 0, pending: 0, overdue: 0 });

    setStats(stats);
  };

  const getStatusBadgeClass = (status) => {
    const baseClasses = 'status-badge';
    switch (status) {
      case 'ACCEPTED': return `${baseClasses} accepted`;
      case 'PENDING': return `${baseClasses} pending`;
      case 'OVERDUE': return `${baseClasses} overdue`;
      default: return baseClasses;
    }
  };

  return (
    <div className="expenses-container">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-title">Total Facturas</div>
          <div className="stat-value">${stats.total.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Aceptadas</div>
          <div className="stat-value">${stats.accepted.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Pendientes</div>
          <div className="stat-value">${stats.pending.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Vencidas</div>
          <div className="stat-value">${stats.overdue.toFixed(2)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Buscar</label>
            <div className="relative">
              <input
                type="text"
                className="filter-input"
                placeholder="Buscar documentos..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="filter-group">
            <label className="filter-label">Periodo</label>
            <select
              className="filter-input"
              value={filters.dateRange}
              onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            >
              <option value="all">Todos</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Estado</label>
            <select
              className="filter-input"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="all">Todos</option>
              <option value="accepted">Aceptados</option>
              <option value="pending">Pendientes</option>
              <option value="overdue">Vencidos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="documents-section">
        <div className="table-header">
          <h2 className="text-lg font-semibold">Documentos (120)</h2>
          <div className="view-controls">
            <button 
              className={`action-button ${view === 'list' ? 'primary-button' : 'secondary-button'}`}
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </button>
            <button 
              className={`action-button ${view === 'grid' ? 'primary-button' : 'secondary-button'}`}
              onClick={() => setView('grid')}
            >
              <Grid className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Documento</th>
                <th>Proyecto</th>
                <th>Valor</th>
                <th>Balance</th>
                <th>Estado</th>
                <th>Vencimiento</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{new Date(invoice.issueDate).toLocaleDateString()}</td>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.associatedProject}</td>
                  <td>${invoice.totalPrice?.toFixed(2)}</td>
                  <td>${invoice.balanceDue?.toFixed(2)}</td>
                  <td>
                    <span className={getStatusBadgeClass(invoice.status)}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
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