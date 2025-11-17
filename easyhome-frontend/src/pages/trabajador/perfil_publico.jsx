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

  // URLs de acción
  const whatsappUrl = provider.telefono
    ? `https://wa.me/${provider.telefono}`
    : null;

  const mailUrl = provider.correo
    ? `mailto:${provider.correo}`
    : null;

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

            <h2 className="perfil-nombre">{provider.nombreCompleto}</h2>

            <span className="perfil-badge">
              {provider.esPremium ? "Proveedor verificado" : "Proveedor"}
            </span>

            <div className="perfil-stats">
              <div className="stat-item">
                <span className="stat-value">{provider.servicios || 15}</span>
                <span className="stat-label">
                  Servicios
                  <br />
                  Contratados
                </span>
              </div>

              <div className="stat-item">
                <span className="stat-value">
                  {provider.satisfaccion || "90%"}
                </span>
                <span className="stat-label">Satisfacción</span>
              </div>

              <div className="stat-item">
                <span className="stat-value">{provider.anios || 7}</span>
                <span className="stat-label">Años</span>
              </div>
            </div>

            {/* INFORMACIÓN DE CONTACTO */}
            <div className="perfil-section">
              <h3>Información del contacto</h3>

              <div className="contact-info">
                {/* Correo */}
                <div className="contact-item">
                  <i className="icon">📧</i>
                  <span>{provider.correo || "correo@ejemplo.com"}</span>
                </div>

                {/* Teléfono -> SOLO ICONO, SIN NÚMERO */}
                {provider.telefono && (
                  <div className="contact-item">
                    <i className="icon">📱</i>
                  </div>
                )}
              </div>

              {/* BOTONES */}
              <div className="contact-buttons">
                {whatsappUrl && (
                  <button
                    className="btn-contact whatsapp"
                    onClick={() => window.open(whatsappUrl, "_blank")}
                  >
                    📲 WhatsApp
                  </button>
                )}

                {mailUrl && (
                  <button
                    className="btn-contact email"
                    onClick={() => window.location.href = mailUrl}
                  >
                    ✉️ Enviar correo
                  </button>
                )}
              </div>
            </div>

          </aside>
        </div>

        {/* MAIN */}
        <main className="perfil-main">
          <nav className="public-profile-tabs">
            <button
              className={activeTab === "acercaDe" ? "active" : ""}
              onClick={() => setActiveTab("acercaDe")}
            >
              Acerca de
            </button>

            <button
              className={activeTab === "servicios" ? "active" : ""}
              onClick={() => setActiveTab("servicios")}
            >
              Servicios
            </button>

            <button
              className={activeTab === "portafolio" ? "active" : ""}
              onClick={() => setActiveTab("portafolio")}
            >
              Portafolio
            </button>

            <button
              className={activeTab === "resenas" ? "active" : ""}
              onClick={() => setActiveTab("resenas")}
            >
              Reseñas
            </button>
          </nav>

          <div className="public-profile-content">
            {activeTab === "acercaDe" && (
              <AcercaDe
                idProveedor={provider.id}
                isPublicProfile={true}
                providerName={provider.nombreCompleto}
              />
            )}
            {activeTab === "servicios" && (
              <MisServicios idProveedor={provider.id} publicView={true} />
            )}
            {activeTab === "portafolio" && (
              <Portafolio idProveedor={provider.id} />
            )}
            {activeTab === "resenas" && (
              <Resenas idProveedor={provider.id} />
            )}
          </div>
        </main>

        {/* ALERTA */}
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
