import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../assets/styles/perfil_publico.css";
import AcercaDe from "../sections/AcercaDe";
import MisServicios from "../sections/MisServicios";
import Portafolio from "../sections/Portafolio";
import Resenas from "../sections/Resenas";
import AgreementAlert from "../cliente/alerta_contratacion";
import ReportForm from "../trabajador/reporte";
// AgreementAlert will perform the API call; no direct api import needed here

function ProveedorPublicProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const provider = location.state?.provider;

  const [activeTab, setActiveTab] = useState("acercaDe");
  const [showAlert, setShowAlert] = useState(false);
  const [nextPath, setNextPath] = useState(null);
  //Estado para modal de reporte
  const [showReportForm, setShowReportForm] = useState(false);
  

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
    if (nextPath === -1) {
      navigate(-1);
    } else if (nextPath) {
      navigate(nextPath);
    }
  };

  // ----------------------
  // MENSAJES PERSONALIZADOS
  // ----------------------

  const mensajeWhatsApp = encodeURIComponent(
    `Hola ${provider.nombreCompleto}, vi tu perfil en EasyHome y me interesa tu servicio. ¿Podemos hablar?`
  );

  const whatsappUrl = provider.telefono
    ? `https://wa.me/${provider.telefono}?text=${mensajeWhatsApp}`
    : null;

  const subject = encodeURIComponent("Interesado en su servicio - EasyHome");
  const body = encodeURIComponent(
    `Hola ${provider.nombreCompleto},\n\nVi su perfil en EasyHome y estoy interesado en su servicio.\n¿Podemos hablar?\n\nGracias.`
  );

  const mailUrl = provider.correo
    ? `mailto:${provider.correo}?subject=${subject}&body=${body}`
    : null;
  // Interceptar SALIDA por cualquier navegación dentro de la app (links, header, etc.)
  useEffect(() => {
    // Intercepta clics en enlaces <a> de la misma SPA
    const onDocumentClick = (e) => {
      if (showAlert) return; // no interceptar si ya estamos mostrando la alerta
      const anchor = e.target.closest && e.target.closest('a');
      if (!anchor) return;

      // Ignorar enlaces que abren en nueva pestaña o anchors locales
      if (anchor.target === '_blank' || anchor.getAttribute('download')) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      // Determinar si es navegación interna
      try {
        const url = new URL(anchor.href);
        const isSameOrigin = url.origin === window.location.origin;
        if (isSameOrigin) {
          // Si estamos en esta página de perfil, bloqueamos y pedimos confirmación
          e.preventDefault();
          setNextPath(url.pathname + url.search + url.hash);
          setShowAlert(true);
        }
      } catch (_) {
        // Si no es una URL válida, lo ignoramos
      }
    };

    // Intercepta navegación del botón atrás/adelante del navegador
    const onPopState = (e) => {
      if (showAlert) return;
      // Cancelar navegación y mostrar alerta
      e.preventDefault?.();
      // Empujar nuevamente el estado actual para mantenernos en la vista hasta responder
      window.history.pushState(null, '', location.pathname + location.search + location.hash);
      setNextPath(-1);
      setShowAlert(true);
    };

    document.addEventListener('click', onDocumentClick, true);
    window.addEventListener('popstate', onPopState);

    // Interceptar cierre/recarga de pestaña con confirmación nativa
    const onBeforeUnload = (e) => {
      if (showAlert) return;
      e.preventDefault();
      e.returnValue = '';
      // Al cancelar la salida, mostraremos la alerta para registrar el resultado
      setNextPath(null);
      setShowAlert(true);
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('click', onDocumentClick, true);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [location.pathname, location.search, location.hash, showAlert]);

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

            {/* STATS */}
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

            {/* SOLO LOS BOTONES */}
            <div className="perfil-section">
              <h3>Contacto</h3>

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

            <div className="perfil-section">
              <button
                onClick={() => setShowReportForm(true)}
                className="report-button"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#ff4757",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "0.95rem",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#ff3838")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#ff4757")}
              >
                ⚠️ Reportar
              </button>
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

        {/*Formulario de reporte */}
        <ReportForm
          isOpen={showReportForm}
          provider={provider}
          onClose={() => setShowReportForm(false)}
          onSuccess={() => alert("Reporte enviado exitosamente")}
        />
        
      </div>
    </div>
  );
}

export default ProveedorPublicProfile;
