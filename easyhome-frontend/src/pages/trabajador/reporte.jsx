import React, { useState } from "react";
import "../../assets/styles/reporte_formulario.css";
import { useUserProfile } from '../../hooks/useUserProfile';
import api from '../../config/api';

export default function ReportForm({ isOpen, provider, onClose, onSuccess }) {
  const { userData } = useUserProfile();
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !provider) return null;

  const handleSubmit = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);

    try {
      const reportData = {
        proveedor_id: provider.id || provider.id_proveedor || provider.idProveedor,
        detalles: details.trim() || null,
        reportado_por: userData?.id_usuario || null
      };

      await api.post('/api/v1/reportes', reportData, {
        headers: {
          'X-User-Id': userData?.id_usuario || null
        }
      });

      // Limpiar formulario
      setDetails("");
      
      // Notificar éxito y cerrar
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error('Error enviando reporte:', err);
      setError(err.response?.data?.detail || 'Error al enviar el reporte. Inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDetails("");
    setError(null);
    onClose();
  };

  return (
    <div className="report-form-backdrop">
      <div className="report-form-container">
        {/* Header */}
        <div className="report-form-header">
          <div className="report-form-icon">!</div>
          <div>
            <h2 className="report-form-title">
              Reportar a {provider.nombreCompleto || provider.nombre || 'este usuario'}
            </h2>
            <p className="report-form-subtitle">
              Tu reporte nos ayuda a mantener la calidad y seguridad de nuestra plataforma.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="report-form-body">
          <label className="report-form-label">
            Detalles (opcional)
          </label>
          
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Describe qué sucedió..."
            maxLength={500}
            disabled={loading}
            className={`report-form-textarea ${loading ? 'disabled' : ''}`}
          />
          
          <div className="report-form-counter">
            {details.length}/500
          </div>

          {error && (
            <div className="report-form-error">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="report-form-actions">
            <button
              onClick={handleCancel}
              disabled={loading}
              className={`report-form-btn report-form-btn-cancel ${loading ? 'disabled' : ''}`}
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`report-form-btn report-form-btn-submit ${loading ? 'disabled' : ''}`}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}