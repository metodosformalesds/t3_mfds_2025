import { useState } from 'react'
import "../assets/styles/postulate.css";

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

      </div>
    </div>
  )
}

export default Home
