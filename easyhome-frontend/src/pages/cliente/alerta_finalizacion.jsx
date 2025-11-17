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

  const markAsRead = async () => {
    try {
      await api.put(`/api/v1/alertas/${alert.id_alerta}/marcar-leida`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = async () => {
    await markAsRead();
    onClose();
  };

  const handleReview = async () => {
    await markAsRead();
    onReview();
  };

  return (
    <div className="sf-alert-backdrop">
      <div className="sf-alert-container">

        <button className="sf-alert-close" onClick={handleClose}>×</button>

        <h2 className="sf-alert-title">{alert.mensaje}</h2>

        <div className="sf-alert-provider-card">
          <img className="sf-alert-avatar" src={provider?.fotoPerfil} />
          <p className="sf-provider-name">{provider?.nombreCompleto}</p>
        </div>

        <button className="sf-alert-btn-review" onClick={handleReview}>
          Agregar reseña
        </button>

      </div>
    </div>
  );
}
