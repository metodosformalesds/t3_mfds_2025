import '../../assets/styles/Publicaciones.css';

export default function Publicaciones({ publicacionData, onVerPerfil }) {
  if (!publicacionData) return null;

  // Extraemos datos de la publicación
  const {
    id_publicacion,
    id_proveedor,
    nombre_proveedor,
    descripcion_corta: descripcion,
    rango_precio_min,
    rango_precio_max,
    url_imagen_portada,
    foto_perfil_proveedor,
    calificacion_proveedor = 0,
    total_reseñas_proveedor = 0,
    id_plan_suscripcion,
    imagen_publicacion = []
  } = publicacionData;

  // ¿Es premium?
  const esPremium =
    id_plan_suscripcion !== null && id_plan_suscripcion !== undefined;

  // Rango de precio
  const rangoPrecioFormateado = `$${rango_precio_min?.toFixed(2) || '0.00'} - $${rango_precio_max?.toFixed(2) || '0.00'}`;

  // Avatar del proveedor (foto de perfil, y si no, alguna imagen de la publicación como fallback)
  const avatarUrl =
    foto_perfil_proveedor ||
    (Array.isArray(imagen_publicacion) &&
      imagen_publicacion.length > 0 &&
      imagen_publicacion[0].url_imagen) ||
    'https://i.imgur.com/placeholder.png';

  // Portada / imágenes a mostrar en el card
  const tieneGaleria =
    Array.isArray(imagen_publicacion) && imagen_publicacion.length > 0;

  const portadaUrl =
    url_imagen_portada ||
    (tieneGaleria ? imagen_publicacion[0].url_imagen : null);

  return (
    <div className="publicacion-card">
      {/* HEADER */}
      <div className="publicacion-header">
        <div className="publicacion-perfil">
          <img
            src={avatarUrl}
            alt={`Foto de ${nombre_proveedor || 'Proveedor'}`}
            className="perfil-avatar"
          />

          <div>
            <h3 className="perfil-nombre">
              {nombre_proveedor || 'Proveedor'}
            </h3>

            <div className="perfil-rating">
              <span className="rating-estrella">★</span>
              <span>{calificacion_proveedor}</span>
              <span className="rating-count">
                ({total_reseñas_proveedor})
              </span>
            </div>
          </div>
        </div>

        {esPremium && <span className="badge-premium">Premium</span>}
      </div>

      {/* DESCRIPCIÓN */}
      <p className="publicacion-descripcion">{descripcion}</p>

      {/* IMÁGENES (como MisServicios) */}
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

        <button
          type="button"
          className="boton-perfil"
          onClick={onVerPerfil}
        >
          Ir al perfil
        </button>
      </div>
    </div>
  );
}
