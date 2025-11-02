import { useState } from 'react';
import { useSolicitudes } from '../../hooks/useSolicitudes';
import '../../assets/styles/AdminSolicitudes.css';

function AdminSolicitudes() {
  const { solicitudes, loading, error, aprobarSolicitud, rechazarSolicitud } = useSolicitudes();
  const [filtro, setFiltro] = useState('todas'); // todas, pendiente, aprobado, rechazado
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [procesando, setProcesando] = useState(false);

  const solicitudesFiltradas = solicitudes.filter(sol => {
    if (filtro === 'todas') return true;
    return sol.estado_solicitud === filtro;
  });

  const handleAprobar = async (idProveedor) => {
    if (!confirm('¿Estás seguro de que deseas aprobar esta solicitud? El usuario será movido al grupo de Trabajadores.')) {
      return;
    }
    
    setProcesando(true);
    const result = await aprobarSolicitud(idProveedor);
    setProcesando(false);
    
    if (result.success) {
      alert(result.message);
      setSolicitudSeleccionada(null);
    } else {
      alert('Error: ' + result.message);
    }
  };

  const handleRechazar = async (idProveedor) => {
    if (!confirm('¿Estás seguro de que deseas rechazar esta solicitud?')) {
      return;
    }
    
    setProcesando(true);
    const result = await rechazarSolicitud(idProveedor);
    setProcesando(false);
    
    if (result.success) {
      alert(result.message);
      setSolicitudSeleccionada(null);
    } else {
      alert('Error: ' + result.message);
    }
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'badge-warning';
      case 'aprobado':
        return 'badge-success';
      case 'rechazado':
        return 'badge-danger';
      default:
        return 'badge-default';
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-solicitudes">
      <div className="solicitudes-header">
        <h1>Gestión de Solicitudes de Proveedor</h1>
        <p className="subtitle">Revisa, aprueba o rechaza solicitudes de trabajadores</p>
      </div>

      {/* Filtros */}
      <div className="solicitudes-filters">
        <button 
          className={`filter-btn ${filtro === 'todas' ? 'active' : ''}`}
          onClick={() => setFiltro('todas')}
        >
          Todas ({solicitudes.length})
        </button>
        <button 
          className={`filter-btn ${filtro === 'pendiente' ? 'active' : ''}`}
          onClick={() => setFiltro('pendiente')}
        >
          Pendientes ({solicitudes.filter(s => s.estado_solicitud === 'pendiente').length})
        </button>
        <button 
          className={`filter-btn ${filtro === 'aprobado' ? 'active' : ''}`}
          onClick={() => setFiltro('aprobado')}
        >
          Aprobadas ({solicitudes.filter(s => s.estado_solicitud === 'aprobado').length})
        </button>
        <button 
          className={`filter-btn ${filtro === 'rechazado' ? 'active' : ''}`}
          onClick={() => setFiltro('rechazado')}
        >
          Rechazadas ({solicitudes.filter(s => s.estado_solicitud === 'rechazado').length})
        </button>
      </div>

      {/* Estado de carga */}
      {loading && !procesando && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando solicitudes...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-state">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Lista de solicitudes */}
      {!loading && !error && solicitudesFiltradas.length === 0 && (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <h3>No hay solicitudes {filtro !== 'todas' ? filtro + 's' : ''}</h3>
          <p>No se encontraron solicitudes que coincidan con el filtro seleccionado.</p>
        </div>
      )}

      {!loading && !error && solicitudesFiltradas.length > 0 && (
        <div className="solicitudes-grid">
          {solicitudesFiltradas.map((solicitud) => (
            <div key={solicitud.id_proveedor} className="solicitud-card">
              <div className="solicitud-header">
                <div>
                  <h3>{solicitud.nombre_completo}</h3>
                  <p className="solicitud-email">{solicitud.email_usuario}</p>
                </div>
                <span className={`badge ${getEstadoBadgeClass(solicitud.estado_solicitud)}`}>
                  {solicitud.estado_solicitud}
                </span>
              </div>

              <div className="solicitud-info">
                <div className="info-row">
                  <span className="info-label">📞 Teléfono:</span>
                  <span className="info-value">{solicitud.telefono_usuario || 'No registrado'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">📍 Dirección:</span>
                  <span className="info-value">{solicitud.direccion}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🆔 CURP:</span>
                  <span className="info-value">{solicitud.curp}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">⏱️ Experiencia:</span>
                  <span className="info-value">{solicitud.años_experiencia} años</span>
                </div>
                <div className="info-row">
                  <span className="info-label">🔧 Servicios:</span>
                  <span className="info-value">{solicitud.especializaciones}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">📅 Fecha solicitud:</span>
                  <span className="info-value">{formatearFecha(solicitud.fecha_solicitud)}</span>
                </div>
                {solicitud.fecha_aprobacion && (
                  <div className="info-row">
                    <span className="info-label">✅ Fecha aprobación:</span>
                    <span className="info-value">{formatearFecha(solicitud.fecha_aprobacion)}</span>
                  </div>
                )}
              </div>

              <div className="solicitud-actions">
                <button
                  className="btn-details"
                  onClick={() => setSolicitudSeleccionada(solicitud)}
                >
                  Ver detalles
                </button>
                
                {solicitud.estado_solicitud === 'pendiente' && (
                  <>
                    <button
                      className="btn-approve"
                      onClick={() => handleAprobar(solicitud.id_proveedor)}
                      disabled={procesando}
                    >
                      {procesando ? 'Procesando...' : '✓ Aprobar'}
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleRechazar(solicitud.id_proveedor)}
                      disabled={procesando}
                    >
                      {procesando ? 'Procesando...' : '✗ Rechazar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {solicitudSeleccionada && (
        <div className="modal-overlay" onClick={() => setSolicitudSeleccionada(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Solicitud</h2>
              <button className="modal-close" onClick={() => setSolicitudSeleccionada(null)}>
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h3>Información Personal</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Nombre completo:</label>
                    <p>{solicitudSeleccionada.nombre_completo}</p>
                  </div>
                  <div className="detail-item">
                    <label>Email:</label>
                    <p>{solicitudSeleccionada.email_usuario}</p>
                  </div>
                  <div className="detail-item">
                    <label>Teléfono:</label>
                    <p>{solicitudSeleccionada.telefono_usuario || 'No registrado'}</p>
                  </div>
                  <div className="detail-item">
                    <label>CURP:</label>
                    <p>{solicitudSeleccionada.curp}</p>
                  </div>
                  <div className="detail-item">
                    <label>Dirección:</label>
                    <p>{solicitudSeleccionada.direccion}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Información Profesional</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Años de experiencia:</label>
                    <p>{solicitudSeleccionada.años_experiencia} años</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Servicios que ofrece:</label>
                    <p>{solicitudSeleccionada.especializaciones}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Estado de la Solicitud</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Estado:</label>
                    <span className={`badge ${getEstadoBadgeClass(solicitudSeleccionada.estado_solicitud)}`}>
                      {solicitudSeleccionada.estado_solicitud}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Fecha de solicitud:</label>
                    <p>{formatearFecha(solicitudSeleccionada.fecha_solicitud)}</p>
                  </div>
                  {solicitudSeleccionada.fecha_aprobacion && (
                    <div className="detail-item">
                      <label>Fecha de aprobación:</label>
                      <p>{formatearFecha(solicitudSeleccionada.fecha_aprobacion)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {solicitudSeleccionada.estado_solicitud === 'pendiente' && (
                <>
                  <button
                    className="btn-approve"
                    onClick={() => handleAprobar(solicitudSeleccionada.id_proveedor)}
                    disabled={procesando}
                  >
                    {procesando ? 'Procesando...' : '✓ Aprobar Solicitud'}
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleRechazar(solicitudSeleccionada.id_proveedor)}
                    disabled={procesando}
                  >
                    {procesando ? 'Procesando...' : '✗ Rechazar Solicitud'}
                  </button>
                </>
              )}
              <button className="btn-secondary" onClick={() => setSolicitudSeleccionada(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSolicitudes;
