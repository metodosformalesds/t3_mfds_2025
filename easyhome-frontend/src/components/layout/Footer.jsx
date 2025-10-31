import '../../assets/styles/Footer.css'

function Footer() {
  return (
    <footer className="app-footer">
      <div className="contenido-footer">
        <div className = "contacto">
          <h3>Contacto</h3>
              <ul>
                <li>(656) 983-1368</li>
                <li>easyhome@gmail.com</li>
                <li>Sobre nosotros</li>
              </ul>
        </div>

        <div className = "servicios">
          <h3>Servicios</h3>
              <ul>
                <li>Carpintería</li>
                <li>Electricidad</li>
                <li>Plomería</li>
                <li>Limpieza</li>
                <li>Pintura</li>
                <li>Construcción</li>
              </ul>
        </div>

        <div className="mi-cuenta">
            <h3>Mi cuenta</h3>
            <ul>
              <li>Registrarse</li>
              <li>Iniciar Sesión</li>
              <li>Ver planes</li>
            </ul>
        </div>
      </div>
      <div className="copyright">
        <p>© 2025 Easy Home. Todos los derechos reservados</p>
      </div>
    
    </footer>
  )
}

export default Footer
