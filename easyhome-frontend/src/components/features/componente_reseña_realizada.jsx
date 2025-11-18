/**
 * Autor: SEBASTIAN VALENCIA TERRAZAS
 * Componente: ResenaView
 * Descripción: Muestra un producto individual con imagen, precio y botón de agregar.
 */
import React from 'react';
import '../../assets/styles/ComponenteResena.css';

function ResenaView({ reseña, cliente, proveedor, baseImageUrl = '', showCliente = false, commentVariant = 'default' }) {
  // Determinar si mostrar info del cliente o del proveedor
  const persona = showCliente ? cliente : proveedor;
  const personaNombre = persona?.nombre || (showCliente ? 'Cliente' : 'Proveedor');
  const personaFoto = persona?.foto_perfil ? (persona.foto_perfil.startsWith('http') ? persona.foto_perfil : `${baseImageUrl}${persona.foto_perfil}`) : null;
  const servicio = proveedor?.servicio || 'Servicio';
  
  const comentario = reseña?.comentario || '';
  const califGeneral = reseña?.calificacion_general ?? null;
  const califPuntualidad = reseña?.calificacion_puntualidad ?? null;
  const califCalidad = reseña?.calificacion_calidad_servicio ?? null;
  const califPrecio = reseña?.calificacion_calidad_precio ?? null;
  const fecha = reseña?.fecha_reseña ? new Date(reseña.fecha_reseña).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  // Generar iniciales del nombre
  const getInitials = (name) => {
    if (!name) return 'US';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Renderizar estrellas
  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`resena-star ${i <= roundedRating ? '' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Obtener imágenes de la reseña (si existen)
  const imagenes = reseña?.imagenes || [];

  return (
    <div className="resena-card">
      <div className="resena-header">
        <div className="resena-avatar">
          {personaFoto ? (
            <img src={personaFoto} alt={personaNombre} />
          ) : (
            <div className="resena-avatar-initials">
              {getInitials(personaNombre)}
            </div>
          )}
          <div className="resena-badge">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        <div className="resena-info">
          <div className="resena-user-row">
            <h3 className="resena-nombre">{personaNombre}</h3>
            <div className="resena-rating">
              {renderStars(califGeneral)}
            </div>
          </div>
          <p className="resena-fecha">
            <span className="resena-fecha-label">Servicio terminado el</span> {fecha || 'Fecha no disponible'}
          </p>
        </div>
      </div>

      <div className="resena-content">
        {/* Calificaciones detalladas */}
        <div className="resena-calificaciones-detalle">
          <div className="resena-calificacion-item">
            <span className="resena-calificacion-label">Calidad-Precio</span>
            <div className="resena-calificacion-stars">
              {renderStars(califPrecio)}
            </div>
          </div>
          <div className="resena-calificacion-item">
            <span className="resena-calificacion-label">Puntualidad</span>
            <div className="resena-calificacion-stars">
              {renderStars(califPuntualidad)}
            </div>
          </div>
          <div className="resena-calificacion-item">
            <span className="resena-calificacion-label">Calidad de Servicio</span>
            <div className="resena-calificacion-stars">
              {renderStars(califCalidad)}
            </div>
          </div>
        </div>

        <p className={`resena-comentario ${commentVariant === 'client' ? 'resena-comentario-client' : ''}`}>
          {comentario || 'Sin comentario'}
        </p>

        {imagenes && imagenes.length > 0 && (
          <div className="resena-imagenes">
            {imagenes.map((imagen, index) => (
              <div key={index} className="resena-imagen-container">
                <img 
                  src={imagen.startsWith('http') ? imagen : `${baseImageUrl}${imagen}`}
                  alt={`Trabajo ${index + 1}`}
                  className="resena-imagen"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResenaView;
