import React, { useState, useEffect } from 'react';
import reviewsService from '../../services/resenas_perfil';

function Resenas({ idProveedor }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await reviewsService.getReviewsByProvider(idProveedor);
        setReviews(data || []);
      } catch (error) {
        console.error('Error al cargar reseñas:', error);
        setError('No se pudieron cargar las reseñas');
      } finally {
        setLoading(false);
      }
    };

    if (idProveedor) fetchReviews();
  }, [idProveedor]);

  if (loading) return <div>Cargando reseñas...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="reviews-container">
      <h2>Reseñas</h2>
    </div>
  );
}

export default Resenas;
