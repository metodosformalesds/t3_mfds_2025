import { useEffect, useState } from "react";
import api from "../config/api";

export const useAlerts = (userId) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const loadAlerts = async () => {
      try {
        const { data } = await api.get(`/api/v1/alertas/${userId}`);
        setAlerts(data);
      } catch (err) {
        console.error("Error cargando alertas:", err);
      }
    };

    loadAlerts();
  }, [userId]);

  return { alerts };
};

export default useAlerts;
