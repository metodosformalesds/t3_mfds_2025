// src/services/resenas_perfil.js
import apiClient from '../config/api';

const reviewsService = {

  getReviewsByProvider: async (idProveedor) => {
    try {
      const response = await apiClient.get(`/api/v1/proveedores/${idProveedor}/reseñas`);
      return response.data;
    } catch (error) {
      if (error.response) throw error;
      throw new Error(error.message || "Error de conexión con la API.");
    }
  },

};

export default reviewsService;
