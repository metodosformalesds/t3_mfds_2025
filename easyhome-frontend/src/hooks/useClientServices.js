import { useState, useEffect, useCallback } from 'react';
import api from '../config/api';

const STATUS_LABELS = {
  contactado: "Contactado",
  confirmado: "Confirmado",
  en_proceso: "En proceso",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

const PLACEHOLDER_PHOTO = "https://via.placeholder.com/80";

/**
 * Hook personalizado para obtener los servicios contratados de un cliente.
 * @param {number} clientId - El ID del cliente actual.
 * @returns {object} Un objeto con servicios, estado de carga y error.
 */
export const useClientServices = (clientId) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para transformar el formato de respuesta de FastAPI al formato de React
  const formatServiceData = (apiService) => {
    const proveedor = apiService.proveedor || {};
    const status = apiService.estado_servicio;
    
    // DEBUG: Ver qué datos llegan del backend
    console.log('🔍 DEBUG apiService:', {
      id: apiService.id_servicio_contratado,
      estado: apiService.estado_servicio,
      tiene_reseña: apiService.tiene_reseña,
      tipo_tiene_reseña: typeof apiService.tiene_reseña,
      confirmacion_cliente: apiService.confirmacion_cliente_finalizado,
      calificacion_cliente: apiService.calificacion_cliente
    });
    
    // Permitir reseñar cuando el servicio esté FINALIZADO y aún no tenga reseña
    // (ya no dependemos de confirmacion_cliente_finalizado del cliente)}
    const estadoFinalizado =
      apiService.estado_servicio?.toLowerCase() === "finalizado";

    const noTieneResena =
      apiService.tiene_reseña === false ||
      apiService.tiene_reseña === 0 ||
      apiService.tiene_reseña === null ||
      apiService.tiene_reseña === "false";

    const canReview = estadoFinalizado && noTieneResena;
    
    console.log('✅ canReview calculado:', canReview, 'para servicio', apiService.id_servicio_contratado);




    // Formatear fecha
    const formatDate = (isoDate) => {
      if (!isoDate) return 'Fecha no disponible';
      const date = new Date(isoDate);
      return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(date);
    };

    return {
      id: apiService.id_servicio_contratado,
      providerName: proveedor.nombre || 'Proveedor sin nombre',
      providerPhoto: proveedor.foto_perfil || PLACEHOLDER_PHOTO,
      providerRating: proveedor.calificacion_promedio || 0,
      providerReviews: 0, // Este dato requiere consulta adicional si se necesita
      isPremium: false, // Este dato requiere consulta adicional si se necesita
      date: formatDate(apiService.fecha_confirmacion_acuerdo || apiService.fecha_contacto),
      status: STATUS_LABELS[status] || status,
      statusRaw: status,
      canReview: canReview,
      providerId: proveedor.id_proveedor,
      providerUserId: proveedor.id_usuario,
      clientRating: apiService.calificacion_cliente || null, // Calificación asignada por el cliente
    };
  };

  const fetchServices = useCallback(async () => {
    if (!clientId) {
      setServices([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.get(
        `/api/v1/status-servicio/clientes/${clientId}/servicios`
      );

      const formattedServices = data.map(formatServiceData);
      setServices(formattedServices);

    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        'No se pudieron cargar los servicios contratados.';

      setError(detail);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, isLoading, error, fetchServices };
};

export default useClientServices;