// src/components/Resenas/Resenas.jsx
import React, { useState, useEffect } from 'react';
import reviewsService from '../../services/resenas_perfil';

function Resenas({ idProveedor }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  
    }, [idProveedor]);

       

  return (
    <div className="reviews-container">
      <h2>Reseñas</h2>
      
    </div>
  );
}

export default Resenas;
