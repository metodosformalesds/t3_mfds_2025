import '../../assets/styles/Publicaciones.css';

export default function Publicaciones({ publicacionData, onVerPerfil }) {
  if (!publicacionData) return null;

  const {
    id_publicacion,
    nombre_proveedor,
    descripcion_corta,
    rango_precio_min,
    rango_precio_max,
    foto_perfil_proveedor,
    calificacion_proveedor = 0,
    total_reseñas_proveedor = 0,

    url_imagen_portada,
    imagen_publicacion = []
  } = publicacionData;

  // URL avatar
  const avatarUrl =
    foto_perfil_proveedor ||
    (imagen_publicacion[0]?.url_imagen ?? null) ||
    "https://i.imgur.com/placeholder.png";

  // Mostrar galería si existe
  const tieneGaleria =
    Array.isArray(imagen_publicacion) && imagen_publicacion.length > 0;

  const portadaUrl =
    url_imagen_portada ||
    (tieneGaleria ? imagen_publicacion[0].url_imagen : null);

  const rangoPrecioFormateado =
    `$${Number(rango_precio_min).toFixed(2)} - $${Number(rango_precio_max).toFixed(2)}`;

  return (
    <div className="publicacion-card">

      {/* HEADER */}
      <div className="publicacion-header">
        <div className="publicacion-perfil">
          <img
            src={avatarUrl}
            alt="Foto proveedor"
            className="perfil-avatar"
          />

          <div>
            <h3 className="perfil-nombre">{nombre_proveedor}</h3>

            <div className="perfil-rating">
              <span className="rating-estrella">★</span>
              <span>{calificacion_proveedor}</span>
              <span className="rating-count">({total_reseñas_proveedor})</span>
            </div>
          </div>
        </div>
      </div>

      {/* DESCRIPCIÓN */}
      <p className="publicacion-descripcion">
        {descripcion_corta}
      </p>

      {/* IMÁGENES */}
      <div className="imagenes-contenedor">
        {tieneGaleria ? (
          imagen_publicacion.map((img) => (
            <img
              key={img.id_imagen}
              src={img.url_imagen}
              alt="Imagen del servicio"
              className="imagen-muestra"
            />
          ))
        ) : portadaUrl ? (
          <img
            src={portadaUrl}
            alt="Imagen del servicio"
            className="imagen-muestra"
          />
        ) : (
          <p>No hay imágenes disponibles.</p>
        )}
      </div>

      {/* FOOTER */}
      <div className="publicacion-footer">
        <p className="rango-precio">
          Rango de precio: <strong>{rangoPrecioFormateado}</strong>
        </p>

        <button className="boton-perfil" onClick={onVerPerfil}>
          Ir al perfil
        </button>
      </div>

    </div>
  );
}
