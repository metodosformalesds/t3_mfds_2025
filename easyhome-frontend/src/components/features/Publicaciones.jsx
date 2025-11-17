import '../../assets/styles/Publicaciones.css';


// 1. Aceptar 'publicacionData' como prop
export default function Publicaciones({ publicacionData, onVerPerfil  }) {
        
    // Usamos la estructura de la respuesta del endpoint 'listar_publicaciones'
    const {
        id_publicacion,
        id_proveedor,
        descripcion_corta: descripcion, 
        rango_precio_min,
        rango_precio_max,
        url_imagen_portada, 
        
        // Datos del Proveedor
        nombre_proveedor,
        calificacion_proveedor,
        
        total_reseñas_proveedor = publicacionData.total_reseñas_proveedor || 127, 
        etiquetas = publicacionData.etiquetas || ["Confiabilidad", "Mantenimiento", "Alta experiencia"],
        proveedor = {}
    } = publicacionData || {}; 

    // 2. Determinar si es Premium
    const esPremium = publicacionData.id_plan_suscripcion !== null && publicacionData.id_plan_suscripcion !== undefined;


    // 3. Helper para formatear el rango de precios
    const rangoPrecioFormateado = `$${rango_precio_min?.toFixed(0) || '?'}-$${rango_precio_max?.toFixed(0) || '?'}`;


    return (
        <section className="service-listings-section">
            <div className="publicacion-card">
                
                <div className="publicacion-header">
                    <div className="publicacion-perfil">
                        
                        {/* Avatar: Usamos la URL pre-firmada */}
                        <img 
                            // Usamos el campo foto_perfil_proveedor del resultado, si está disponible, 
                            // o url_imagen_portada como fallback.
                            src={publicacionData.foto_perfil_proveedor || url_imagen_portada}
                            alt={`Foto de perfil de ${nombre_proveedor}`} 
                            className="perfil-avatar" 
                        />
                        
                        <div>
                            {/* Nombre del Proveedor */}
                            <h3 className="perfil-nombre">
                                {nombre_proveedor || "Proveedor sin nombre"}
                            </h3>
                            
                            {/* Satisfacción del proveedor (porcentaje) */}
                            <div className="perfil-rating">
                                <span className="rating-estrella">★</span>
                                <span>{calificacion_proveedor ? `${Math.round((Number(calificacion_proveedor) / 5) * 100)}%` : "0%"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Etiqueta Premium */}
                    {esPremium && (
                        <span className="badge-premium">Premium</span>
                    )}
                </div>

                {/* Fecha de publicación */}
                {publicacionData.fecha_publicacion && (
                    <p className="publicacion-fecha">
                        Publicado: {new Date(publicacionData.fecha_publicacion).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </p>
                )}
                
                {/* Resumen */}
                <p className="publicacion-descripcion">{descripcion}</p>

                {/* Contenedor de Etiquetas */}
                <div className="etiquetas-contenedor">
                    {(etiquetas || []).map((tag) => (
                        <span key={tag} className="etiqueta-item">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Imágenes (Galería) - Mapeamos la URL de portada (solo la portada está disponible en el endpoint) */}
                <div className="imagenes-contenedor">
                    {url_imagen_portada ? (
                        <img src={url_imagen_portada} alt={`Muestra de ${nombre_proveedor}`} className="imagen-muestra" />
                    ) : (
                        <p>No hay imágenes disponibles.</p>
                    )}
                </div>
                
                {/* Footer (Precio y Botón) */}
                <div className="publicacion-footer">
                    {/* Rango de precio */}
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