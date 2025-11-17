import { useState } from 'react';
import { useAdminPublicaciones } from '../../hooks/useAdminPublicaciones';
import '../../assets/styles/AdminPublicaciones.css';

function AdminPublicaciones() {
  const { publicaciones, loading, error, eliminarPublicacion } = useAdminPublicaciones();
  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [mostrarModalEliminar, setMostrarModalEliminar] = useState(false);

  const handleVerDetalles = (publicacion) => {
    setPublicacionSeleccionada(publicacion);
  };

  const cerrarModal = () => {
    setPublicacionSeleccionada(null);
  };

  const handleAbrirModalEliminar = (publicacion) => {
    setPublicacionSeleccionada(publicacion);
    setMostrarModalEliminar(true);
  };

  const handleCerrarModalEliminar = () => {
    setMostrarModalEliminar(false);
    setPublicacionSeleccionada(null);
  };

  const handleEliminar = async () => {
    if (!publicacionSeleccionada) return;

    setProcesando(true);
    const result = await eliminarPublicacion(publicacionSeleccionada.id_publicacion);
    setProcesando(false);

    if (result.success) {
      alert('✅ ' + result.message);
      handleCerrarModalEliminar();
    } else {
      alert('❌ Error: ' + result.message);
    }
  };

  const formatearPrecio = (min, max) => {
    if (!min && !max) return 'No especificado';
    if (min === max) return `$${min.toLocaleString()}`;
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  };

  return (
    <div className="admin-publicaciones">
      <div className="publicaciones-header">
        <h1>Gestión de Publicaciones</h1>
        <p className="subtitle">Administra las publicaciones de servicios en la plataforma</p>
      </div>

      {/* Estado de carga */}
      {loading && !procesando && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando publicaciones...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-state">
          <p>⚠️ {error}</p>
        </div>
      )}

      {/* Lista de publicaciones */}
      {!loading && !error && publicaciones.length === 0 && (
        <div className="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <h3>No hay publicaciones</h3>
          <p>No se encontraron publicaciones de servicios en el sistema.</p>
        </div>
      )}

      {!loading && !error && publicaciones.length > 0 && (
        <div className="publicaciones-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Publicaciones</p>
              <p className="stat-value">{publicaciones.length}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && publicaciones.length > 0 && (
        <div className="publicaciones-grid">
          {publicaciones.map((publicacion) => (
            <div key={publicacion.id_publicacion} className="publicacion-card">
              <div className="publicacion-imagen">
                {publicacion.url_imagen_portada ? (
                  <img src={publicacion.url_imagen_portada} alt={publicacion.titulo} />
                ) : (
                  <div className="publicacion-imagen-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p>Sin imagen</p>
                  </div>
                )}
              </div>

              <div className="publicacion-contenido">
                <div className="publicacion-header-card">
                  <h3 className="publicacion-titulo">{publicacion.titulo}</h3>
                  <span className="publicacion-badge">
                    {publicacion.categoria || 'Sin categoría'}
                  </span>
                </div>

                <p className="publicacion-descripcion">
                  {publicacion.descripcion_corta || publicacion.descripcion || 'Sin descripción'}
                </p>

                <div className="publicacion-info-row">
                  <div className="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span>{formatearPrecio(publicacion.rango_precio_min, publicacion.rango_precio_max)}</span>
                  </div>

                  <div className="info-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                    </svg>
                    <span>{publicacion.nombre_proveedor || 'Proveedor'}</span>
                  </div>
                </div>

                <div className="publicacion-actions">
                  <button
                    className="btn-details"
                    onClick={() => handleVerDetalles(publicacion)}
                  >
                    Ver detalles
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleAbrirModalEliminar(publicacion)}
                    disabled={procesando}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalles */}
      {publicacionSeleccionada && !mostrarModalEliminar && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-content modal-detalles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles de la Publicación</h2>
              <button className="modal-close" onClick={cerrarModal}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {publicacionSeleccionada.url_imagen_portada && (
                <div className="modal-imagen-portada">
                  <img src={publicacionSeleccionada.url_imagen_portada} alt={publicacionSeleccionada.titulo} />
                </div>
              )}

              <div className="detail-section">
                <h3>Información General</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Título:</label>
                    <p>{publicacionSeleccionada.titulo}</p>
                  </div>
                  <div className="detail-item">
                    <label>Categoría:</label>
                    <p>{publicacionSeleccionada.categoria || 'Sin categoría'}</p>
                  </div>
                  <div className="detail-item full-width">
                    <label>Descripción:</label>
                    <p>{publicacionSeleccionada.descripcion || 'Sin descripción'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Precio:</label>
                    <p>{formatearPrecio(publicacionSeleccionada.rango_precio_min, publicacionSeleccionada.rango_precio_max)}</p>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Información del Proveedor</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Proveedor:</label>
                    <p>{publicacionSeleccionada.nombre_proveedor || 'No especificado'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Calificación:</label>
                    <p>⭐ {publicacionSeleccionada.calificacion_proveedor || 'Sin calificación'}</p>
                  </div>
                  <div className="detail-item">
                    <label>Reseñas:</label>
                    <p>{publicacionSeleccionada.total_reseñas_proveedor || 0} reseñas</p>
                  </div>
                  <div className="detail-item">
                    <label>ID Proveedor:</label>
                    <p>{publicacionSeleccionada.id_proveedor}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-delete"
                onClick={() => {
                  cerrarModal();
                  handleAbrirModalEliminar(publicacionSeleccionada);
                }}
              >
                Eliminar Publicación
              </button>
              <button className="btn-secondary" onClick={cerrarModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {mostrarModalEliminar && publicacionSeleccionada && (
        <div className="modal-overlay" onClick={handleCerrarModalEliminar}>
          <div className="modal-content confirm-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirmar Eliminación</h2>
              <button className="modal-close" onClick={handleCerrarModalEliminar}>
                ✕
              </button>
            </div>

            <div className="confirm-modal-body">
              <div className="confirm-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1.67c.955 0 1.845 .467 2.39 1.247l.105 .16l8.114 13.548a2.914 2.914 0 0 1 -2.307 4.363l-.195 .008h-16.225a2.914 2.914 0 0 1 -2.582 -4.2l.099 -.185l8.11 -13.538a2.914 2.914 0 0 1 2.491 -1.403zm.01 13.33l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-.01 -7a1 1 0 0 0 -.993 .883l-.007 .117v4l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-4l-.007 -.117a1 1 0 0 0 -.993 -.883z" />
                </svg>
              </div>
              <h3>¿Estás seguro?</h3>
              <p>
                Estás a punto de eliminar la publicación{' '}
                <span className="highlight-text">
                  "{publicacionSeleccionada.titulo}"
                </span>
              </p>
              <p>Esta acción no se puede deshacer.</p>
            </div>

            <div className="confirm-modal-footer">
              <button
                type="button"
                className="btn-confirm-cancel"
                onClick={handleCerrarModalEliminar}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-confirm-delete"
                onClick={handleEliminar}
                disabled={procesando}
              >
                {procesando ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPublicaciones;
