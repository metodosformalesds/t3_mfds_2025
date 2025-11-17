import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../assets/styles/perfil_publico.css";
import AcercaDe from "../sections/AcercaDe";
import MisServicios from "../sections/MisServicios";
import Portafolio from "../sections/Portafolio";
import Resenas from "../sections/Resenas";
import AgreementAlert from "../cliente/alerta_contratacion";

function ProveedorPublicProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const provider = location.state?.provider;

  const [activeTab, setActiveTab] = useState("acercaDe");
  const [showAlert, setShowAlert] = useState(false);
  const [nextPath, setNextPath] = useState(null);

  if (!provider) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>No se encontró información del proveedor</h2>
        <button onClick={() => navigate("/cliente/feed")}>Volver al feed</button>
      </div>
    );
  }

  const pedirAlertaYSalir = (rutaDestino) => {
    setNextPath(rutaDestino);
    setShowAlert(true);
  };

  const handleAlertResult = () => {
    setShowAlert(false);
    navigate(nextPath);
  };

  return (
    <div className="public-profile-wrapper">
      <div className="perfil-container">

        {/* SIDEBAR */}
        <div className="sidebar-wrapper">
          <div className="sidebar-back-btn">
            <button onClick={() => pedirAlertaYSalir("/cliente/feed")}>
              ← Volver al feed
            </button>
          </div>

          <aside className="perfil-sidebar">

            {/* FOTO */}
            <div className="perfil-avatar-container">
              <div className="perfil-avatar">
                <img
                  src={
                    provider.fotoPerfil ||
                    provider.photoUrl ||
                    "/images/default-worker.jpg"
                  }
                  alt={provider.nombreCompleto}
                />
              </div>
            </div>

            {/* NOMBRE */}
            <h2 className="perfil-nombre">{provider.nombreCompleto}</h2>

            {/* BADGE */}
            <span className="perfil-badge">
              {provider.esPremium ? "Proveedor verificado" : "Proveedor"}
            </span>

            {/* ESTADÍSTICAS */}
            <div className="perfil-stats">
              <div className="stat-item">
                <span className="stat-value">{provider.servicios || 15}</span>
                <span className="stat-label">Servicios<br />Realizados</span>
              </div>

              <div className="stat-item">
                <span className="stat-value">{provider.satisfaccion || "90%"}</span>
                <span className="stat-label">Satisfacción</span>
              </div>

              <div className="stat-item">
                <span className="stat-value">{provider.anios || 7}</span>
                <span className="stat-label">Años</span>
              </div>
            </div>

            {/* BOTONES DE CONTACTO */}
            <div className="perfil-section contact-buttons-section">

              {/* EMAIL BUTTON */}
              <a
                href={`mailto:${provider.correo}?subject=Contacto desde EasyHome&body=Hola, vi tu publicación en EasyHome por favor...`}
                className="e-btn mail-button"
              >
                <span className="icon-svg-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="icon-svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.82 8.91A2.25 2.25 0 012.75 6.993V6.75" />
                  </svg>
                </span>
                Enviar correo
              </a>

              {/* WHATSAPP BUTTON */}
              <a
                href={`https://wa.me/${provider.telefono || ""}?text=${encodeURIComponent(
                  "Hola, vi tu publicación en EasyHome por favor..."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="e-btn whatsapp-button"
              >
                <span className="icon-svg-wrap">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="icon-svg">
                    <path fill="#fff" d="M16 .6C7.5.6.6 7.5.6 16c0 2.8.7 5.5 2.1 7.9L0 32l8.4-2.6c2.3 1.2 4.9 1.8 7.6 1.8 8.5 0 15.4-6.9 15.4-15.4S24.5.6 16 .6z"/>
                    <path fill="#25D366" d="M24.1 19.6c-.4-.2-2.3-1.1-2.6-1.2-.3-.1-.5-.2-.7.2-.2.4-.8 1.2-1 1.4-.2.2-.4.3-.8.1-.4-.2-1.7-.6-3.2-1.9-1.2-1-1.9-2.2-2.1-2.6-.2-.4 0-.6.2-.8.2-.2.4-.4.6-.6.2-.2.3-.4.5-.6.2-.2.3-.4.5-.6.2-.2.3-.4.3-.6 0-.2 0-.4-.1-.6-.2-.2-.7-1.7-.9-2.3-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 3s1.2 3.5 1.4 3.7c.2.2 2.4 3.7 5.7 5.2.8.3 1.4.6 1.9.7.8.2 1.4.2 1.9.1.6-.1 2.3-.9 2.6-1.7.3-.8.3-1.5.2-1.7-.1-.2-.4-.3-.8-.5z"/>
                  </svg>
                </span>
                WhatsApp
              </a>

            </div>

          </aside>
        </div>

        {/* SECCIONES */}
        <main className="perfil-main">
          <nav className="public-profile-tabs">
            <button className={activeTab === "acercaDe" ? "active" : ""} onClick={() => setActiveTab("acercaDe")}>Acerca de</button>
            <button className={activeTab === "servicios" ? "active" : ""} onClick={() => setActiveTab("servicios")}>Servicios</button>
            <button className={activeTab === "portafolio" ? "active" : ""} onClick={() => setActiveTab("portafolio")}>Portafolio</button>
            <button className={activeTab === "resenas" ? "active" : ""} onClick={() => setActiveTab("resenas")}>Reseñas</button>
          </nav>

          <div className="public-profile-content">
            {activeTab === "acercaDe" && (
              <AcercaDe
                idProveedor={provider.id}
                isPublicProfile={true}
                providerName={provider.nombreCompleto}
              />
            )}
            {activeTab === "servicios" && <MisServicios idProveedor={provider.id} publicView={true} />}
            {activeTab === "portafolio" && <Portafolio idProveedor={provider.id} />}
            {activeTab === "resenas" && <Resenas idProveedor={provider.id} />}
          </div>
        </main>

        <AgreementAlert
          isOpen={showAlert}
          provider={provider}
          onClose={() => setShowAlert(false)}
          onResult={handleAlertResult}
        />

      </div>
    </div>
  );
}

export default ProveedorPublicProfile;
