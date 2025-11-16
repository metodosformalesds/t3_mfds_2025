import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../config/api';

function MisServicios({idProveedor, publicView = false}) {
  const [servicios, setServicios] = useState([]);
  const [nombreProveedor, setNombreProveedor] = useState("Proveedor");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServicios = async () => {
      if (!idProveedor) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1️⃣ Obtener información del proveedor (solo para el nombre)
        try {
          const resPerfil = await api.get(
            `/api/v1/proveedores/${idProveedor}/perfil-about`
          );

          const p = resPerfil.data;

          // Detectar el nombre correctamente
          const nombreDetectado =
            p.nombre_completo ||
            p.nombre ||
            p.usuario?.nombre_completo ||
            p.usuario?.nombre ||
            "Proveedor";

          setNombreProveedor(nombreDetectado);

        } catch (e) {
          console.warn("⚠️ No se pudo obtener el nombre del proveedor.");
        }

        // 2️⃣ Obtener servicios del proveedor
        const response = await api.get(
          `/api/v1/proveedores/${idProveedor}/servicios`
        );
        const serviciosBase = response.data;

        // 3️⃣ Obtener foto de perfil firmada
        const serviciosConFoto = await Promise.all(
          serviciosBase.map(async (servicio) => {
            try {
              const fotoRes = await api.get(
                `/api/v1/usuarios/${servicio.id_proveedor}/foto-perfil`
              );

              return {
                ...servicio,
                foto_perfil_url: fotoRes.data.foto_perfil_url  // ← sin objeto proveedor
              };
            } catch {
              return {
                ...servicio,
                foto_perfil_url: null
              };
            }
          })
        );

        setServicios(serviciosConFoto);
        setError(null);

      } catch (err) {
        console.error("❌ Error al obtener servicios:", err);
        setError("No se pudieron cargar los servicios");
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, [idProveedor]);

  if (loading) return <div>Cargando servicios...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="mis-servicios-container">
      <div className="header-section">
        <h2>Mis Servicios</h2>
        <button className="btn-nuevo-servicio">+ Nuevo Servicio</button>
      </div>

      {servicios.length === 0 ? (
        <div className="no-servicios">
          <p>No tienes servicios publicados aún.</p>
          <button className="btn-crear-primero">Crear mi primer servicio</button>
        </div>
      ) : (
        <div className="servicios-grid">
          {servicios.map((servicio) => (
            <div key={servicio.id_publicacion} className="servicio-card">
              {/* Imagen principal */}
              <div className="servicio-imagen">
                {servicio.imagen_publicacion && servicio.imagen_publicacion.length > 0 ? (
                  <img 
                    src={servicio.imagen_publicacion[0].url_imagen} 
                    alt={servicio.titulo}
                  />
                ) : (
                  <div className="no-imagen">Sin imagen</div>
                )}
                <span className={`estado-badge ${servicio.estado}`}>
                  {servicio.estado}
                </span>
              </div>

              {/* Información del servicio */}
              <div className="servicio-info">
                <h3>{servicio.titulo}</h3>
                <p className="descripcion">{servicio.descripcion}</p>
                
                <div className="precio-rango">
                  <span className="precio">
                    ${Number(servicio.rango_precio_min).toFixed(2)} - 
                    ${Number(servicio.rango_precio_max).toFixed(2)}
                  </span>
                </div>

                <div className="stats">
                  <span className="stat">
                    ⭐ {servicio.calificacion_promedio_publicacion ? 
                      Number(servicio.calificacion_promedio_publicacion).toFixed(1) : 
                      'Sin calificación'}
                  </span>
                  <span className="stat">
                    💬 {servicio.total_reseñas_publicacion || 0} reseñas
                  </span>
                  <span className="stat">
                    👁️ {servicio.vistas} vistas
                  </span>
                </div>

                <div className="servicio-acciones">
                  <button className="btn-editar">Editar</button>
                  <button className="btn-ver">Ver publicación</button>
                </div>
              </div>
            </div>
          ))} 
        </div>
      )}

      {/* ESTILOS */}
      <style>{`
        .mis-servicios-contenedor {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .section-title {
          font-size: 2.5em;
          font-weight: 800;
          margin-bottom: 25px;
          color: #16394F;
          text-align: left;
        }

        .publicacion-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 40px;
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }

        .publicacion-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
        }

        .publicacion-perfil {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .perfil-avatar {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e0e0e0;
        }

        .perfil-nombre {
          font-size: 1.2em;
          font-weight: bold;
          margin: 0;
          color: #333;
        }

        .perfil-rating {
          font-size: 0.85em;
          color: #555;
        }

        .rating-estrella {
          color: #ffc107;
          margin-right: 4px;
        }

        .publicacion-titulo {
          font-size: 1.8em;
          font-weight: 700;
          color: #16394F;
          margin: 10px 0;
          text-align: left;
        }

        .publicacion-descripcion {
          color: #444;
          line-height: 1.5;
          margin-bottom: 20px;
          text-align: left;
        }

        .imagenes-contenedor {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin: 20px 0;
          border-top: 2px solid #16394F;
          padding-top: 20px;
        }

        .imagen-muestra {
          width: calc(50% - 10px);
          border-radius: 8px;
          object-fit: cover;
        }

        .publicacion-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }

        .rango-precio {
          font-size: 1.1em;
          color: #16394F;
        }

        .boton-perfil {
          background-color: #16394F;
          color: #fff;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

MisServicios.propTypes = {
  idProveedor: PropTypes.number
};

export default MisServicios;