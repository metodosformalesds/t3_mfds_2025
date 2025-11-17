import { useEffect, useState } from "react";
import api from "../config/api";

export const useAlerts = (userId) => {
  const [alerts, setAlerts] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const loadAlerts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/v1/alertas/${userId}`);
        setAlerts(data);

        const unread = data.filter(a => a.leida === false);
        setLatestAlert(unread.length > 0 ? unread[0] : null);
      } catch (err) {
        console.error("Error cargando alertas:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();
  }, [userId]);

  return { alerts, latestAlert, loading };
};

export default useAlerts;
