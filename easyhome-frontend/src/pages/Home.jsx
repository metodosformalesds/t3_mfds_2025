import { useState } from 'react'
import "../assets/styles/postulate.css"
import "../assets/styles/como_funciona.css"

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="home-container">
      {/* Sección: Cómo Funciona */}
      <section className="how-it-works-section">
        <h2 className="process-title">¿Cómo funciona Easy Home?</h2>
        
        <div className="process-steps">
          {/* Paso 1 */}
          <div className="step-card">
            <div className="step-number">1</div>
            <h3 className="step-heading">Busca el servicio</h3>
            <p className="step-description">
              Encuentra el profesional que necesites usando nuestra búsqueda o categorías.
            </p>
          </div>

          {/* Paso 2 */}
          <div className="step-card">
            <div className="step-number">2</div>
            <h3 className="step-heading">Compara y elige</h3>
            <p className="step-description">
              Revisa perfiles, precios y reseñas de otros clientes.
            </p>
          </div>

          {/* Paso 3 */}
          <div className="step-card">
            <div className="step-number">3</div>
            <h3 className="step-heading">Contrata</h3>
            <p className="step-description">
              Agenda tu servicio y recibe trabajo de calidad garantizada.
            </p>
          </div>
        </div>
      </section>
      {/* Sección: Call to Action - Postúlate */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">
            ¿Eres un profesional de servicios? Únete a Easy Home
          </h2>
          <p className="cta-description">
            Conectamos directamente a expertos locales como tú con clientes que 
            necesitan servicios de carpintería, fontanería, limpieza para sus 
            hogares y mucho más. Consigue más trabajo y haz crecer tu negocio.
          </p>
          <a href="#" className="cta-button">
            Postúlate aquí
          </a>
        </div>
      </section>
    </div>
  )
}

export default Home
