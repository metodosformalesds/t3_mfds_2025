import React, { useState } from "react";
import "../../assets/styles/alerta_contratacion.css";
import { useUserProfile } from '../../hooks/useUserProfile';
import api from '../../config/api';

export default function AgreementAlert({ isOpen, provider, onClose, onResult }) {
  const { userData } = useUserProfile();
  const [loading, setLoading] = useState(false);

  if (!isOpen || !provider) return null;

  const handleAnswer = async (logro) => {
    if (loading) return;
    setLoading(true);

    try {
      // Llamamos al endpoint que acepta proveedor en body y usa current_user desde headers
      const clienteId = userData?.id_usuario || null;
      await api.post('/api/v1/proveedores/alerta/resultado',
        {
          proveedor_id: provider.id || provider.id_proveedor || provider.idProveedor,
          logro,
          id_publicacion: provider.id_publicacion || null
        },
        {
          headers: {
            'X-User-Id': clienteId
          }
        }
      );
    } catch (err) {
      console.error('Error enviando resultado de alerta:', err);
    } finally {
      setLoading(false);
      onResult && onResult();
    }
  };

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
            onClick={() => handleAnswer(true)}
            disabled={loading}
          >
            {loading ? 'Enviando...' : '✓ Sí logré'}
          </button>
          <button
            className="agreement-alert-btn agreement-alert-btn-danger"
            onClick={() => handleAnswer(false)}
            disabled={loading}
          >
            {loading ? 'Enviando...' : '✕ No logré'}
          </button>
        </div>
      </div>
    </div>
  );
}
