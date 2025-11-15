import axios from 'axios';
// 1. Importamos el MISMO userManager que usan AuthProvider y main.jsx
import { userManager } from './authService';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});
// Interceptor para requests - agregar token de autenticación si existe
apiClient.interceptors.request.use(
  
  // 2. Convertimos la función en async
  async (config) => {
    
    // 3. Ya no buscamos en localStorage. Le pedimos el usuario al userManager.
    const user = await userManager.getUser();

    // 4. Si el usuario existe, no ha expirado y tiene un token...
    if (user && !user.expired && user.access_token) {
      // 5. ...lo adjuntamos a la cabecera.
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejo centralizado de errores
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