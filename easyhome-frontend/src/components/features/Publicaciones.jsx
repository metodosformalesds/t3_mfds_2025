import '../../assets/styles/publicaciones.css';

export default function Publicaciones() {
    // 1. Datos de ejemplo para la publicación (¡Estos vendrían de las props en un caso real!)
    const perfilData = {
        nombre: "Roberta Alvarado",
        rating: 4.9,
        opiniones: 127,
        descripcion: "Realizo trabajos de jardinería. Ya sea de limpieza, mantenimiento y cambio de plantas o macetas. Cuento con más de 10 años de experiencia, mi trabajo es de calidad garantizada y doy atención inmediata a todos mis clientes. Contácteme y con gusto le atiendo.",
        etiquetas: ["Confiabilidad", "Mantenimiento", "Alta experiencia"],
        rangoPrecio: "$250-$500",
        esPremium: true,
        // Debes reemplazar estas rutas con las reales de tus imágenes
        avatarUrl: "ruta/a/imagen_perfil_roberta.jpg", 
        imagenesTrabajo: [
            "ruta/a/imagen_jardin_1.jpg", 
            "ruta/a/imagen_jardin_2.jpg"
        ]
    };

    return (
        // Usamos la clase del contenedor principal del CSS: .publicacion-card
        <section className="service-listings-section">
            <h1 className="section-title">Servicios </h1>
            
            {/* Contenedor de la publicación individual */}
            <div className="publicacion-card">
                
                {/* Cabecera, usa .publicacion-header para el layout Flexbox */}
                <div className="publicacion-header">
                    
                    <div className="publicacion-perfil">
                        {/* Avatar */}
                        <img 
                            src={perfilData.avatarUrl} 
                            alt={`Foto de perfil de ${perfilData.nombre}`} 
                            className="perfil-avatar" 
                        />
                        
                        <div>
                            {/* Nombre */}
                            <h3 className="perfil-nombre">{perfilData.nombre}</h3>
                            
                            {/* Rating y opiniones */}
                            <div className="perfil-rating">
                                <span className="rating-estrella">★</span>
                                <span>{perfilData.rating} ({perfilData.opiniones})</span>
                            </div>
                        </div>
                    </div>

                    {/* Etiqueta Premium (Renderizado Condicional) */}
                    {perfilData.esPremium && (
                        <span className="badge-premium">Premium</span>
                    )}
                </div>

                {/* Resumen */}
                <p className="publicacion-descripcion">
                    {perfilData.descripcion}
                </p>

                {/* Contenedor de Etiquetas, usa .etiquetas-contenedor para el layout Flexbox */}
                <div className="etiquetas-contenedor">
                    {perfilData.etiquetas.map((tag) => (
                        <span key={tag} className="etiqueta-item">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Imágenes (Galería), usa .imagenes-contenedor para el layout Flexbox */}
                <div className="imagenes-contenedor">
                    {perfilData.imagenesTrabajo.map((imgSrc, index) => (
                        <img 
                            key={index}
                            src={imgSrc} 
                            alt={`Muestra de trabajo ${index + 1}`} 
                            className="imagen-muestra" 
                        />
                    ))}
                </div>
                
                {/* Footer (Precio y Botón) */}
                <div className="publicacion-footer">
                    {/* Rango de precio */}
                    <p className="rango-precio">
                        Rango de precio: <strong>{perfilData.rangoPrecio}</strong>
                    </p>

                    {/* Botón Ir al perfil */}
                    <a href="#" className="boton-perfil">Ir al perfil</a>
                </div>

            </div>
        </section>
    );
}