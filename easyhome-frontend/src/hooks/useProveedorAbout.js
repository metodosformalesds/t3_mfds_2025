import { useState, useEffect } from 'react';
import api from '../config/api';

export default function useProveedorAbout(idProveedor) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!idProveedor) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(
          `/api/v1/proveedores/${idProveedor}/perfil-about`
        );
        setData(response.data);
        setError(null);
      } catch (err) {
        setError('Error al cargar la información del proveedor');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idProveedor]);

  return { data, loading, error };
}
