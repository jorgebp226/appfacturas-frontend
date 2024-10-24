import React, { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';  // Nueva forma de obtener al usuario

const SquareLoginButton = () => {
  const [userSub, setUserSub] = useState(null);

  // Establecemos el client_id y el redirect_uri directamente en el código
  const clientId = 'your-square-client-id';  // Reemplaza esto con tu client_id real de Square
  const redirectUri = 'https://o8q11ehn5f.execute-api.eu-west-3.amazonaws.com/Auth/square';  // URL donde quieres redirigir al usuario

  // Utiliza useEffect para obtener el sub del usuario después de la autenticación
  useEffect(() => {
    const fetchUserSub = async () => {
      try {
        const currentUser = await getCurrentUser();
        const userSub = currentUser.attributes.sub;  // Obtiene el 'sub' del usuario desde las attributes
        setUserSub(userSub);  // Guarda el sub en el estado
      } catch (error) {
        console.error("Error al obtener el sub del usuario:", error);
      }
    };

    fetchUserSub();
  }, []);

  const handleLogin = () => {
    // Redirige a la página de autenticación de Square, pasando el sub del usuario como 'state'
    const squareAuthUrl = `https://connect.squareup.com/oauth2/authorize?client_id=${clientId}&scope=ORDERS_READ PAYMENTS_READ&session=false&state=${userSub}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = squareAuthUrl;  // Redirige al usuario a la página de autenticación de Square
  };

  // Si aún no hemos obtenido el sub del usuario, mostramos un mensaje de carga
  if (!userSub) {
    return <p>Cargando...</p>;
  }

  return <button onClick={handleLogin}>Conectar con Square</button>;
};

export default SquareLoginButton;
