// src/config/api.js
import axios from 'axios';
import { userManager } from './authService';
 
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
 
// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 segundos - AUMENTADO para uploads
});
 
apiClient.interceptors.request.use(
  async (config) => {
    const user = await userManager.getUser();

    // 1. Asegurarnos de que config.headers exista
    if (!config.headers) {
      config.headers = {};
    }

    // 2. Añadir token de autorización SIEMPRE (si existe)
    if (user && !user.expired && user.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }

    // 3. Manejar el Content-Type
    if (config.data instanceof FormData) {
      // SI ES FORMDATA: Borramos explícitamente el Content-Type.
      // Esto FUERZA a Axios a generar el 'multipart/form-data'
      // con el 'boundary' correcto.
      delete config.headers['Content-Type'];
    } else {
      // SI NO ES FORMDATA: Asumimos JSON.
      // Esto arregla otras peticiones (POST, PUT) que envíen JSON.
      config.headers['Content-Type'] = 'application/json';
    }

    // 🔍 DEBUG (lo dejas como lo tenías)
    console.log('=== AXIOS REQUEST DEBUG ===');
    console.log('URL:', config.baseURL + config.url);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Headers:', config.headers); // <-- Revisa aquí que Content-Type ya no esté
    console.log('Data type:', config.data?.constructor.name);
    // ... (el resto de tu debug) ...
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
 
// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    console.log('=== AXIOS RESPONSE DEBUG ===');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('============================');
    return response;
  },
  (error) => {
    console.log('=== AXIOS ERROR DEBUG ===');
    console.log('Error completo:', error);
    console.log('Response:', error.response);
    console.log('Request:', error.request);
    console.log('Config:', error.config);
    console.log('=========================');
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('No autorizado. Por favor inicia sesión.');
          break;
        case 403:
          console.error('Acceso prohibido.');
          break;
        case 422:
          console.error('Error de validación:', error.response.data);
          break;
        default:
          console.error('Error en la petición:', error.response.data);
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor.');
      console.error('Request que falló:', error.request);
    } else {
      console.error('Error al configurar la petición:', error.message);
    }
    return Promise.reject(error);
  }
);
 
export default apiClient;
export { API_BASE_URL };