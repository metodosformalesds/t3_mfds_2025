import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';

function Callback() {
  const auth = useAuth();
  const navigate = useNavigate();

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
      <p>Por favor espera un momento.</p>
    </div>
  );
}

export default Callback;
