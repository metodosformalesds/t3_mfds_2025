import { useState } from 'react'
import "../assets/styles/postulate.css";
import "../assets/styles/como_funciona.css";

function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="home-container">
      <div className="welcome-section">
        <h2>Bienvenido a EasyHome</h2>
        <p>Tu solución completa para la gestión de propiedades</p>
        
        <div className="counter-demo">
          <button onClick={() => setCount((count) => count + 1)}>
            Contador: {count}
          </button>
        </div>

        <div className="features">
          <h3>Características principales:</h3>
          <ul>
            <li>✅ Gestión de propiedades</li>
            <li>✅ Control de clientes</li>
            <li>✅ Seguimiento de transacciones</li>
            <li>✅ Reportes y análisis</li>
          </ul>
        </div>

        <section class="cta-section">
            <div class="cta-content">
                <h2 class="cta-title">¿Eres un profesional de servicios? Únete a Easy Home</h2>
                <p class="cta-description">
                    Conectamos directamente a expertos locales como tú con clientes que necesitan servicios de carpintería, fontanería, limpieza para sus hogares y mucho más. Consigue más trabajo y haz crecer tu negocio.
                </p>
                <a href="#" class="cta-button">Postulate aquí</a>
            </div>
        </section>
        <h2 class="process-title">¿Cómo funciona Easy Home?</h2>
        <div class="process-steps">

          <div class="step-card">
            <div class="step-number">1</div>
            <h3 class="step-heading">Busca el servicio</h3>
            <p class="step-description">
              Encuentra el profesional que necesites usando nuestra búsqueda o categorías.
            </p>
          </div>

          <div class="step-card">
            <div class="step-number">2</div>
            <h3 class="step-heading">Compara y elige</h3>
            <p class="step-description">
              Revisa perfiles, precios y reseñas de otros clientes.
            </p>
          </div>

          <div class="step-card">
            <div class="step-number">3</div>
            <h3 class="step-heading">Contrata</h3>
            <p class="step-description">
              Agenda tu servicio y recibe trabajo de calidad garantizada.
            </p>
          </div>

        </div>


      </div>
    </div>
  )
}

export default Home
