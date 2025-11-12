// src/services/servicePublicationService.js

import apiClient from '../config/api'; 

const servicePublicationService = {

    /**
     * 1️⃣ CREAR PUBLICACIÓN DE SERVICIO (POST /publicaciones/)
     * Envía los datos del formulario de publicación de servicio a FastAPI, incluyendo fotos.
     * @param {FormData} formData - Objeto FormData con todos los campos (texto, ID, precios, email y archivos 'fotos').
     */
    createPublication: async (formData) => {
    try {
        const response = await apiClient.post('/api/v1/publicaciones/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
        });
        return response.data;
    } catch (error) {
        if (error.response) {
        throw error;
        }
        throw new Error(error.message || "Error de conexión con la API.");
    }
    },
};

export default servicePublicationService;