import React, { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { LineChart, XAxis, YAxis, Tooltip, Legend, Line, BarChart, Bar } from 'recharts';
import './Squarefirststep.css';

const SquareDashboard = () => {
  const [userSub, setUserSub] = useState(null);
  const [bearerToken, setBearerToken] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBearerInput, setShowBearerInput] = useState(false);

  useEffect(() => {
    initialize();
  }, []);

  const initialize = async () => {
    try {
      const currentUser = await getCurrentUser();
      const sub = currentUser.userId;
      setUserSub(sub);
      
      // Intentar obtener el bearer token guardado
      const response = await fetch(`https://4c5ekdhyy9.execute-api.eu-west-3.amazonaws.com/square/squarebearer?user_sub=${sub}`);
      const data = await response.json();
      
      if (response.ok) {
        setBearerToken(data.bearer_token);
        await fetchLocations(data.bearer_token);
      } else {
        setShowBearerInput(true);
      }
    } catch (error) {
      setError('Error initializing: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveBearerToken = async () => {
    try {
      const response = await fetch(`https://4c5ekdhyy9.execute-api.eu-west-3.amazonaws.com/square/squarebearer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_sub: userSub,
          bearer_token: bearerToken
        })
      });

      if (response.ok) {
        setShowBearerInput(false);
        await fetchLocations(bearerToken);
      } else {
        throw new Error('Failed to save bearer token');
      }
    } catch (error) {
      setError('Error saving bearer token: ' + error.message);
    }
  };

  const fetchLocations = async (token) => {
    try {
      const response = await fetch(`https://4c5ekdhyy9.execute-api.eu-west-3.amazonaws.com/square/squareinfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bearer_token: token,
          request_type: 'locations'
        })
      });

      const data = await response.json();
      if (response.ok) {
        setLocations(data.locations);
      } else {
        throw new Error(data.error || 'Failed to fetch locations');
      }
    } catch (error) {
      setError('Error fetching locations: ' + error.message);
    }
  };

  const fetchOrders = async (locationId) => {
    try {
      const response = await fetch(`https://4c5ekdhyy9.execute-api.eu-west-3.amazonaws.com/square/squareinfo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bearer_token: bearerToken,
          request_type: 'orders',
          location_id: locationId
        })
      });

      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        throw new Error(data.error || 'Failed to fetch orders');
      }
    } catch (error) {
      setError('Error fetching orders: ' + error.message);
    }
  };

  const handleLocationChange = (e) => {
    const locationId = e.target.value;
    setSelectedLocation(locationId);
    if (locationId) {
      fetchOrders(locationId);
    }
  };

  // Process orders for total sales and average ticket
  const processOrdersData = () => {
    const dailyTotals = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      const total = order.total_money.amount / 100;
      dailyTotals[date] = (dailyTotals[date] || 0) + total;
    });

    return Object.entries(dailyTotals).map(([date, total]) => ({
      date,
      total
    }));
  };

  // Process products ordered for histogram
  const processProductOrders = () => {
    const productOrders = {};
    orders.forEach(order => {
      order.line_items.forEach(item => {
        const productName = item.name;
        const quantity = parseInt(item.quantity);
        productOrders[productName] = (productOrders[productName] || 0) + quantity;
      });
    });

    return Object.entries(productOrders).map(([name, quantity]) => ({ name, quantity }));
  };

  // Process weekly revenue and product breakdown
  const processWeeklyData = () => {
    const weeklyData = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString();
      weeklyData[date] = weeklyData[date] || { date, products: {} };

      order.line_items.forEach(item => {
        const productName = item.name;
        const total = item.total_money.amount / 100;
        weeklyData[date].products[productName] = (weeklyData[date].products[productName] || 0) + total;
      });
    });

    return Object.values(weeklyData);
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <h1>Square Dashboard</h1>
      
      {showBearerInput ? (
        <div className="bearer-input-section">
          <input
            type="text"
            value={bearerToken}
            onChange={(e) => setBearerToken(e.target.value)}
            placeholder="Introduce tu Bearer Token de Square"
            className="bearer-input"
          />
          <button onClick={saveBearerToken} className="save-button">
            Guardar Token
          </button>
        </div>
      ) : (
        <>
          <div className="location-selector">
            <select value={selectedLocation} onChange={handleLocationChange}>
              <option value="">Selecciona una ubicación</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          {selectedLocation && orders.length > 0 && (
            <>
              <div className="dashboard-stats">
                <div className="stats-cards">
                  <div className="stat-card">
                    <i className="fas fa-receipt"></i>
                    <h3>Total Orders</h3>
                    <p>{orders.length}</p>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-ticket-alt"></i>
                    <h3>Average Ticket</h3>
                    <p>€{(orders.reduce((sum, order) => sum + (order.total_money.amount / 100), 0) / orders.length).toFixed(2)}</p>
                  </div>
                  <div className="stat-card">
                    <i className="fas fa-money-bill-wave"></i>
                    <h3>Total Sales</h3>
                    <p>€{orders.reduce((sum, order) => sum + (order.total_money.amount / 100), 0).toFixed(2)}</p>
                  </div>
                </div>

                {/* Daily Histogram for Products */}
                <div className="chart-container">
                  <h3>Daily Product Sales</h3>
                  <BarChart width={600} height={300} data={processProductOrders()}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#82ca9d" />
                  </BarChart>
                </div>

                {/* Weekly Overview */}
                <div className="chart-container">
                  <h3>Weekly Revenue and Product Breakdown</h3>
                  <BarChart width={600} height={300} data={processWeeklyData()}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {/* Assuming a utility function to generate random colors */}
                    {Object.keys(processWeeklyData()[0].products).map((productName, index) => (
                      <Bar key={index} dataKey={`products.${productName}`} stackId="a" fill="#82ca9d" />
                    ))}
                  </BarChart>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default SquareDashboard;
