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
    } catch (err) {
      console.error("Error marcando alerta como leída:", err);
    }
  };

  return (
    <div className="sf-alert-backdrop">
      <div className="sf-alert-container">

        <button className="sf-alert-close" onClick={async () => { 
          await markAsRead(); 
          onClose(); 
        }}>
          ×
        </button>

        <h2 className="sf-alert-title">{alert.mensaje}</h2>

        <div className="sf-alert-provider-card">
          <img className="sf-alert-avatar"
            src={provider?.fotoPerfil}
            alt="Proveedor"
          />
          <div className="sf-alert-provider-info">
            <p className="sf-provider-name">{provider?.nombreCompleto}</p>
          </div>
        </div>

        <button className="sf-alert-btn-review" onClick={async () => {
          await markAsRead();
          onReview();
        }}>
          Agregar reseña
        </button>

      </div>
    </div>
  );
}
