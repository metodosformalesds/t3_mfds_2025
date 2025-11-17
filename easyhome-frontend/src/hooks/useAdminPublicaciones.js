import { useState, useEffect } from 'react';
import servicePublicationService from '../services/servicePublicationService';

export const useAdminPublicaciones = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cargarPublicaciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await servicePublicationService.getAllPublications();
      setPublicaciones(data);
    } catch (err) {
      setError(err.message || err.detail || 'Error al cargar publicaciones');
      console.error('Error cargando publicaciones:', err);
    } finally {
      setLoading(false);
    }
  };

  const eliminarPublicacion = async (idPublicacion) => {
    setLoading(true);
    setError(null);
    try {
      await servicePublicationService.deletePublication(idPublicacion);
      // Recargar publicaciones después de eliminar
      await cargarPublicaciones();
      return { success: true, message: 'Publicación eliminada correctamente' };
    } catch (err) {
      const errorMsg = err.message || err.detail || 'Error al eliminar publicación';
      setError(errorMsg);
      console.error('Error eliminando publicación:', err);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  return {
    publicaciones,
    loading,
    error,
    cargarPublicaciones,
    eliminarPublicacion
  };
};
