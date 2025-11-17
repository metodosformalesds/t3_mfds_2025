import { useEffect, useState, useCallback } from "react";
import api from "../config/api";

export const useAlerts = (userId) => {
  const [alerts, setAlerts] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = useCallback(async () => {
    if (!userId) return;

    setLoading(true);

    try {
      const { data } = await api.get(`/api/v1/alertas/${userId}`);

      setAlerts(data);

      const unreadAlerts = data.filter((a) => a.leida === false);

      if (unreadAlerts.length > 0) {
        setLatestAlert(unreadAlerts[0]); 
      } else {
        setLatestAlert(null);
      }

    } catch (err) {
      console.error("Error cargando alertas:", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return {
    alerts,
    latestAlert,
    loading,
    fetchAlerts,
  };
};

export default useAlerts;
