import { useCallback, useEffect, useState } from "react";
import api from "../config/api";

const STATUS_LABELS = {
  confirmado: "Confirmado",
  en_proceso: "En proceso",
  finalizado: "Finalizado",
};

const FINALIZABLE_STATES = new Set(["confirmado", "en_proceso"]);
const PLACEHOLDER_PHOTO = "https://via.placeholder.com/80";

/** Mapeo inicial de un servicio */
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

  /** Cargar servicios activos y finalizados */
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
      const msg =
        err.response?.data?.detail ||
        "No se pudieron cargar los servicios.";

      setError(msg);
      setActiveServices([]);
      setFinishedServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return {
    activeServices,
    finishedServices,
    isLoading,
    error,
    fetchServices,
  };
};

export default useProviderServices;
