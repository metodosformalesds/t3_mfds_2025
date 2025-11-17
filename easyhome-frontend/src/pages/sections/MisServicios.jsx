import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

function MisServicios({ idProveedor, publicView = false }) {
  const navigate = useNavigate();

  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================================
  // 🔥 FUNCIÓN PARA ELIMINAR PUBLICACIÓN
  // =========================================================
  const handleEliminar = async (id_publicacion) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar esta publicación?");
    if (!confirmar) return;

    try {
      await api.delete(`/api/v1/publicaciones/${id_publicacion}`);

      // Filtrar publicaciones que SÍ quedan
      setServicios(prev => prev.filter(s => s.id_publicacion !== id_publicacion));

      alert("Publicación eliminada correctamente");
    } catch (error) {
      console.error("❌ Error al eliminar publicación:", error);
      alert("Error al eliminar la publicación");
    }
  };

  // =========================================================
  // 🔥 CARGAR SERVICIOS DEL PROVEEDOR
  // =========================================================
  useEffect(() => {
    const fetchServicios = async () => {
      if (!idProveedor) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Obtener servicios del proveedor
        const response = await api.get(`/api/v1/proveedores/${idProveedor}/servicios`);
        const serviciosBase = response.data;

        setServicios(serviciosBase);
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

  // RENDER
  if (loading) return <div>Cargando servicios...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="mis-servicios-contenedor">
      <div className="header-section">
        <h2 className="section-title">
          {publicView ? "Servicios del proveedor" : "Mis Servicios"}
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
        const nombreProv = servicio.nombre_proveedor || "Proveedor";

        return (
          <div key={servicio.id_publicacion} className="publicacion-card">

            {/* HEADER */}
            <div className="publicacion-header">
              <div className="publicacion-perfil">
                <img
                  src={servicio.foto_perfil_url || "https://i.imgur.com/placeholder.png"}
                  className="perfil-avatar"
                  alt="proveedor"
                />

                <div>
                  <p className="perfil-nombre">{nombreProv}</p>

                  <div className="perfil-rating">
                    <span className="rating-estrella">★</span>
                    <span>{servicio.calificacion_promedio_publicacion || "4.5"}</span>
                    <span className="rating-count">
                      ({servicio.total_reseñas_publicacion || 10})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* TITULO */}
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
                <strong> ${servicio.rango_precio_min} – ${servicio.rango_precio_max}</strong>
              </p>

              {!publicView && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="boton-perfil">Editar</button>

                  <button
                    className="boton-eliminar"
                    onClick={() => handleEliminar(servicio.id_publicacion)}
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>

          </div>
        );
      })}

      {/* ESTILOS */}
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
        }

        .btn-nuevo-servicio:hover { background-color: #1f4e67; }

        .section-title {
          font-size: 2.5em;
          font-weight: 800;
          color: #16394F;
        }

        .publicacion-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 40px;
          background-color: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }

        .publicacion-header { display: flex; align-items: center; margin-bottom: 15px; }

        .publicacion-perfil { display: flex; align-items: center; gap: 15px; }

        .perfil-avatar {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e0e0e0;
        }

        .perfil-nombre { font-size: 1.2em; font-weight: bold; margin: 0; color: #333; }

        .publicacion-titulo {
          font-size: 1.8em;
          font-weight: 700;
          color: #16394F;
          margin: 10px 0;
        }

        .publicacion-descripcion {
          color: #444;
          line-height: 1.5;
          margin-bottom: 20px;
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

        .boton-perfil {
          background-color: #16394F;
          color: #fff;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .boton-eliminar {
          background-color: #C1292E;
          color: #fff;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .boton-eliminar:hover { background-color: #A82020; }
      `}</style>
    </div>
  );
}

MisServicios.propTypes = {
  idProveedor: PropTypes.number
};

export default MisServicios;
