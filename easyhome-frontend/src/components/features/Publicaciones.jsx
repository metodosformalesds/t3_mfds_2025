import '../../assets/styles/publicaciones.css';

// 1. Aceptar 'publicacionData' como prop
export default function Publicaciones({ publicacionData }) { 
    
    // Desestructurar (o renombrar) los datos para facilitar su uso
    // Usamos la estructura de la respuesta del endpoint:
    const {
        titulo,
        descripcion_corta: descripcion, // Renombramos 'descripcion_corta' a 'descripcion'
        rango_precio_min,
        rango_precio_max,
        url_imagen_portada, // Solo usamos la portada para el avatar de ejemplo
        
        // Datos del Proveedor
        nombre_proveedor,
        calificacion_proveedor,
        // No tenemos el conteo de opiniones ni si es premium directamente
        
        // Asumiremos que es premium si tiene ID de plan (lógica del backend)
        // Ya que el endpoint no lo devuelve explícitamente, lo simularemos
        // Esto debe ser añadido a tu endpoint si es necesario.
        esPremium = true, 
        
        // Asumiendo que el endpoint devuelve un array de etiquetas
        etiquetas = ["Confiabilidad", "Mantenimiento", "Alta experiencia"] 
        
    } = publicacionData || {}; // Usar un objeto vacío por defecto para evitar errores si publicacionData es null

    // Helper para formatear el rango de precios
    //const rangoPrecioFormateado = `$${rango_precio_min.toFixed(0)}-$${rango_precio_max.toFixed(0)}`;


    return (
        <section className="service-listings-section">
            <div className="publicacion-card">
                
                <div className="publicacion-header">
                    <div className="publicacion-perfil">
                        
                        {/* Avatar (Usaremos la URL de portada si no hay URL de perfil disponible) */}
                        <img 
                            src={url_imagen_portada} // Usar el URL pre-firmado del endpoint
                            alt={`Foto de perfil de ${nombre_proveedor}`} 
                            className="perfil-avatar" 
                        />
                        
                        <div>
                            <h3 className="perfil-nombre">{nombre_proveedor}</h3>
                            
                            <div className="perfil-rating">
                                <span className="rating-estrella">★</span>
                                <span>
                                    {calificacion_proveedor?.toFixed(1) || 0} {/* Rating promedio */}
                                    ({/* CONTEO OPINIONES: Este campo no viene del endpoint, debe ser añadido */} 127)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Etiqueta Premium */}
                    {esPremium && (
                        <span className="badge-premium">Premium</span>
                    )}
                </div>

                {/* Resumen */}
                <p className="publicacion-descripcion">
                    {/* Usamos la descripción del endpoint */}
                    {descripcion}
                </p>

                {/* Contenedor de Etiquetas (Usamos el array de etiquetas) */}
                <div className="etiquetas-contenedor">
                    {etiquetas.map((tag) => (
                        <span key={tag} className="etiqueta-item">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Imágenes (Galería) - Aquí deberías mapear un array de URLs secundarias. 
                   Como tu endpoint solo devuelve una portada, la duplicamos como ejemplo. */}
                <div className="imagenes-contenedor">
                    <img src={url_imagen_portada} alt="Muestra de trabajo 1" className="imagen-muestra" />
                    <img src={url_imagen_portada} alt="Muestra de trabajo 2" className="imagen-muestra" />
                </div>
                
                {/* Footer (Precio y Botón) */}
                <div className="publicacion-footer">
                    {/* Rango de precio */}
                    

                    {/* Botón Ir al perfil */}
                </div>

            </div>
        </section>
    );
}