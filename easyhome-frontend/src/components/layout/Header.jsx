import '../../assets/styles/Header.css'
import { useAuth } from "react-oidc-context";

function Header() {
  const auth = useAuth();

  const handleLogin = () => {
    auth.signinRedirect();
  };

  const handleLogout = () => {
    const clientId = "478qnp7vk39jamq13sl8k4sp7t";
    const logoutUri = "http://localhost:5173";
    const cognitoDomain = "https://us-east-1gbsgbtrls.auth.us-east-1.amazoncognito.com";
    
    // Primero remover el usuario localmente
    auth.removeUser();
    
    // Luego redirigir al logout de Cognito para cerrar la sesión completamente
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  return (
    <header className="app-header">
      <nav className="navbar">
        <div className="nav-left">
          <a href="#" className="home-link">
            <span className="icon-hone">🏠</span>
            <span className="text-home">Home</span>
          </a>
        </div>
        <ul className="nav-right">
          <li><a href="#">Publicaciones</a></li>
          
          {auth.isAuthenticated ? (
            <>
              <li>
                <a href="#">
                  👤 Perfil
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                  Cerrar Sesión
                </a>
              </li>
            </>
          ) : (
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogin(); }}>
                Iniciar Sesión
              </a>
            </li>
          )}
          
          <li><a href="#">Suscripciones</a></li>
          <li><a href="#">Anúnciate</a></li>    
        </ul>
      </nav>
    </header>
  )
}

export default Header