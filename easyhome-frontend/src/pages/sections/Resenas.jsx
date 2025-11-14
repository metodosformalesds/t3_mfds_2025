import React, { useState, useEffect } from 'react';
import reviewsService from '../../services/resenas_perfil';

function Resenas({ idProveedor }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //Cargar las reseñas del backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await reviewsService.getReviewsByProvider(idProveedor); //Llamada al servicio para las reseñas del proveedor
        setReviews(data || []);
      } catch (error) {
        console.error('Error al cargar reseñas:', error);
        setError('No se pudieron cargar las reseñas');
      } finally {
        setLoading(false);
      }
    };

    if (idProveedor) fetchReviews(); //Se ejecuta si existe un id de proveedor
  }, [idProveedor]);

  //Funcion para mostrar la fecha en formato legible
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
    });
  };

  // Mostrar estrellas según la calificación general
  const StarRating = ({ rating }) => {
    return (
      <div className="review-rating">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`review-star ${i < rating ? 'filled' : 'empty'}`}
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reviews-container">
        <div className="reviews-loading">Cargando reseñas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reviews-container">
        <div className="reviews-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <div className="reviews-wrapper">
        {/* Mostrar reseñas disponibles */}
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="review-user-info">
                <div className="review-avatar-container">
                  <img
                    src={review.usuario?.foto_perfil}
                    alt={`${review.usuario?.nombre || 'Usuario'} ${review.usuario?.apellido || ''}`}
                    className="review-avatar"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div className="review-verified-badge">
                    <svg 
                      className="review-verified-icon" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </div>
                </div>

                <div className="review-user-details">
                  <h3>
                    {review.usuario?.nombre || 'Usuario'} {review.usuario?.apellido || ''}
                  </h3>
                  <p className="review-date">
                    {review.id_cliente && `Cliente ID: ${review.id_cliente} | `}
                    Servicio terminado el {formatDate(review.servicio_contratado?.fecha_finalizacion || review.fecha_reseña)}
                  </p>
                </div>
              </div>

              <StarRating rating={review.calificacion_general || 0} /> {/* Mostrar las estrellas de calificación */}
            </div>

            <p className="review-comment">
              {review.comentario || 'Sin comentario'}
            </p>

            {review.imagen_reseña?.length > 0 && (
              <div 
                className={`review-images ${
                  review.imagen_reseña.length === 1 ? 'single-image' : 'multiple-images'
                }`}
              >
                {review.imagen_reseña.map((imagen, idx) => (
                  <img
                    key={idx}
                    src={imagen.url_imagen}
                    alt={`Imagen ${idx + 1} de la reseña`}
                    className="review-image"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="reviews-empty">
            No hay reseñas disponibles para el proveedor
          </div>
        )}
      </div>
    </div>
  );
}

export default Resenas;
