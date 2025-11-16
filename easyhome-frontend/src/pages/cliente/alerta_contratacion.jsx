import React from "react";
import "../../assets/styles/alerta_contratacion.css";

export default function AgreementAlert({ isOpen, provider, onClose, onResult }) {
  if (!isOpen || !provider) return null;

  return (
    <div className="agreement-alert-backdrop">
      <div className="agreement-alert-container">

        <button className="agreement-alert-close" onClick={onClose}>
          ×
        </button>

        <h2 className="agreement-alert-title">Notamos que visitaste este perfil.</h2>
        <h3 className="agreement-alert-subtitle-main">¿Lograste un acuerdo?</h3>

        <div className="agreement-alert-provider-card">
          <img
            className="agreement-alert-avatar"
            src={provider.fotoPerfil || "/images/default-worker.jpg"}
          />
          <div>
            <p className="provider-name">{provider.nombreCompleto}</p>
            <p className="provider-rating">
              ★ {provider.calificacionPromedio} ({provider.totalResenas})
            </p>
          </div>
        </div>

        <p className="agreement-alert-help-text">Ayúdanos a mejorar tu experiencia</p>

        <div className="agreement-alert-actions">
          <button
            className="agreement-alert-btn agreement-alert-btn-success"
            onClick={() => onResult(true)}
          >
            ✓ Sí logré
          </button>
          <button
            className="agreement-alert-btn agreement-alert-btn-danger"
            onClick={() => onResult(false)}
          >
            ✕ No logré
          </button>
        </div>
      </div>
    </div>
  );
}
