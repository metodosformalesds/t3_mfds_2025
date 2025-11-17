import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';

function MisServicios({ idProveedor, publicView = false }) {
  const navigate = useNavigate();

  const [servicios, setServicios] = useState([]);
  const [nombreProveedor, setNombreProveedor] = useState("Proveedor");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =============================
  // FUNCION PARA ELIMINAR
  // =============================
  const handleEliminar = async (id_publicacion) => {
    const confirmar = window.confirm("¿Seguro que deseas eliminar esta publicación?");
    if (!confirmar) return;

    try {
      await api.delete(`/api/v1/publicaciones/${id_publicacion}`);

      // ACTUALIZA EL FRONTEND INMEDIATAMENTE
      setServicios((prev) =>
        prev.filter((s) => s.id_publicacion !== id_publicacion)
      );

      alert("Publicación eliminada correctamente");

    } catch (error) {
      console.error("❌ Error al eliminar:", error);
      alert("Error al eliminar la publicación");
    }
  };

  // =============================
  // CARGAR SERVICIOS
  // =============================
  useEffect(() => {
    const fetchServicios = async () => {
      if (!idProveedor) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // ------- NOMBRE DEL PROVEEDOR -------
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
            "Proveedor";

          setNombreProveedor(nombreDetectado);
        } catch (e) {
          console.warn("⚠️ No se pudo obtener el nombre del proveedor.");
        }

        // ------- SERVICIOS -------
        const response = await api.get(
          `/api/v1/proveedores/${idProveedor}/servicios`
        );
        const serviciosBase = response.data;

        // Foto de perfil firmada para cada servicio
        const serviciosConFoto = await Promise.all(
          serviciosBase.map(async (servicio) => {
            try {
              const fotoRes = await api.get(
                `/api/v1/usuarios/${servicio.id_proveedor}/foto-perfil`
              );

              return {
                ...servicio,
                foto_perfil_url: fotoRes.data.foto_perfil_url
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
        const fotoPerfil =
          servicio.foto_perfil_url ||
          "https://i.imgur.com/placeholder.png";

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
                  <p className="perfil-nombre">
                    {servicio.nombre_proveedor || nombreProveedor}
                  </p>

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

              <div style={{ display: "flex", gap: "10px" }}>
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

        .boton-eliminar {
          background-color: #B00020;
          color: #fff;
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .boton-eliminar:hover {
          background-color: #D32F2F;
        }
      `}</style>
    </div>
  );
}

MisServicios.propTypes = {
  idProveedor: PropTypes.number
};

export default MisServicios;
