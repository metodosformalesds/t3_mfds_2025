import PropTypes from 'prop-types';

function AcercaDe({ userData }) {
  return (
    <div className="acerca-de-container">
      <h2>Acerca de mí</h2>
      
      <div className="acerca-content">
        <section className="bio-section">
          <h3>Descripción Profesional</h3>
          <p className="placeholder-text">
            Profesional con más de X años de experiencia en instalaciones residenciales y comerciales. 
            Me especializo en soluciones eléctricas eficientes y seguras, garantizando el cumplimiento 
            de todas las normas de seguridad...
          </p>
          <button className="btn-edit">✏️ Editar</button>
        </section>

        <section className="especialidades-section">
          <h3>Especialidades</h3>
          <div className="tags">
            <span className="tag">⚡ Electricidad</span>
            <span className="tag">🔧 Construcción</span>
          </div>
          <button className="btn-edit">✏️ Editar</button>
        </section>
      </div>

      <div className="placeholder">
        <i>🚧 Funcionalidad completa en desarrollo...</i>
      </div>
    </div>
  );
}

AcercaDe.propTypes = {
  userData: PropTypes.object.isRequired
};

export default AcercaDe;
