import '../../assets/styles/HeroSection.css';

function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1>Conecta con los mejores proveedores locales</h1>
          <p>Encuentra profesionales confiables para el hogar en tu área</p>
          <button className="hero-button">Comenzar ahora</button>
        </div>
        <div className="hero-image-container">
          {/* Espacio reservado para la imagen */}
          <div className="hero-image-placeholder">
            {/* La imagen se agregará aquí */}
          </div>
        </div>
      </div>
      
      {/* Animación de onda */}
      <div className="wave-container">
        <svg className="wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </section>
  );
}

export default HeroSection;
