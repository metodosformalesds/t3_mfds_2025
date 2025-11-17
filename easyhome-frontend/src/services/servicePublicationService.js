// src/services/servicePublicationService.js
 
import apiClient from '../config/api';
 
const servicePublicationService = {

    /**
     * Crear publicacion de servicio
     * @param {FormData} formData
     */
    createPublication: async (formData) => {
        try {
            const response = await apiClient.post('/api/v1/publicaciones/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, // 60 segundos para uploads de múltiples imágenes
            });
            return response.data;
        } catch (error) {
            console.error('Error en createPublication:', error);
            if (error.response) {
                throw error;
            }
            throw new Error(error.message || "Error de conexión con la API.");
        }
    },

    /**
     * Obtener todas las publicaciones
     */
    getAllPublications: async () => {
        try {
            const response = await apiClient.get('/api/v1/publicaciones/');
            return response.data;
        } catch (error) {
            console.error('Error en getAllPublications:', error);
            if (error.response) {
                throw {
                    message: error.response.data?.detail || "Error al obtener publicaciones",
                    detail: error.response.data?.detail
                };
            }
            throw new Error(error.message || "Error de conexión con la API.");
        }
    },

    /**
     * Eliminar publicacion
     * @param {number} id_publicacion
     */
    deletePublication: async (id_publicacion) => {
        try {
            const response = await apiClient.delete(`/api/v1/publicaciones/${id_publicacion}`);
            return response.data;
        } catch (error) {
            console.error('Error en deletePublication:', error);
            if (error.response) {
                throw {
                    message: error.response.data?.detail || "Error al eliminar publicación",
                    detail: error.response.data?.detail
                };
            }
            throw new Error(error.message || "Error de conexión con la API.");
        }
    },
};

export default servicePublicationService;