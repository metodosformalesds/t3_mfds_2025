import { useCallback, useEffect, useState } from "react";
import api from "../config/api";

const STATUS_LABELS = {
  confirmado: "Confirmado",
  en_proceso: "En proceso",
  finalizado: "Finalizado",
};

const FINALIZABLE_STATES = new Set(["confirmado", "en_proceso"]);
const PLACEHOLDER_PHOTO = "https://via.placeholder.com/80";

const mapService = (service) => ({
  id: service.id_servicio_contratado,
  clientName: service.usuario?.nombre ?? "Cliente sin nombre",
  clientPhoto: service.usuario?.foto_perfil ?? PLACEHOLDER_PHOTO,
  contactPhone: service.usuario?.numero_telefono ?? "Sin teléfono",
  status: service.estado_servicio,
  statusLabel: STATUS_LABELS[service.estado_servicio] ?? service.estado_servicio,
  canFinish: FINALIZABLE_STATES.has(service.estado_servicio),
  date: service.fecha_confirmacion_acuerdo ?? service.fecha_contacto,

  finishedAt: service.fecha_finalizacion ?? null,
});

export const useProviderServices = (providerId) => {
  const [activeServices, setActiveServices] = useState([]);
  const [finishedServices, setFinishedServices] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carga todos los servicios del proveedor.
   */
  const fetchServices = useCallback(async () => {
    if (!providerId) {
      setActiveServices([]);
      setFinishedServices([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await api.get(
        `/api/v1/status-servicio/proveedores/${providerId}/servicios`
      );

      setActiveServices(data.activos.map(mapService));
      setFinishedServices(data.finalizados.map(mapService));
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        "No se pudieron cargar los servicios.";

      setError(detail);
      setActiveServices([]);
      setFinishedServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [providerId]);

  /**
   * Finaliza un servicio activo.
   * Al hacerlo, lo elimina de 'activos' y lo mueve a 'finalizados'.
   */
  const finalizarServicio = useCallback(
    async (serviceId) => {
      const { data } = await api.put(
        `/api/v1/status-servicio/servicios/${serviceId}/finalizar`
      );

      // Sacar el servicio de la lista activa
      const servicioFinalizado = activeServices.find(
        (srv) => srv.id === serviceId
      );

      setActiveServices((prev) =>
        prev.filter((srv) => srv.id !== serviceId)
      );

      // Agregarlo a finalizados, con estado actualizado
      if (servicioFinalizado) {
        setFinishedServices((prev) => [
          ...prev,
          {
            ...servicioFinalizado,
            status: "finalizado",
            statusLabel: "Finalizado",
            canFinish: false,
            finishedAt: data.fecha_finalizacion,
          },
        ]);
      }

      return data;
    },
    [activeServices]
  );

  // Cargar servicios al montar o cuando cambie providerId
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    activeServices,
    finishedServices,
    isLoading,
    error,
    fetchServices,
    finalizarServicio,
  };
};

export default useProviderServices;