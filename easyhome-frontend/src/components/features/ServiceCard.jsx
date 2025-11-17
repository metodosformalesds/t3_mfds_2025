import React from 'react';
// Eliminamos: import { FaUserCircle } from 'react-icons/fa'; 
import '../../assets/styles/ServiceCard.css';
import { useNavigate } from 'react-router-dom';



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

  const navigate = useNavigate();

  const { 
    providerName, 
    providerPhoto,
    providerRating, 
    providerReviews, 
    isPremium, 
    date, 
    status, 
    canReview,
    clientRating
  } = service;

  // Determina la clase CSS para el estado del servicio
  const getStatusClasses = (status) => {
    switch (status) {
      case 'Finalizado':
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
    navigate(`/cliente/resena?id_servicio_contratado=${service.id}`);
  };

  // Obtener iniciales del nombre del proveedor
  const getInitials = (name) => {
    if (!name) return 'PR';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // DEBUG: Ver si clientRating llega correctamente
  console.log('🎯 ServiceCard - clientRating:', clientRating, 'para servicio:', service.id, 'status:', status);

  return (
    // Clase principal para el contenedor de la tarjeta
    <div className="service-card">
      
      {/* Sección Izquierda: Perfil y Datos del Proveedor de Servicio */}
      <div className="card-section provider-section">
        
        {/* Avatar con foto o iniciales */}
        <div className="provider-avatar">
          {providerPhoto ? (
            <img 
              src={providerPhoto} 
              alt={providerName}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="avatar-placeholder"
            style={{
              display: providerPhoto ? 'none' : 'flex',
              width: '100%',
              height: '100%',
              backgroundColor: '#3b82f6',
              color: 'white',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              borderRadius: '50%'
            }}
          >
            {getInitials(providerName)}
          </div>
        </div>

        {/* Info del Proveedor */}
        <div className="provider-info">
          <p className="provider-name">{providerName}</p>
          <p className="provider-details">
            {/* Clase para el distintivo premium */}
            {isPremium && <span className="premium-badge">Miembro premium de Easyhome</span>}
          </p>
          
          <div className="rating-info">
             {/* Solo mostrar calificación si existe (cliente o proveedor) */}
             {(clientRating != null && clientRating > 0) ? (
               <>
                 <StarIcon /> 
                 <span>{clientRating.toFixed(1)} (Tu calificación)</span>
               </>
             ) : (providerRating > 0) ? (
               <>
                 <StarIcon /> 
                 <span>{providerRating.toFixed(1)}</span>
                 {providerReviews > 0 && <span className="review-count">({providerReviews})</span>}
               </>
             ) : null}
          </div>
        </div>
      </div>

      {/* Sección Central: Fecha de Servicio - La visibilidad se maneja con @media en CSS */}
      <div className="card-section date-section">
        <p className="date-label">Fecha de Servicio</p>
        <p className="date-value">{date}</p>
      </div>

      {/* Sección Derecha: Estado + Botón dedicado de reseña */}
      <div className="card-section actions-section">
        <span className={`status-badge ${getStatusClasses(status)}`}>{status}</span>

        {status !== 'Finalizado' && (
          <span className="service-message-active">Servicio activo</span>
        )}

        {status === 'Finalizado' && (
          canReview ? (
            <button
              type="button"
              onClick={handleReviewClick}
              className="review-button"
            >
              Realizar reseña
            </button>
          ) : (
            <span className="review-message-sent">Reseña enviada</span>
          )
        )}
      </div>
    </div>
  );
};

export default ServiceCard;