import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../config/api';
import AboutMe from '../../components/features/aboutme';

function AcercaDe({ idProveedor }) {
  const [proveedorData, setProveedorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProveedorData = async () => {
      if (!idProveedor) {
        setProveedorData(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(
          `/api/v1/proveedores/${idProveedor}/perfil-about`
        );
        setProveedorData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error al obtener datos del proveedor:', err);
        setError('No se pudo cargar la información del proveedor');
        setProveedorData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProveedorData();
  }, [idProveedor]);

  if (loading) {
    return (
      <div className="acerca-de-container">
        <p className="about-me-summary">Cargando información...</p>
      </div>
    );
  }

  // Si hubo error o no hay datos, mandamos el fallback
  if (error || !proveedorData) {
    return (
      <div className="acerca-de-container">
        <AboutMe
          profileData={{
            summary: 'Información no disponible.',
            specialties: [],
          }}
        />
      </div>
    );
  }

  
}

AcercaDe.propTypes = {
  idProveedor: PropTypes.number,
};

export default AcercaDe;
