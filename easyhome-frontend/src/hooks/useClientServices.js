import { useState, useEffect, useCallback } from 'react';

// URL base de tu API 
const API_BASE_URL = 'http://localhost:8000/api/v1/client'; 

/**
 * Hook personalizado para obtener los servicios contratados de un cliente.
 * @param {number} clientId - El ID del cliente actual.
 * @param {string} token - Token de autenticación (opcional, si lo usas).
 * @returns {object} Un objeto con servicios, estado de carga y error.
 */
export const useClientServices = (clientId) => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para transformar el formato de respuesta de FastAPI al formato de React
  const formatServiceData = (apiService) => {
    // Aquí usamos los campos de tu modelo ServicioResponse:
    // nombre_completo, fecha_confirmacion_acuerdo, estado_servicio, confirmacion_cliente_finalizado
    
    // Suponemos datos mock para el proveedor (no están en tu endpoint actual,
    // pero son necesarios para replicar el diseño de la imagen)
    const mockProviderData = {
        providerRating: 4.9,
        providerReviews: 127,
        isPremium: true,
    };
    
    // Lógica para determinar si se puede dejar reseña
    // Supuesto: Se puede reseñar si el estado es 'Terminado' (confirmacion_cliente_finalizado es true)
    // y si NO existe una reseña previa (esta lógica requiere otro endpoint o un campo adicional en el futuro)
    const status = apiService.estado_servicio;
    const isFinished = apiService.confirmacion_cliente_finalizado;
    
    let canReview = false;
    // Asumimos que si está finalizado (true) y el estado es 'Terminado', debe mostrar la opción de reseña.
    if (status === 'Terminado' && isFinished) {
        // En una app real, aquí se verificaría si ya hay una reseña
        canReview = true; 
    }

    return {
      id: apiService.id_servicio_contratado || Math.random(), // Usar un ID real si está disponible
      providerName: apiService.nombre_completo,
      providerRating: mockProviderData.providerRating,
      providerReviews: mockProviderData.providerReviews,
      isPremium: mockProviderData.isPremium,
      date: apiService.fecha_confirmacion_acuerdo || 'Fecha no disponible',
      status: status,
      canReview: canReview,
    };
  };

  const fetchServices = useCallback(async () => {
    if (!clientId) return;

    setIsLoading(true);
    setError(null);

    try {
        // --- INICIO DE SIMULACIÓN (Reemplazar por fetch real) ---
        
        // Simulación de datos que vendrían de tu endpoint FastAPI:
        // GET /{id_cliente}/servicios
        const mockApiData = [
            { nombre_completo: "Roberta Alvarado", fecha_confirmacion_acuerdo: "25/Octubre/2025", estado_servicio: "En proceso", confirmacion_cliente_finalizado: false, id_servicio_contratado: 1 },
            { nombre_completo: "Roberta Alvarado", fecha_confirmacion_acuerdo: "25/Octubre/2025", estado_servicio: "Terminado", confirmacion_cliente_finalizado: true, id_servicio_contratado: 2 },
            { nombre_completo: "Roberta Alvarado", fecha_confirmacion_acuerdo: "25/Octubre/2025", estado_servicio: "Terminado", confirmacion_cliente_finalizado: true, id_servicio_contratado: 3, has_review: true }, // Simulando una reseña existente
        ];
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Simular retraso de red

        const formattedServices = mockApiData.map(service => {
            // Ajuste mock para simular que el servicio ID 3 ya tiene reseña
            if (service.id_servicio_contratado === 3) {
                 return formatServiceData({ ...service, has_review: true });
            }
            return formatServiceData(service);
        });

        setServices(formattedServices);

        // --- FIN DE SIMULACIÓN ---

        /* // --- CÓDIGO REAL DE FETCH (Descomentar para usar con tu API) ---
        // const response = await fetch(`${API_BASE_URL}/${clientId}/servicios`, {
        //   headers: {
        //     'Authorization': `Bearer ${token}` // Si usas token
        //   }
        // });

        // if (!response.ok) {
        //   throw new Error('Error al cargar los servicios.');
        // }

        // const apiData = await response.json();
        // const formattedServices = apiData.map(formatServiceData);
        // setServices(formattedServices);
        */

    } catch (err) {
      setError(err.message || 'Error desconocido al cargar los datos.');
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [clientId]); // Dependencia del ID del cliente

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return { services, isLoading, error };
};