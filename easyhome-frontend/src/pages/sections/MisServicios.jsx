import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../config/api';

function MisServicios({ idProveedor }) {
  const [servicios, setServicios] = useState([]);
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
        const response = await api.get(`/api/v1/proveedores/${idProveedor}/servicios`);
        setServicios(response.data);
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

      <h2 className="section-title">Mis Servicios</h2>

      {servicios.map((servicio) => (
        <div key={servicio.id_publicacion} className="publicacion-card">

          {/* HEADER DEL PROVEEDOR */}
          <div className="publicacion-header">
            <div className="publicacion-perfil">
              <img
                src={servicio.proveedor?.foto_perfil || "https://i.imgur.com/placeholder.png"}
                className="perfil-avatar"
                alt="proveedor"
              />

              <div>
                <p className="perfil-nombre">{servicio.proveedor?.nombre_completo || "Proveedor"}</p>

                <div className="perfil-rating">
                  <span className="rating-estrella">★</span>
                  <span>{servicio.calificacion_promedio_publicacion || "4.5"}</span>
                  <span className="rating-count">({servicio.total_reseñas_publicacion || 10})</span>
                </div>
              </div>
            </div>
          </div>

          {/* TÍTULO */}
          <h3 className="publicacion-titulo">{servicio.titulo}</h3>

          {/* DESCRIPCIÓN */}
          <p className="publicacion-descripcion">{servicio.descripcion}</p>

          {/* ETIQUETAS */}
          {servicio.etiquetas?.length > 0 && (
            <div className="etiquetas-contenedor">
              {servicio.etiquetas.map((tag) => (
                <span key={tag.id_etiqueta} className="etiqueta-item">
                  {tag.nombre_etiqueta}
                </span>
              ))}
            </div>
          )}

          {/* IMÁGENES */}
          <div className="imagenes-contenedor">
            {servicio.imagen_publicacion?.slice(0, 2).map((img) => (
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
              Rango de precio: <strong>${servicio.rango_precio_min} – ${servicio.rango_precio_max}</strong>
            </p>

            {/* 🔥 CAMBIO REALIZADO AQUÍ */}
            <button className="boton-perfil">Editar</button>
          </div>

        </div>
      ))}

      {/* =================== ESTILOS =================== */}
      <style>{`
        .publicacion-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
            max-width: 780px;
            background-color: #ffffff;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08); 
            font-family: Arial, sans-serif;
            margin-left: auto;
            margin-right: auto;
        }

        .publicacion-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 5px;
        }

        .publicacion-perfil {
            display: flex;
            align-items: center;
        }

        .perfil-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 15px;
            object-fit: cover;
            border: 1px solid #e0e0e0;
        }

        .perfil-nombre {
            font-size: 1.2em;
            font-weight: bold;
            color: #333333;
            margin: 0;
        }

        .perfil-rating {
            display: flex;
            align-items: center;
            font-size: 0.9em;
            color: #666666;
            margin-top: 2px;
        }

        .rating-estrella {
            color: #ffc107;
            margin-right: 5px;
        }

        .publicacion-titulo {
            font-size: 1.6em;
            font-weight: 800;
            color: #16394F;
            margin: 8px 0 5px 0;
            text-align: left;
        }

        .publicacion-descripcion {
            line-height: 1.5;
            color: #333333;
            margin-bottom: 15px;
            text-align: left;
        }

        .etiquetas-contenedor {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }

        .etiqueta-item {
            border: 1px solid #cccccc;
            border-radius: 15px;
            padding: 4px 12px;
            font-size: 0.8em;
            color: #666666;
        }

        .imagenes-contenedor {
            display: flex;
            gap: 10px;
            border-top: 1.5px solid #16394F;
            padding-top: 20px;
            margin-bottom: 20px;
        }

        .imagen-muestra {
            width: 50%;
            height: auto;
            border-radius: 6px;
            object-fit: cover;
        }

        .publicacion-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .rango-precio {
            font-size: 1.1em;
            color: #16394F;
        }

        .boton-perfil {
            background-color: #16394F;
            color: #ffffff;
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }

        .section-title {
            font-size: 2.5em;
            font-weight: 800;
            margin-bottom: 25px;
            color: #333;
        }
      `}</style>
    </div>
  );
}

MisServicios.propTypes = {
  idProveedor: PropTypes.number
};

export default MisServicios;
