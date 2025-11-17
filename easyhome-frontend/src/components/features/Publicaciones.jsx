import '../../assets/styles/Publicaciones.css';
 
export default function Publicaciones({ publicacionData, onVerPerfil }) {
  if (!publicacionData) return null;
 
  const {
    id_publicacion,
    nombre_proveedor,
    descripcion_completa,
    descripcion_corta,
    rango_precio_min,
    rango_precio_max,
    foto_perfil_proveedor,
    calificacion_proveedor = 0,
    total_reseñas_proveedor = 0,
    url_imagen_portada,
    imagen_publicacion = [],
    categoria,
    titulo
  } = publicacionData;
 
  // Avatar
  const avatarUrl =
    foto_perfil_proveedor ||
    imagen_publicacion[0]?.url_imagen ||
    "https://i.imgur.com/placeholder.png";
 
  // Galería
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
 
      {/* CATEGORÍA */}
      {categoria && (
        <div className="categoria-wrapper">
          <div className="categoria-tag">{categoria}</div>
        </div>
      )}
 
      {/* TÍTULO */}
      <h2 className="publicacion-titulo">{titulo}</h2>
 
      {/* DESCRIPCIÓN */}
      <p className="publicacion-descripcion">
        {descripcion_completa || descripcion_corta}
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