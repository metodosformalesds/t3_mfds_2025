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
 
    // Para FormData, NO establecer ningún header de Content-Type
    // Axios lo hará automáticamente con el boundary correcto
    if (config.data instanceof FormData) {
      // NO tocar config.headers para FormData - dejar que Axios lo maneje
      if (user && !user.expired && user.access_token) {
        // Solo agregar Authorization sin tocar otros headers
        if (!config.headers) config.headers = {};
        config.headers.Authorization = `Bearer ${user.access_token}`;
      }
    } else {
      // Para otros tipos de request, preservar headers normalmente
      if (user && !user.expired && user.access_token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${user.access_token}`
        };
      }
    }

    // 🔍 DEBUG temporal - quitar después
    console.log('=== AXIOS REQUEST DEBUG ===');
    console.log('URL:', config.baseURL + config.url);
    console.log('Method:', config.method?.toUpperCase());
    console.log('Headers:', config.headers);
    console.log('Data type:', config.data?.constructor.name);

    if (config.data instanceof FormData) {
      console.log('✓ Es FormData - Contenido:');
      for (let pair of config.data.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: [File] ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }
    }
    console.log('===========================');
 
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