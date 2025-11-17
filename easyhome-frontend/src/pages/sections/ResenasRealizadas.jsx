import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import ResenaView from '../../components/features/componente_reseña_realizada';
import reviewService from '../../services/reseñaservicio';

function ResenasRealizadas() {
  const location = useLocation();
  const auth = useAuth();
  const [reseñas, setReseñas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Capturar nueva reseña del state de navegación
  const newReview = location.state?.newReview || null;

  useEffect(() => {
    const cargarReseñas = async () => {
      // Si no hay usuario autenticado, no cargar nada
      if (!auth.isAuthenticated || !auth.user?.profile?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const userEmail = auth.user.profile.email;
        console.log('Cargando reseñas realizadas para:', userEmail);
        let data = await reviewService.getClienteReseñas(userEmail);
        console.log('Reseñas realizadas cargadas:', data);

        // Ordenar por fecha descendente (más recientes primero)
        const parseFecha = (r) => {
          const f = r?.reseña?.fecha_reseña;
          return f ? new Date(f).getTime() : 0;
        };
        data = Array.isArray(data)
          ? [...data].sort((a, b) => parseFecha(b) - parseFecha(a))
          : [];
        
        // Si hay una nueva reseña del state, agregarla al inicio del historial
        if (newReview) {
          // Verificar si la nueva reseña ya existe en el historial (evitar duplicados)
          const existeReseña = data.some(
            r => r.reseña?.id_reseña === newReview.reseña?.id_reseña
          );
          
          if (!existeReseña) {
            const combined = [newReview, ...data];
            setReseñas(combined.sort((a, b) => parseFecha(b) - parseFecha(a)));
          } else {
            setReseñas(data);
          }
        } else {
          setReseñas(data);
        }
        
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
  }, [auth.isAuthenticated, auth.user, newReview]);

  if (loading) {
    return (
      <div className="resenas-realizadas-container" style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Mis Reseñas Realizadas</h2>
        <p style={{ color: '#6b7280' }}>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="resenas-realizadas-container" style={{ padding: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Mis Reseñas Realizadas</h2>
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
    <div className="resenas-realizadas-container" style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '16px' }}>Mis Reseñas Realizadas</h2>
      
      {reseñas.length === 0 ? (
        <div style={{ 
          padding: '32px', 
          textAlign: 'center', 
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', marginBottom: '8px' }}>
            Aún no has realizado ninguna reseña.
          </p>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Cuando completes un servicio, podrás dejar tu opinión aquí.
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
              showCliente={false}
              commentVariant="client"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ResenasRealizadas;
