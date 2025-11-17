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

              <a
                href={`mailto:${provider.correo}?subject=Contacto desde EasyHome&body=Hola, vi tu publicación en EasyHome por favor...`}
                className="e-btn mail-button"
              >
                📧 Enviar correo
              </a>

              <a
                href={`https://wa.me/${provider.telefono || ""}?text=${encodeURIComponent(
                  "Hola, vi tu publicación en EasyHome por favor..."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="e-btn whatsapp-button"
              >
                💬 WhatsApp
              </a>

            </div>

          </aside>
        </div>

        {/* SECCIONES */}
        <main className="perfil-main">

          {/* TABS */}
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

          {/* CONTENIDO */}
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
