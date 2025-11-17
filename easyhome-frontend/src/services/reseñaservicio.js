// src/services/reviewService.js
// Servicio alineado 100% con endpoints del backend /api/v1/resenas
import apiClient from '../config/api';

const reviewService = {
    /**
     * POST /api/v1/resenas/
     * Crear una nueva reseña de servicio
     *
     * @param {Object} reviewData - Datos de la reseña
     * @param {number} reviewData.id_servicio_contratado - ID del servicio (requerido)
     * @param {string} reviewData.user_email - Email del cliente (requerido)
     * @param {number} reviewData.calificacion_general - 1-5 (requerido)
     * @param {number} reviewData.calificacion_puntualidad - 1-5 (requerido)
     * @param {number} reviewData.calificacion_calidad_servicio - 1-5 (requerido)
     * @param {number} reviewData.calificacion_calidad_precio - 1-5 (requerido)
     * @param {string} reviewData.recomendacion - "Sí" o "No" (requerido)
     * @param {string} reviewData.comentario - Comentario opcional
     * @param {File[]} reviewData.imagenes - Máximo 5 imágenes
     *
     * @returns {Promise<Object>} { message, id_reseña, total_imagenes, estado, fecha_reseña }
     */
    createReview: async (reviewData) => {
        try {
            const formData = new FormData();

            // Campos requeridos (backend espera estos como Form(...))
            formData.append('id_servicio_contratado', String(reviewData.id_servicio_contratado));
            formData.append('user_email', reviewData.user_email);
            formData.append('calificacion_general', String(reviewData.calificacion_general));
            formData.append('calificacion_puntualidad', String(reviewData.calificacion_puntualidad));
            formData.append('calificacion_calidad_servicio', String(reviewData.calificacion_calidad_servicio));
            formData.append('calificacion_calidad_precio', String(reviewData.calificacion_calidad_precio));
            formData.append('recomendacion', reviewData.recomendacion);

            // Campo opcional: comentario
            if (reviewData.comentario && reviewData.comentario.trim() !== '') {
                formData.append('comentario', reviewData.comentario.trim());
            }

            // Campo opcional: imágenes (máximo 5)
            if (reviewData.imagenes && Array.isArray(reviewData.imagenes) && reviewData.imagenes.length > 0) {
                reviewData.imagenes.slice(0, 5).forEach((imagen) => {
                    formData.append('imagenes', imagen);
                });
            }

            // NO establecer Content-Type - Axios lo hace automáticamente con boundary
            const response = await apiClient.post('/api/v1/resenas/', formData);

            return response.data;
        } catch (error) {
            console.error('Error al crear reseña:', error);
            throw error;
        }
    },

    /**
     * GET /api/v1/resenas/cliente/{user_email}
     * Obtener todas las reseñas realizadas por un cliente
     *
     * @param {string} userEmail - Email del cliente
     * @returns {Promise<Array>} Array de { reseña, cliente, proveedor }
     */
    getClienteReseñas: async (userEmail) => {
        try {
            const response = await apiClient.get(`/api/v1/resenas/cliente/${encodeURIComponent(userEmail)}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reseñas del cliente:', error);
            throw error;
        }
    },

    /**
     * GET /api/v1/resenas/proveedor/{id_proveedor}
     * Obtener todas las reseñas recibidas por un proveedor
     *
     * @param {number} idProveedor - ID del proveedor
     * @returns {Promise<Array>} Array de { reseña, cliente, proveedor }
     */
    getProveedorReseñas: async (idProveedor) => {
        try {
            const response = await apiClient.get(`/api/v1/resenas/proveedor/${idProveedor}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener reseñas del proveedor:', error);
            throw error;
        }
    },

    /**
     * GET /api/v1/status-servicio/servicios/{id_servicio_contratado}/info-resena
     * Obtener información del servicio para crear reseña
     *
     * @param {number} id_servicio_contratado - ID del servicio contratado
     * @returns {Promise<Object>} { nombre_proveedor, nombre_servicio, fecha_contratacion, foto_perfil }
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
};

export default reviewService;