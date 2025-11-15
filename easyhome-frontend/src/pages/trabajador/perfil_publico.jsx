import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../assets/styles/perfil_publico.css";

import AcercaDe from "../sections/AcercaDe";
import MisServicios from "../sections/MisServicios";
import Portafolio from "../sections/Portafolio";
import Resenas from "../sections/Resenas";

function ProveedorPublicProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const provider = location.state?.provider;

  const [activeTab, setActiveTab] = useState("acercaDe");

  if (!provider) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>No se encontró información del proveedor</h2>
        <button onClick={() => navigate("/cliente/feed")}>Volver al feed</button>
      </div>
    );
  }

  return (
    <div className="perfil-container">

      {/* ---------- SIDEBAR ---------- */}
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
            <span className="stat-label">Servicios<br />Contratados</span>
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

        <div className="perfil-section">
          <h3>Información del contacto</h3>
          <div className="contact-info">
            <div className="contact-item">
              <i className="icon">📧</i>
              <span>{provider.correo || "correo@ejemplo.com"}</span>
            </div>

            {provider.telefono && (
              <div className="contact-item">
                <i className="icon">📱</i>
                <span>{provider.telefono}</span>
              </div>
            )}
          </div>
        </div>

        <div className="perfil-section">
          <h3>Información del plan</h3>
          <div className="plan-info">
            <div className="plan-item">
              <i className="icon">💼</i>
              <span>{provider.esPremium ? "Plan Pro" : "Plan Básico"}</span>
            </div>

            <div className="plan-item">
              <i className="icon">📅</i>
              <span>Renovación no disponible</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Secciones*/}
      <main className="perfil-main">

        {/* Tabs */}
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

        {/* Contenido dinámico */}
        <div className="public-profile-content">
          {activeTab === "acercaDe" && (
            <AcercaDe
              idProveedor={provider.id}
              isPublicProfile={true}
              providerName={provider.nombreCompleto}
            />
          )}
          {activeTab === "servicios" && <MisServicios idProveedor={provider.id} />}
          {activeTab === "portafolio" && <Portafolio idProveedor={provider.id} />}
          {activeTab === "resenas" && <Resenas idProveedor={provider.id} />}
        </div>
      </main>
    </div>
  );
}

export default ProveedorPublicProfile;
