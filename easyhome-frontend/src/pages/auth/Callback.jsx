import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';

function Callback() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (auth.isAuthenticated && auth.user && !syncing) {
        setSyncing(true);
        
        try {
          console.log('🔄 Sincronizando usuario con backend...');
          console.log('User profile:', auth.user.profile);
          
          // Llamar a sync-cognito-user
          const response = await apiClient.post('/api/v1/auth/sync-cognito-user', {
            email: auth.user.profile.email,
            cognito_sub: auth.user.profile.sub,
            name: auth.user.profile.name || auth.user.profile.email.split('@')[0],
            phone: auth.user.profile.phone_number || null,
            cognito_groups: auth.user.profile['cognito:groups'] || ['Clientes']
          });

          console.log('✅ Usuario sincronizado:', response.data);

          // Guardar información adicional en localStorage
          localStorage.setItem('user_id', response.data.user_id);
          localStorage.setItem('user_groups', JSON.stringify(response.data.groups));
          localStorage.setItem('user_email', auth.user.profile.email);

          // Redirigir al home
          navigate('/');
        } catch (err) {
          console.error('❌ Error al sincronizar usuario:', err);
          setError('Error al sincronizar con el servidor. Por favor intenta de nuevo.');
        }
      }
    };

    syncUser();
  }, [auth.isAuthenticated, auth.user, navigate, syncing]);

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Procesando inicio de sesión...</h2>
      <p>Sincronizando tu cuenta...</p>
    </div>
  );
}

export default Callback;