// src/services/reviewService.js
import apiClient from '../config/api';

const reviewService = {
    /**
     * Obtener información del servicio contratado
     */
    getServicioInfo: async (id_servicio_contratado) => {
        try {
            const response = await apiClient.get(`/api/v1/status-servicio/servicios/${id_servicio_contratado}/info-resena`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener información del servicio:', error);
            throw error;
        }
    },

    /**
     * Crear una nueva reseña de servicio
     */
    createReview: async (reviewData) => {
        try {
            const formData = new FormData();
            
            formData.append('id_servicio_contratado', String(reviewData.id_servicio_contratado));
            formData.append('user_email', reviewData.user_email);
            formData.append('calificacion_general', String(reviewData.calificacion_general));
            formData.append('calificacion_puntualidad', String(reviewData.calificacion_puntualidad));
            formData.append('calificacion_calidad_servicio', String(reviewData.calificacion_calidad_servicio));
            formData.append('calificacion_calidad_precio', String(reviewData.calificacion_calidad_precio));
            formData.append('recomendacion', reviewData.recomendacion);
            
            if (reviewData.comentario && reviewData.comentario.trim() !== '') {
                formData.append('comentario', reviewData.comentario);
            }
            
            if (reviewData.imagenes && reviewData.imagenes.length > 0) {
                reviewData.imagenes.slice(0, 5).forEach((imagen) => {
                    formData.append('imagenes', imagen);
                });
            }
            
            const response = await apiClient.post('/api/v1/reseñas/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            return response.data;
        } catch (error) {
            console.error('Error al crear reseña:', error);
            throw error;
        }
    },

    /**
     * Obtener todas las reseñas de un cliente
     */
    getClienteReseñas: async (userEmail) => {
        try {
            const response = await apiClient.get(`/api/v1/reseñas/cliente/${encodeURIComponent(userEmail)}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reseñas del cliente:', error);
            throw error;
        }
    },

    /**
     * Obtener todas las reseñas recibidas por un proveedor
     */
    getProveedorReseñas: async (idProveedor) => {
        try {
            const response = await apiClient.get(`/api/v1/reseñas/proveedor/${encodeURIComponent(idProveedor)}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reseñas del proveedor:', error);
            throw error;
        }
    },
};

export default reviewService;