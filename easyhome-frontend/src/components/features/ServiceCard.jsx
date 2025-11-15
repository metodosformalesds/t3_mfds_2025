import React from 'react';
import '../../assets/styles/ServiceCard.css';

const ServiceCard = ({ service }) => {
  const { 
    providerName, 
    providerRating, 
    providerReviews, 
    isPremium, 
    date, 
    status, 
    canReview 
  } = service;

  // Función de ayuda para determinar la clase de estatus
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Terminado':
        // Usa una clase para indicar si ya tiene reseña o aún puede reseñar
        return canReview ? 'status-finished-review-pending' : 'status-finished-reviewed'; 
      case 'En proceso':
        return 'status-in-progress';
      default:
        return 'status-default';
    }
  };

  const handleReviewClick = () => {
    console.log(`Abriendo modal de reseña para ${providerName}`);
  };

  return (
    // Clase principal para el contenedor de la tarjeta
    <div className="service-card">
      
      {/* Sección Izquierda: Perfil y Datos del Proveedor de Servicio */}
      <div className="card-section provider-section">
        
        {/* Avatar Placeholder */}
        {/*<FaUserCircle className="provider-avatar" />*/}

        {/* Info del Proveedor */}
        <div className="provider-info">
          <p className="provider-name">{providerName}</p>
          <p className="provider-details">
            {/* Clase para el distintivo premium */}
            {isPremium && <span className="premium-badge">Miembro premium de Easyhome</span>}
          </p>
          
          <div className="rating-info">
             {/*<FaStar className="star-icon"/>*/}
             <span>{providerRating}</span>
             <span className="review-count">({providerReviews})</span>
          </div>
        </div>
      </div>

      {/* Sección Central: Fecha de Servicio - Oculta en pantallas pequeñas con CSS */}
      <div className="card-section date-section">
        <p className="date-label">Fecha de Servicio</p>
        <p className="date-value">{date}</p>
      </div>

      {/* Sección Derecha: Estatus y Botón de Reseña */}
      <div className="card-section actions-section">
        
        {/* Estatus - Combina la clase base con la clase de estado (color) */}
        <span className={`status-badge ${getStatusClasses(status)}`}>
          {status}
        </span>

        {/* Botón/Mensaje de Reseña (Condicional) */}
        {status === 'Terminado' ? (
            canReview ? (
                <button 
                    onClick={handleReviewClick}
                    className="review-button-pending" // Clase para botón de reseña pendiente
                >
                    Deja tu reseña
                </button>
            ) : (
                <span className="review-message-sent">
                    Reseña enviada
                </span>
            )
        ) : (
            <span className="service-message-active">
                Servicio activo
            </span>
        )}

      </div>
    </div>
  );
};

export default ServiceCard;