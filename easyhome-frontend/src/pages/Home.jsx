import { useState } from 'react'

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
      </div>
    </div>
  )
}

export default Home
