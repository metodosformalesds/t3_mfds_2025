import React from 'react';
import '../../assets/styles/publicaciones.css';


function ServiceCard() {
    return (
        <section className="service-listings-section">
            <h2 className="section-title">Servicios </h2>
            
            <div className="service-card">
                
                {/* Cabecera (Contenedor de Premium) */}
                <div className="card-header">
                    {/* Contenido principal */}
                    <div className="provider-info">
                        <img src="ruta/a/imagen_perfil.jpg" alt="Foto de perfil" className="profile-img" />
                        <span className="provider-name"></span> {/* Nombre */}
                    </div>

                    {/* Etiqueta Premium */}
                    <span className="premium-tag">Premium</span>
                </div>

                {/*Resumen y Tags*/}
                <div className="card-body">
                    <p className="description-text"></p>
                    <div className="tags-container">
                        
                    </div>
                </div>

                {/*  Imágenes */}
                <div className="gallery-container">
                    {/*<img src="ruta/a/imagen_jardin_1.jpg" alt="Muestra de trabajo 1" className="work-image" />*/}
                    
                    
                    {/* Ir al perfil*/}
                    <a href="#" className="profile-button">Ir al perfil</a>
                </div>

                {/* Rango de precio */}
                <p className="price-range"></p>
            </div>
        </section>
    );
}
export default ServiceCard;