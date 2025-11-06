import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUserCapabilities } from "../hooks/useUserCapabilities";
import "../assets/styles/Perfil.css";
import "../assets/styles/sections/CambiarDatos.css";

// Componentes de las secciones
import CambiarDatos from './sections/CambiarDatos';
import ServiciosContratados from './sections/ServiciosContratados';
import ResenasRealizadas from './sections/ResenasRealizadas';
import AcercaDe from './sections/AcercaDe';
import MisServicios from './sections/MisServicios';
import Portafolio from './sections/Portafolio';
import Resenas from './sections/Resenas';
import Servicios from './sections/Servicios';

function Perfil() {
  const auth = useAuth();
  const { userData, loading, error, calculateAge, splitName } = useUserProfile();
  const { isWorker, isClient } = useUserCapabilities();
  
  // Por defecto, si es trabajador muestra "Acerca de", si no "Cambiar datos"
  const [activeTab, setActiveTab] = useState(isWorker ? 'acercaDe' : 'cambiarDatos');

  if (loading) {
    return (
      <div className="perfil-loading">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="perfil-error">
        <h2>Error al cargar el perfil</h2>
        <p>{error || 'No se pudo cargar la información del usuario'}</p>
        <p>Email del usuario: {auth.user?.profile?.email}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  const { nombres, apellidos } = splitName(userData.nombre);
  const edad = calculateAge(userData.fecha_nacimiento);
  
  // Determinar badge principal (prioridad a Trabajador si tiene ambos roles)
  const getBadge = () => {
    if (isWorker) return 'Proveedor verificado';
    if (isClient) return 'Cliente';
    return 'Usuario';
  };

  // Tabs de navegación
  const clientTabs = [
    { id: 'cambiarDatos', label: 'Cambiar datos' },
    { id: 'serviciosContratados', label: 'Servicios contratados' },
    { id: 'resenasRealizadas', label: 'Reseñas realizadas' }
  ];

  const workerTabs = [
    { id: 'acercaDe', label: 'Acerca de' },
    { id: 'misServicios', label: 'Mis servicios' },
    { id: 'portafolio', label: 'Portafolio' },
    { id: 'resenas', label: 'Reseñas' },
    { id: 'servicios', label: 'Servicios' }
  ];

  // Combinar tabs según el rol
  const tabs = isWorker ? [...clientTabs, ...workerTabs] : clientTabs;

  // Renderizar el contenido según la tab activa
  const renderContent = () => {
    switch (activeTab) {
      case 'cambiarDatos':
        return <CambiarDatos userData={userData} splitName={splitName} calculateAge={calculateAge} />;
      case 'serviciosContratados':
        return <ServiciosContratados />;
      case 'resenasRealizadas':
        return <ResenasRealizadas />;
      case 'acercaDe':
        return <AcercaDe userData={userData} />;
      case 'misServicios':
        return <MisServicios />;
      case 'portafolio':
        return <Portafolio />;
      case 'resenas':
        return <Resenas />;
      case 'servicios':
        return <Servicios />;
      default:
        return <CambiarDatos userData={userData} splitName={splitName} calculateAge={calculateAge} />;
    }
  };

  return (
    <div className="perfil-container">
      {/* Sidebar con info del usuario */}
      <aside className="perfil-sidebar">
        <div className="perfil-avatar">
          <img 
            src={auth.user?.profile?.picture || 'https://via.placeholder.com/120'} 
            alt={userData.nombre}
          />
        </div>
        
        <h2 className="perfil-nombre">{userData.nombre}</h2>
        
        <span className="perfil-badge">{getBadge()}</span>
        
        {/* Estadísticas (estáticas por ahora) */}
        <div className="perfil-stats">
          <div className="stat-item">
            <span className="stat-value">15</span>
            <span className="stat-label">Servicios<br/>Contratados</span>
          </div>
          {isWorker && (
            <>
              <div className="stat-item">
                <span className="stat-value">90%</span>
                <span className="stat-label">Satisfacción</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">7</span>
                <span className="stat-label">Años</span>
              </div>
            </>
          )}
        </div>

        {/* Información de contacto (si es trabajador) */}
        {isWorker && (
          <>
            <div className="perfil-section">
              <h3>Información del contacto</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <i className="icon">📧</i>
                  <span>{userData.correo_electronico}</span>
                </div>
                {userData.numero_telefono && (
                  <div className="contact-item">
                    <i className="icon">📱</i>
                    <span>{userData.numero_telefono}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="perfil-section">
              <h3>Información del plan</h3>
              <div className="plan-info">
                <div className="plan-item">
                  <i className="icon">💼</i>
                  <span>Plan Pro</span>
                </div>
                <div className="plan-item">
                  <i className="icon">📅</i>
                  <span>Renovación: 18 Dic 2025</span>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Contenido principal */}
      <main className="perfil-main">
        {/* Navegación por tabs */}
        <nav className="perfil-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Contenido dinámico */}
        <div className="perfil-content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default Perfil;
