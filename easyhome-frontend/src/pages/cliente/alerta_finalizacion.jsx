import React from "react";
import "../../assets/styles/alerta_finalizacion.css";

export default function ServiceFinishedAlert({ isOpen, alert }) {

  if (!isOpen || !alert) return null;

  return (
    <div className="sf-alert-backdrop">
      <div className="sf-alert-container">
        <h2 className="sf-alert-title">{alert.mensaje}</h2>
      </div>
    </div>
  );
}
