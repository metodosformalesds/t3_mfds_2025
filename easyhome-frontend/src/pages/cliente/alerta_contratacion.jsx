import React, { useState } from "react";
import "../../assets/styles/alerta_contratacion.css";
import { useUserProfile } from '../../hooks/useUserProfile';
import api from '../../config/api';

export default function AgreementAlert({ isOpen, provider, onClose, onResult }) {
  const { userData, loading: userLoading } = useUserProfile();
  const [loading, setLoading] = useState(false);

  if (!isOpen || !provider) return null;

  // Indicador combinado de carga
  const isLoading = loading || userLoading;

  const handleAnswer = async (logro) => {
    if (loading) return;

    // Validar que el usuario esté autenticado y sus datos cargados
    const clienteId = userData?.id_usuario;
    if (!clienteId) {
      console.error('Usuario no autenticado o datos no cargados');
      alert('Error: No se pudo identificar al usuario. Por favor, recarga la página e intenta de nuevo.');
      onClose();
      return;
    }

    setLoading(true);

    try {
      // Llamamos al endpoint que acepta proveedor en body y usa current_user desde headers
      await api.post('/api/v1/proveedores/alerta/resultado',
        {
          proveedor_id: provider.id || provider.id_proveedor || provider.idProveedor,
          logro,
          id_publicacion: provider.id_publicacion || null
        },
        {
          headers: {
            'X-User-Id': String(clienteId) // Asegurar que sea string
          }
        }
      );

      // Solo llamar onResult si la petición fue exitosa
      onResult && onResult();
    } catch (err) {
      console.error('Error enviando resultado de alerta:', err);
      alert('Hubo un error al registrar tu respuesta. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
      onClose();
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
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : '✓ Sí logré'}
          </button>
          <button
            className="agreement-alert-btn agreement-alert-btn-danger"
            onClick={() => handleAnswer(false)}
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : '✕ No logré'}
          </button>
        </div>
      </div>
    </div>
  );
}
