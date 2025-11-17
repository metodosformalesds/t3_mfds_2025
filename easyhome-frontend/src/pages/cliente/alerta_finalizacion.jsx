import React from "react";
import api from "../../config/api";
import "../../assets/styles/alerta_finalizacion.css";

export default function ServiceFinishedAlert({
  isOpen,
  alert,
  onClose,
  onReview,
}) {

  if (!isOpen || !alert) return null;

  const provider = alert.proveedor;
  const providerName = provider?.nombreCompleto || "Tu proveedor";
  const providerPhoto = provider?.fotoPerfil || "/images/default-worker.jpg";
  const providerRating = provider?.calificacionPromedio ?? "N/D";
  const providerReviews = provider?.totalResenas ?? 0;
  const alertMessage =
    alert.mensaje || `${providerName} ha finalizado un servicio contigo`;

  // Marca la alerta como leída
  const markAsRead = async () => {
    try {
      await api.put(`/api/v1/alertas/${alert.id_alerta}/marcar-leida`);
    } catch (error) {
      console.error("Error marcando alerta:", error);
    }
  };

  // Cerrar alerta
  const handleClose = async () => {
    await markAsRead();
    onClose();   // llama al callback que viene del padre
  };

  // Ir a reseña
  const handleReview = async () => {
    await markAsRead();
    onReview();  // callback que viene del padre
  };

  return (
    <div className="sf-alert-backdrop">
      <div className="sf-alert-container">

        <button className="sf-alert-close" onClick={handleClose}>
          ×
        </button>

        <h2 className="sf-alert-title">{alertMessage}</h2>

        <div className="sf-alert-provider-card">
          <img
            className="sf-alert-avatar"
            src={providerPhoto}
            alt="Foto del proveedor"
          />
          <div className="sf-alert-provider-info">
            <p className="sf-provider-name">{providerName}</p>
            <p className="sf-provider-badge">Miembro premium de Easyhome</p>
            <p className="sf-provider-rating">
              ☆ {providerRating} ({providerReviews})
            </p>
          </div>
        </div>

        <p className="sf-alert-help-text">Ayúdanos a mejorar tu experiencia</p>

        <button className="sf-alert-btn-review" onClick={handleReview}>
          Agregar reseña
        </button>

      </div>
    </div>
  );
}
