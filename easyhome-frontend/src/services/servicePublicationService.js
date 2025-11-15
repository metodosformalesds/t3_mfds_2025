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
};
 
export default servicePublicationService;