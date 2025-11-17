import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import ResenaView from '../../components/features/componente_reseña_realizada';
import reviewService from '../../services/reseñaservicio';
import { useUserProfile } from '../../hooks/useUserProfile';

function Resenas({ idProveedor: idProveedorProp }) {
  const location = useLocation();
  const auth = useAuth();
  const { userData } = useUserProfile();
  const [reseñas, setReseñas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Determinar id del proveedor: prop (público) o del usuario autenticado (proveedor)
  const providerId = idProveedorProp ?? userData?.id_proveedor ?? null;
  
  // Capturar nueva reseña del state de navegación
  const newReview = location.state?.newReview || null;

  useEffect(() => {
    const cargarReseñas = async () => {
      // Si hay una nueva reseña en el state, agregarla primero (vista previa)
      if (newReview) {
        setReseñas([newReview]);
        setLoading(false);
        return;
      }

      // En vista pública no requerimos sesión, pero sí un id proveedor válido
      if (!providerId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let data = [];

        // Cargar reseñas del proveedor indicado (público o propio)
        if (providerId) {
          console.log('Cargando reseñas para proveedor ID:', providerId);
          data = await reviewService.getProveedorReseñas(providerId);
          console.log('Reseñas cargadas:', data);
        }

        setReseñas(data || []);
        setError(null);
      } catch (err) {
        console.error('Error al cargar reseñas:', err);
        console.error('Detalles del error:', err.response?.data);
        const errorMsg = err.response?.data?.detail || 'No se pudieron cargar las reseñas. Intenta de nuevo más tarde.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    cargarReseñas();
  }, [providerId, newReview]);

  if (loading) {
    return (
      <div className="resenas-container" style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>{idProveedorProp ? 'Reseñas' : 'Reseñas Recibidas'}</h2>
        <p style={{ color: '#6b7280' }}>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resenas-container" style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>{idProveedorProp ? 'Reseñas' : 'Reseñas Recibidas'}</h2>
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#fee2e2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px',
          color: '#991b1b'
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="resenas-container" style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '16px' }}>{idProveedorProp ? 'Reseñas' : 'Reseñas Recibidas'}</h2>
      
      {reseñas.length === 0 ? (
        <div style={{ 
          padding: '32px', 
          textAlign: 'center', 
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', marginBottom: '8px' }}>
            {idProveedorProp ? 'Este profesional aún no tiene reseñas.' : 'Aún no has recibido ninguna reseña.'}
          </p>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Cuando los clientes completen servicios contigo, sus reseñas aparecerán aquí.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reseñas.map((review, index) => (
            <ResenaView
              key={review.reseña?.id_reseña || `review-${index}`}
              reseña={review.reseña}
              cliente={review.cliente}
              proveedor={review.proveedor}
              baseImageUrl={review.baseImageUrl || ''}
              showCliente={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Resenas;
