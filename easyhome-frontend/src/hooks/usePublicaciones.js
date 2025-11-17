import { useState, useEffect } from "react";
import api from "../config/api";

export default function usePublicaciones(filtros = {}) {
  const [publicaciones, setPublicaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Construcción dinámica de query params
        const params = new URLSearchParams();

        // 🔹 Categorías (pueden ser varias)
        if (Array.isArray(filtros.categorias) && filtros.categorias.length > 0) {
          filtros.categorias.forEach((catId) => {
            params.append("categorias", catId);
          });
        }

        // 🔹 Suscriptores
        if (filtros.suscriptores === true) {
          params.append("suscriptores", "true");
        }

        // 🔹 Ordenar
        if (filtros.ordenar_por) {
          params.append("ordenar_por", filtros.ordenar_por);
        }

        const url = `/api/v1/publicaciones?${params.toString()}`;
        console.log("📌 URL generada:", url);

        const response = await api.get(url);
        setPublicaciones(response.data || []);

      } catch (err) {
        console.error("❌ Error obteniendo publicaciones:", err);
        setError("Error al obtener publicaciones");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [JSON.stringify(filtros)]); // 🔥 Para que se actualice cuando los filtros cambien

  return { publicaciones, isLoading, error };
}
