import React from 'react';
// Eliminamos: import { FaUserCircle } from 'react-icons/fa'; 
import '../../assets/styles/ServiceCard.css';

// Componente para renderizar el icono de la estrella
const StarIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    // Mantenemos stroke y strokeWidth para el contorno
    fill="none" 
    stroke="black" 
    strokeWidth="1.5" // Reducido para un borde más fino y estético
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="star-icon"
    {...props} 
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    {/* Ajustado el path: fill="white" para que el interior sea blanco */}
    <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" fill="white" />
  </svg>
);


const ServiceCard = ({ service, onReview }) => {
  const { 
    providerName, 
    providerRating, 
    providerReviews, 
    isPremium, 
    date, 
    status, 
    canReview 
  } = service;

  /**
   * Determina la clase CSS específica para el color de fondo del estatus.
   * La clase base 'status-badge' se aplica en el render.
   */
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Terminado':
        // Usa una clase para indicar si aún puede reseñar o si ya la envió
        return canReview ? 'status-finished-review-pending' : 'status-finished-reviewed'; 
      case 'En proceso':
        return 'status-in-progress';
      default:
        return 'status-default';
    }
  };

  const handleReviewClick = () => {
    if (typeof onReview === 'function') {
      onReview(service.id);
      return;
    }
    console.log(`Abriendo modal de reseña para ${providerName}`);
  };

  return (
    // Clase principal para el contenedor de la tarjeta
    <div className="service-card">
      
      {/* Sección Izquierda: Perfil y Datos del Proveedor de Servicio */}
      <div className="card-section provider-section">
        
        {/* Avatar Placeholder: Reemplazado FaUserCircle por un div simple que usa los estilos de provider-avatar */}
        <div className="provider-avatar">
            {/* Si tienes una URL de imagen, iría aquí: <img src="..." alt="Avatar" /> */}
        </div>

        {/* Info del Proveedor */}
        <div className="provider-info">
          <p className="provider-name">{providerName}</p>
          <p className="provider-details">
            {/* Clase para el distintivo premium */}
            {isPremium && <span className="premium-badge">Miembro premium de Easyhome</span>}
          </p>
          
          <div className="rating-info">
             {/* Integración del componente SVG de la Estrella */}
             <StarIcon /> 
             <span>{providerRating}</span>
             <span className="review-count">({providerReviews})</span>
          </div>
        </div>
      </div>

      {/* Sección Central: Fecha de Servicio - La visibilidad se maneja con @media en CSS */}
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