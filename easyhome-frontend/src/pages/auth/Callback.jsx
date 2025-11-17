import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../config/api';

function Callback() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (auth.isAuthenticated) {
      const redirectData = sessionStorage.getItem("afterLoginRedirect");

      if (redirectData) {
        sessionStorage.removeItem("afterLoginRedirect");

        const parsed = JSON.parse(redirectData);

        // Publicaciones o categorías
        if (parsed.goToFeed) {
          navigate("/cliente/feed", {
            replace: true,
            state: parsed.filtrosIniciales
              ? { filtrosIniciales: parsed.filtrosIniciales }
              : {}
          });
          return;
        }
      }

      // Default
      navigate('/', { replace: true });
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Procesando inicio de sesión...</h2>
      <p>Sincronizando tu cuenta...</p>
    </div>
  );
}

export default Callback;
