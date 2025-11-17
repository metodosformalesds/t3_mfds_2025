import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

function MisServicios({ idProveedor, publicView = false }) {
  const navigate = useNavigate();

  const [servicios, setServicios] = useState([]);
  const [nombreProveedor, setNombreProveedor] = useState('Proveedor');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================
  // Cargar servicios del proveedor
  // ============================
  useEffect(() => {
    const fetchServicios = async () => {
      if (!idProveedor) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // 1️⃣ Obtener información del proveedor (solo nombre)
        try {
          const resPerfil = await api.get(
            `/api/v1/proveedores/${idProveedor}/perfil-about`
          );

          const p = resPerfil.data;

          const nombreDetectado =
            p.nombre_completo ||
            p.nombre ||
            p.usuario?.nombre_completo ||
            p.usuario?.nombre ||
            'Proveedor';

          setNombreProveedor(nombreDetectado);
        } catch (e) {
          console.warn('⚠️ No se pudo obtener el nombre del proveedor.');
        }

        // 2️⃣ Obtener servicios publicados
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
                foto_perfil_url: fotoRes.data.foto_perfil_url,
              };
            } catch {
              return {
                ...servicio,
                foto_perfil_url: null,
              };
            }
          })
        );

        setServicios(serviciosConFoto);
        setError(null);
      } catch (err) {
        console.error('❌ Error al obtener servicios:', err);
        setError('No se pudieron cargar los servicios');
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, [idProveedor]);

  // ============================
  // Eliminar publicación
  // ============================
  const handleEliminar = async (idPublicacion) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta publicación?')) return;

    try {
      await api.delete(`/api/v1/publicaciones/${idPublicacion}`);

      // Actualizar estado local quitando la publicación
      setServicios((prev) =>
        prev.filter((serv) => serv.id_publicacion !== idPublicacion)
      );

      alert('Publicación eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar la publicación');
    }
  };

  if (loading) return <div>Cargando servicios...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="mis-servicios-contenedor">
      <div className="header-section">
        <h2 className="section-title">
          {publicView ? 'Servicios del proveedor' : 'Mis Servicios'}
        </h2>

        {!publicView && (
          <button
            className="btn-nuevo-servicio"
            onClick={() => navigate('/publicarservicio')}
          >
            + Nuevo Servicio
          </button>
        )}
      </div>

      {servicios.map((servicio) => {
        const fotoPerfil =
          servicio.foto_perfil_url || 'https://i.imgur.com/placeholder.png';

        return (
          <div key={servicio.id_publicacion} className="publicacion-card">
            {/* HEADER */}
            <div className="publicacion-header">
              <div className="publicacion-perfil">
                <img
                  src={fotoPerfil}
                  className="perfil-avatar"
                  alt="proveedor"
                />

                <div>
                  <p className="perfil-nombre">{nombreProveedor}</p>

                  <div className="perfil-rating">
                    <span className="rating-estrella">★</span>
                    <span>
                      {servicio.calificacion_promedio_publicacion || '4.5'}
                    </span>
                    <span className="rating-count">
                      ({servicio.total_reseñas_publicacion || 10})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TÍTULO */}
            <h3 className="publicacion-titulo">{servicio.titulo}</h3>

            {/* DESCRIPCIÓN */}
            <p className="publicacion-descripcion">{servicio.descripcion}</p>

            {/* IMÁGENES */}
            <div className="imagenes-contenedor">
              {servicio.imagen_publicacion?.map((img) => (
                <img
                  key={img.id_imagen}
                  src={img.url_imagen}
                  className="imagen-muestra"
                  alt="foto"
                />
              ))}
            </div>

            {/* FOOTER */}
            <div className="publicacion-footer">
              <p className="rango-precio">
                Rango de precio:
                <strong>
                  {' '}
                  ${servicio.rango_precio_min} – ${servicio.rango_precio_max}
                </strong>
              </p>

              <div className="acciones-botones">
                <button className="boton-perfil">Editar</button>

                <button
                  className="boton-eliminar"
                  onClick={() => handleEliminar(servicio.id_publicacion)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* ESTILOS INLINE */}
      <style>{`
        .mis-servicios-contenedor {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .btn-nuevo-servicio {
          background-color: #16394F;
          color: white;
          border: none;
          padding: 10px 18px;
          font-size: 1em;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .btn-nuevo-servicio:hover {
          background-color: #1f4e67;
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

        .rating-count {
          margin-left: 4px;
          color: #777;
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

        .acciones-botones {
          display: flex;
          gap: 10px;
        }

        .boton-perfil {
          background-color: #16394F;
          color: #fff;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .boton-eliminar {
          background-color: #b30000;
          color: #fff;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s ease;
          font-size: 0.95em;
        }

        .boton-eliminar:hover {
          background-color: #d11a1a;
        }
      `}</style>
    </div>
  );
}

MisServicios.propTypes = {
  idProveedor: PropTypes.number,
  publicView: PropTypes.bool,
};

export default MisServicios;
