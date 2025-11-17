import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useAuth } from "react-oidc-context";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUserCapabilities } from "../hooks/useUserCapabilities";
import "../assets/styles/Perfil.css";
import "../assets/styles/sections/CambiarDatos.css";
import "../assets/styles/sections/AcercaDe.css";
import "../assets/styles/sections/MisServicios.css";
import "../assets/styles/sections/Portafolio.css";
 
// Componentes internos
import CambiarDatos from './sections/CambiarDatos';
import ServiciosContratados from './sections/ServiciosContratados';
import ResenasRealizadas from './sections/ResenasRealizadas';
import AcercaDe from './sections/AcercaDe';
import MisServicios from './sections/MisServicios';
import Portafolio from './sections/Portafolio';
import Resenas from './sections/Resenas';
import Servicios from './sections/Servicios';
import EditarFotoModal from '../components/common/EditarFotoModal';
 
function Perfil() {
  const auth = useAuth();
  const location = useLocation();
 
  // Logout
  const handleLogout = () => {
    const clientId = "478qnp7vk39jamq13sl8k4sp7t";
    const logoutUri = "http://localhost:5173";
    const cognitoDomain = "https://us-east-1gbsgbtrls.auth.us-east-1.amazoncognito.com";
    auth.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };
 
  const { 
    userData, 
    loading, 
    error, 
    calculateAge, 
    splitName,
    uploadProfilePhoto,
    getProfilePhotoUrl 
  } = useUserProfile();
 
  const { isWorker, isClient } = useUserCapabilities();
 
  const [activeTab, setActiveTab] = useState(isWorker ? 'acercaDe' : 'cambiarDatos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
 
  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (userData?.id_usuario) {
        const result = await getProfilePhotoUrl();
        if (result.success) {
          setProfilePhoto(result.url);
        }
      }
    };
    loadProfilePhoto();
  }, [userData?.id_usuario]);
 
  useEffect(() => {
    if (location.state?.goToTab) {
      setActiveTab(location.state.goToTab);
    }
  }, [location.state?.goToTab]);
 
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
 
  const getBadge = () => {
    if (isWorker) return 'Proveedor verificado';
    if (isClient) return 'Cliente';
    return 'Usuario';
  };
 
  const clientTabs = [
    { id: "cambiarDatos", label: "Cambiar datos" },
    { id: "serviciosContratados", label: "Servicios contratados" },
    { id: "resenasRealizadas", label: "Reseñas realizadas" }
  ];
 
  const workerTabs = [
    { id: "acercaDe", label: "Acerca de" },
    { id: "misServicios", label: "Mis servicios" },
    { id: "portafolio", label: "Portafolio" },
    { id: "resenas", label: "Reseñas" },
    { id: "servicios", label: "Servicios" }
  ];
 
  const tabs = isWorker ? [...clientTabs, ...workerTabs] : clientTabs;
 
  const handleSavePhoto = async (file) => {
    setUploadingPhoto(true);
    try {
      const result = await uploadProfilePhoto(file);
      if (result.success) {
        setProfilePhoto(result.url);
      }
      return result;
    } finally {
      setUploadingPhoto(false);
    }
  };
 
  const renderContent = () => {
    switch (activeTab) {
      case "cambiarDatos": return <CambiarDatos userData={userData} splitName={splitName} calculateAge={calculateAge} />;
      case "serviciosContratados": return <ServiciosContratados />;
      case "resenasRealizadas": return <ResenasRealizadas />;
      case "acercaDe": return <AcercaDe idProveedor={userData.id_proveedor} />;
      case "misServicios": return <MisServicios idProveedor={userData.id_proveedor} />;
      case "portafolio": return <Portafolio idProveedor={userData.id_proveedor} />;
      case "resenas": return <Resenas />;
      case "servicios": return <Servicios idProveedor={userData.id_proveedor} />;
      default: return <CambiarDatos userData={userData} splitName={splitName} calculateAge={calculateAge} />;
    }
  };
 
  return (
<div className="perfil-container">
      {/* SIDEBAR */}
<aside className="perfil-sidebar">
<div className="perfil-avatar-container">
<div className="perfil-avatar">
<img 
              src={profilePhoto || auth.user?.profile?.picture || "https://via.placeholder.com/120"} 
              alt={userData.nombre}
            />
</div>
 
          {auth.user?.profile?.email === userData.correo_electronico && (
<button className="edit-photo-btn" onClick={() => setIsModalOpen(true)}>
              ✏️
</button>
          )}
</div>
<h2 className="perfil-nombre">{userData.nombre}</h2>
<span className="perfil-badge">{getBadge()}</span>
 
        {/* CONTACTO */}
<div className="perfil-section">
<h3>Información del contacto</h3>
 
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
 
        {/* PLAN */}
<div className="perfil-section">
<h3>Información del plan</h3>
 
          <div className="plan-info">
<div className="plan-item">
<i className="icon">💼</i>
<span>Plan Básico</span>
</div>
<div className="plan-item">
<i className="icon">📅</i>
<span>Renovación no disponible</span>
</div>
</div>
</div>
 
        {/* LOGOUT */}
<div className="perfil-section">
<button 
            className="logout-btn" 
            onClick={handleLogout}
            style={{
              marginTop: '2rem',
              width: '100%',
              padding: '0.75rem',
              background: '#e74c3c',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
>
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.5rem'}}>
<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
<polyline points="16 17 21 12 16 7"></polyline>
<line x1="21" y1="12" x2="9" y2="12"></line>
</svg>
            Cerrar Sesión
</button>
</div>
</aside>
 
      {/* MAIN */}
<main className="perfil-main">
<nav className="perfil-tabs">
          {tabs.map(tab => (
<button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
>
              {tab.label}
</button>
          ))}
</nav>
 
        <div className="perfil-content">
          {renderContent()}
</div>
</main>
 
      {/* MODAL */}
<EditarFotoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPhoto={profilePhoto || auth.user?.profile?.picture || "https://via.placeholder.com/120"}
        onSave={handleSavePhoto}
      />
</div>
  );
}
 
export default Perfil;