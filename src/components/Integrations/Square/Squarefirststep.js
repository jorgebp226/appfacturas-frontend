import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Squarefirststep.css'; // Importar el archivo CSS

const DashboardPage = () => {
  const [bearerToken, setBearerToken] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [orders, setOrders] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Obtener las ubicaciones desde la API de Square
  const fetchLocations = async () => {
    if (!bearerToken) {
      setErrorMessage('Por favor, ingresa tu Bearer Token.');
      return;
    }

    const client = axios.create({
      baseURL: 'https://connect.squareup.com/v2',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Square-Version': '2024-10-17',
      }
    });

    try {
      const response = await client.get('/locations');
      setLocations(response.data.locations);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(`Error al obtener ubicaciones: ${error.message}`);
    }
  };

  // Obtener los pedidos de una ubicación
  const fetchOrders = async (locationId) => {
    const client = axios.create({
      baseURL: 'https://connect.squareup.com/v2',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Square-Version': '2024-10-17',
        'Content-Type': 'application/json'
      }
    });

    const body = {
      location_ids: [locationId],
      query: {
        filter: {
          date_time_filter: {
            created_at: {
              start_at: '2024-01-01T00:00:00Z',
              end_at: '2024-12-31T23:59:59Z',
            }
          }
        },
        sort: {
          sort_field: 'CREATED_AT',
          sort_order: 'DESC'
        }
      },
      limit: 10
    };

    try {
      const response = await client.post('/orders/search', body);
      setOrders(response.data.orders || []);
    } catch (error) {
      setErrorMessage(`Error al obtener pedidos: ${error.message}`);
    }
  };

  // Manejar la selección de una ubicación
  const handleLocationChange = (e) => {
    const locationId = e.target.value;
    setSelectedLocationId(locationId);
    fetchOrders(locationId);
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Estadísticas de Pedidos de Square</h1>

      <div className="bearer-input-container">
        <input
          type="text"
          placeholder="Introduce tu Bearer Token"
          value={bearerToken}
          onChange={(e) => setBearerToken(e.target.value)}
          className="bearer-input"
        />
        <button onClick={fetchLocations} className="bearer-button">Obtener Ubicaciones</button>
      </div>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {locations.length > 0 && (
        <div className="location-container">
          <label htmlFor="location-select">Selecciona una ubicación:</label>
          <select
            id="location-select"
            onChange={handleLocationChange}
            className="location-select"
          >
            <option value="">Selecciona una ubicación</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} - {location.address.address_line_1}, {location.address.locality}
              </option>
            ))}
          </select>
        </div>
      )}

      {orders.length > 0 && (
        <div className="orders-container">
          <h2>Pedidos recientes</h2>
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <p><strong>ID del Pedido:</strong> {order.id}</p>
              <p><strong>Fecha de Creación:</strong> {order.created_at}</p>
              <div className="order-items">
                <h3>Productos:</h3>
                {order.line_items.map((item, index) => (
                  <p key={index}>
                    {item.name} - {item.base_price_money.amount / 100} {item.base_price_money.currency}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Aquí puedes añadir gráficos o dashboards adicionales */}
      <div className="dashboard-stats">
        <h2>Estadísticas del día</h2>
        <div className="stat-box">
          <h3>Ingreso Total:</h3>
          <p>{orders.reduce((sum, order) => sum + order.total_money.amount / 100, 0)} EUR</p>
        </div>
        <div className="stat-box">
          <h3>Ticket Medio por Pedido:</h3>
          <p>{(orders.reduce((sum, order) => sum + order.total_money.amount / 100, 0) / orders.length).toFixed(2)} EUR</p>
        </div>
        <div className="stat-box">
          <h3>Pedidos Totales:</h3>
          <p>{orders.length}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
