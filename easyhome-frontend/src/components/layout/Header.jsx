import '../../assets/styles/Header.css'

function Header() {
  return (
    <header className="app-header">
      <nav class="navbar">
        <div class="nav-left">
          <a href="#" class="home-link">
            <span class="icon-hone">🏠</span><span class="text-home">Home</span>
          </a>
        </div>
        <ul class="nav-right">
          <li><a href="#">Publicaciones</a></li>
          <li><a href="#">Iniciar Sesión</a></li>
          <li><a href="#">Suscripciones</a></li>
          <li><a href="#">Anúnciate</a></li>    
        </ul>

      </nav>
      
    </header>
  )
}

export default Header
