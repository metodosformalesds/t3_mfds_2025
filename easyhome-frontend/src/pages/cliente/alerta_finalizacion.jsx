import React from "react";
import "../../assets/styles/service_finished_alert.css";
import { FaStar } from "react-icons/fa";

  return (
    <div className="sf-alert-backdrop">
      <div className="sf-alert-container">

        {/*Boton para cerrar */}
        <button className="sf-alert-close" onClick={onClose}>×</button>

        <h2 className="sf-alert-title">
          {provider.nombreCompleto} ha finalizado un servicio contigo
        </h2>

        {/* Tarjeta del proveedor */}
        <div className="sf-alert-provider-card">
          <img
            className="sf-alert-avatar"
            src={provider.fotoPerfil || "/images/default-worker.jpg"}
            alt="Foto del proveedor"
          />

          <div className="sf-alert-provider-info">
            <p className="sf-provider-name">{provider.nombreCompleto}</p>
            <p className="sf-provider-badge">Miembro premium de Easyhome</p>
            <p className="sf-provider-rating">
              <FaStar className="sf-star-icon" />{" "}
              {provider.calificacionPromedio} ({provider.totalResenas})
            </p>
          </div>
        </div>
        <p className="sf-alert-help-text">Ayúdanos a mejorar tu experiencia</p>

        {/* Botón para agregar reseña */}
        <button className="sf-alert-btn-review" onClick={onReview}>
          Agregar reseña
        </button>

      </div>
    </div>
  );

