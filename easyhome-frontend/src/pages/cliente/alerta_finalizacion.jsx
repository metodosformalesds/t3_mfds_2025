import React from "react";
import "../../assets/styles/alerta_finalizacion.css";

export default function ServiceFinishedAlert({
  isOpen,
  alert,
  onClose,
  onReview,
}) {

  if (!isOpen || !alert) return null;

  const provider = alert.proveedor;

  return (
    <div className="sf-alert-backdrop">
      <div className="sf-alert-container">

        <button className="sf-alert-close" onClick={onClose}>
          ×
        </button>

        <h2 className="sf-alert-title">{alert.mensaje}</h2>

        <div className="sf-alert-provider-card">
          <img
            className="sf-alert-avatar"
            src={provider?.fotoPerfil}
            alt="Proveedor"
          />
          <div className="sf-alert-provider-info">
            <p className="sf-provider-name">{provider?.nombreCompleto}</p>
          </div>
        </div>

        <p className="sf-alert-help-text">
          Ayúdanos dejando una reseña
        </p>

        <button className="sf-alert-btn-review" onClick={onReview}>
          Agregar reseña
        </button>

      </div>
    </div>
  );
}
