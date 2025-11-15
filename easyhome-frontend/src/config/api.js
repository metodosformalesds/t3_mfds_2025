import axios from 'axios';
import { userManager } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

apiClient.interceptors.request.use(
  
  async (config) => {
    
    const user = await userManager.getUser();

    if (user && !user.expired && user.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - (Este se queda igual, ya estaba bien)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('No autorizado. Por favor inicia sesión.');
          // Podrías llamar a userManager.signinRedirect() aquí si quisieras
          break;
        case 403:
          console.error('Acceso prohibido.');
          break;
        // ...otros casos
        default:
          console.error('Error en la petición:', error.response.data);
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor.');
    } else {
      console.error('Error al configurar la petición:', error.message);
    }
    return Promise.reject(error);
  }
);


export default apiClient;
export { API_BASE_URL };