// hooks/useCognitoSync.js
import { useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import apiClient from '../config/api';

export const useCognitoSync = () => {
  const auth = useAuth();
  const [syncAttempted, setSyncAttempted] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      // Solo ejecutar una vez por sesión
      if (auth.isAuthenticated && auth.user && !syncAttempted) {
        try {
          const userData = {
            email: auth.user.profile.email,
            cognito_sub: auth.user.profile.sub,
            name: auth.user.profile.name || auth.user.profile.email.split('@')[0],
            phone: auth.user.profile.phone_number || null,
            cognito_groups: auth.user.profile['cognito:groups'] || []
          };

          const response = await apiClient.post('/api/v1/auth/sync-cognito-user', userData);

          console.log('Usuario sincronizado:', response.data);

          // Si el usuario es nuevo o no tiene grupos, forzar refresh del token
          if (response.data.is_new || !userData.cognito_groups || userData.cognito_groups.length === 0) {
            console.log('Usuario nuevo o sin grupos, refrescando token...');

            // Esperar 2 segundos para que Cognito propague los cambios
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Forzar refresh del token para obtener los grupos actualizados
            try {
              await auth.signinSilent();
              console.log('Token refrescado exitosamente');
              // Recargar la página para aplicar los nuevos permisos
              window.location.reload();
            } catch (refreshError) {
              console.error('Error al refrescar token:', refreshError);
              // Si falla el refresh silencioso, pedir login completo
              console.log('Redirigiendo a login...');
              await auth.signinRedirect();
            }
          }

          setSyncAttempted(true);
        } catch (error) {
          console.error('Error al sincronizar usuario con la BD:', error.response?.data || error.message);
          setSyncAttempted(true);
        }
      }
    };

    syncUser();
  }, [auth.isAuthenticated, auth.user, syncAttempted, auth]);

  return null;
};
