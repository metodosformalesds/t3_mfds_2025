import React from 'react';
import '../../assets/styles/sections/aboutme.css';

function AboutMe({ profileData }) {
  // Si no ha llegado nada aún
  if (!profileData) {
    return (
      <div className="about-me-container" style={{ textAlign: 'left' }}>
        <p className="about-me-summary">Cargando información...</p>
      </div>
    );
  }

  const summary = profileData.summary || 'Información no disponible.';
  const specialties = Array.isArray(profileData.specialties)
    ? profileData.specialties
    : [];

  return (
    <div className="about-me-container" style={{ textAlign: 'left' }}>
      {/* TÍTULO */}
      <h2 className="about-me-title">Acerca de mí</h2>

      {/* BIOGRAFÍA */}
      <p className="about-me-summary">{summary}</p>

      {/* ESPECIALIDADES */}
      <h3 className="specialties-title">Especialidades</h3>

      <div className="specialties-container">
        {specialties.length > 0 ? (
          specialties.map((specialty, index) => (
            <span key={index} className="specialty-badge">
              {specialty}
            </span>
          ))
        ) : (
          <span className="about-me-summary">
            Sin especialidades registradas.
          </span>
        )}
      </div>
    </div>
  );
}

export default AboutMe;
