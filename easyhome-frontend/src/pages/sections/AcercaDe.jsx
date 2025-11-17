import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import api from '../../config/api';
import reviewService from '../../services/reseñaservicio';
import { useProviderServices } from '../../hooks/useProviderServices';

function AcercaDe({idProveedor, isPublicProfile = false, providerName = ""}) {
  const [proveedorData, setProveedorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para estadísticas dinámicas
  const [avgRating, setAvgRating] = useState(null);
  const { finishedServices } = useProviderServices(idProveedor);

  useEffect(() => {
    const fetchProveedorData = async () => {
      if (!idProveedor) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/api/v1/proveedores/${idProveedor}/perfil-about`);
        setProveedorData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al obtener datos del proveedor:', err);
        setError('No se pudo cargar la información del proveedor');
      } finally {
        setLoading(false);
      }
    };

    fetchProveedorData();
  }, [idProveedor]);
  
  // Cargar reseñas del proveedor y calcular promedio de calificación general
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!idProveedor) return;
      try {
        const data = await reviewService.getProveedorReseñas(idProveedor);
        const ratings = (Array.isArray(data) ? data : [])
          .map((r) => Number(r?.reseña?.calificacion_general))
          .filter((n) => Number.isFinite(n));
        if (!mounted) return;
        if (ratings.length) {
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          setAvgRating(avg);
        } else {
          setAvgRating(null);
        }
      } catch (_) {
        if (mounted) setAvgRating(null);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [idProveedor]);
  
  const finishedServicesCount = useMemo(() => {
    return Array.isArray(finishedServices) ? finishedServices.length : 0;
  }, [finishedServices]);
  
  const satisfactionPercent = useMemo(() => {
    if (!Number.isFinite(avgRating)) return null;
    return Math.round((avgRating / 5) * 100);
  }, [avgRating]);

  if (!idProveedor) {
    return (
      <div className="acerca-de-container">
        <h2>Acerca de</h2>
        <p>Esta sección está disponible solo para proveedores de servicios.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="acerca-de-container">
        <div className="loading">Cargando información...</div>
      </div>
    );
  }

  if (error || !proveedorData) {
    return (
      <div className="acerca-de-container">
        <div className="error">{error || 'Error al cargar la información'}</div>
      </div>
    );
  }

  return (
    <div className="acerca-de-container">
      <h2>
        {isPublicProfile 
          ? `Acerca de ${providerName}`   //Segun sea perfil publico o personal
          : "Acerca de mí"}               
      </h2>
      
      {/* Biografía */}
      <section className="bio-section">
        <h3>Descripción Profesional</h3>
        <p>{proveedorData.biografia || 'No hay biografía disponible.'}</p>
      </section>

      {/* Especialidades */}
      <section className="especialidades-section">
        <h3>Especialidades</h3>
        <div className="tags">
          {proveedorData.especializaciones ? (
            proveedorData.especializaciones.split(',').map((esp, index) => (
              <span key={index} className="tag">
                {esp.trim()}
              </span>
            ))
          ) : (
            <p>No hay especialidades registradas.</p>
          )}
        </div>
      </section>

      {/* Estadísticas dinámicas */}
      <section className="estadisticas-section">
        <h3>Estadísticas</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{finishedServicesCount}</span>
            <span className="stat-label">Servicios finalizados</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {satisfactionPercent != null ? `${satisfactionPercent}%` : "--"}
            </span>
            <span className="stat-label">Satisfacción</span>
          </div>
        </div>
      </section>

      {/* Información de ubicación */}
      {proveedorData.direccion && (
        <section className="direccion-section">
          <h3>Ubicación</h3>
          <p>{proveedorData.direccion}</p>
        </section>
      )}
    </div>
  );
}

AcercaDe.propTypes = {
  idProveedor: PropTypes.number
};

export default AcercaDe;
