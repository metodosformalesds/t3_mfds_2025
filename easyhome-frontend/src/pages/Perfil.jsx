import { useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { useAuth } from "react-oidc-context";
import { useUserProfile } from "../hooks/useUserProfile";
import { useUserCapabilities } from "../hooks/useUserCapabilities";
import { useClientServices } from "../hooks/useClientServices";
import { useProviderServices } from "../hooks/useProviderServices";
import reviewService from "../services/reseñaservicio";
import "../assets/styles/Perfil.css";
import "../assets/styles/sections/CambiarDatos.css";
import "../assets/styles/sections/AcercaDe.css";
import "../assets/styles/sections/MisServicios.css";
import "../assets/styles/sections/Portafolio.css";

// Componentes de las secciones
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
  
  // Por defecto, si es trabajador muestra "Acerca de", si no "Cambiar datos"
  const [activeTab, setActiveTab] = useState(isWorker ? 'acercaDe' : 'cambiarDatos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Estados para estadísticas dinámicas
  const [avgRating, setAvgRating] = useState(null);
  
  // Hooks para servicios (solo se activan si el usuario tiene el rol correspondiente)
  const { services: clientServices } = useClientServices(userData?.id_usuario);
  const { finishedServices } = useProviderServices(userData?.id_proveedor);

  // Cargar foto de perfil cuando el usuario esté disponible
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
  
  // Cargar reseñas del proveedor y calcular promedio de calificación general
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!isWorker || !userData?.id_proveedor) return;
      try {
        const data = await reviewService.getProveedorReseñas(userData.id_proveedor);
        const ratings = (Array.isArray(data) ? data : [])
          .map((r) => Number(r?.reseña?.calificacion_general))
          .filter((n) => Number.isFinite(n));
        if (!mounted) return;
        if (ratings.length) {
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          setAvgRating(avg);
        } else {
          setAvgRating(null);
        }
      } catch (_) {
        if (mounted) setAvgRating(null);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [isWorker, userData?.id_proveedor]);

  // Permitir activar una pestaña específica cuando se navega con state
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

  const handleSavePhoto = async (file) => {
    setUploadingPhoto(true);
    
    try {
      const result = await uploadProfilePhoto(file);
      
      if (result.success) {
        setProfilePhoto(result.url);
        return result;
      } else {
        console.error('Error al subir foto:', result.error);
        return result;
      }
    } catch (error) {
      console.error('Error inesperado al subir foto:', error);
      return { success: false, error: 'Error inesperado al subir la foto' };
    } finally {
      setUploadingPhoto(false);
    }
  };

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
        return <AcercaDe idProveedor={userData.id_proveedor} />;
      case 'misServicios':
        return <MisServicios idProveedor={userData.id_proveedor} />;
      case 'portafolio':
        return <Portafolio idProveedor={userData.id_proveedor} />;
      case 'resenas':
        return <Resenas />;
      case 'servicios':
        return <Servicios idProveedor={userData.id_proveedor} />;
      default:
        return <CambiarDatos userData={userData} splitName={splitName} calculateAge={calculateAge} />;
    }
  };

  return (
    <div className="perfil-container">
      {/* Sidebar con info del usuario */}
      <aside className="perfil-sidebar">
        <div className="perfil-avatar-container">
          <div className="perfil-avatar">
            <img 
              src={profilePhoto || auth.user?.profile?.picture || 'https://via.placeholder.com/120'} 
              alt={userData.nombre}
            />
          </div>
          <button 
            className="edit-photo-btn"
            onClick={() => setIsModalOpen(true)}
            title="Editar foto de perfil"
          >
            ✏️
          </button>
        </div>
        
        <h2 className="perfil-nombre">{userData.nombre}</h2>
        
        <span className="perfil-badge">{getBadge()}</span>
        
        {/* Estadísticas dinámicas */}
        <div className="perfil-stats">
          {isClient && (
            <div className="stat-item">
              <span className="stat-value">{Array.isArray(clientServices) ? clientServices.length : 0}</span>
              <span className="stat-label">Servicios<br/>Contratados</span>
            </div>
          )}
          {isWorker && (
            <>
              <div className="stat-item">
                <span className="stat-value">{Array.isArray(finishedServices) ? finishedServices.length : 0}</span>
                <span className="stat-label">Servicios<br/>finalizados</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{avgRating != null ? `${Math.round((avgRating / 5) * 100)}%` : "--%"}</span>
                <span className="stat-label">Satisfacción</span>
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

      {/* Modal para editar foto */}
      <EditarFotoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPhoto={profilePhoto || auth.user?.profile?.picture || 'https://via.placeholder.com/120'}
        onSave={handleSavePhoto}
      />
    </div>
  );
}

export default Perfil;
