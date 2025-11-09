// hooks/useCognitoSync.js
import { useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import apiClient from '../config/api';

export const useCognitoSync = () => {
  const auth = useAuth();

  useEffect(() => {
    const syncUser = async () => {
      if (auth.isAuthenticated && auth.user) {
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
        } catch (error) {
          console.error('Error al sincronizar usuario con la BD:', error.response?.data || error.message);
        }
      }
    };

    syncUser();
  }, [auth.isAuthenticated, auth.user]);

  return null;
};
