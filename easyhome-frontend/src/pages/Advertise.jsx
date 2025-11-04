import React from 'react';
import FAQSection from '../components/features/FAQSection'
import "../assets/styles/FAQSection.css"
import "../assets/styles/advertise.css"

function Advertise() {
    return (
        <section className="pricing-section">
            <h2 className="pricing-title">¡Muestra tu marca en EasyHome!</h2>
            <p className="pricing-subtitle">
                ¿Buscas darle mayor visibilidad a tu empresa y tu público se relaciona con los Servicios del Hogar? <br />Llegaste al lugar indicado.
            </p>

            <div className="pricing-cards-container">

                {/* TARJETA 1: Estándar (Bloque de Tarjetas) */}
                <div className="pricing-card standard">
                    <h3 className="card-plan-name">Estándar</h3>
                    <hr className="card-divider" />
                    <div className="card-price">
                        $29.99 <span className="price-currency">USD/mes</span>
                    </div>
                    <ul className="card-features">
                        <li className="feature check">Banner rotatorio</li>
                        <li className="feature check">Posicionado en el centro del sitio.</li>
                        <li className="feature cross">Compartido con otros anunciantes.</li>
                    </ul>
                    <a href="#" className="card-button">Comenzar Ahora</a>
                </div>

                {/* TARJETA 2: Lateral (Bloque de Tarjetas) */}
                <div className="pricing-card lateral featured">
                    <h3 className="card-plan-name">Lateral</h3>
                    <hr className="card-divider" />
                    <div className="card-price">
                        $39.99 <span className="price-currency">USD/mes</span>
                    </div>
                    <ul className="card-features">
                        <li className="feature check">Banner lateral.</li>
                        <li className="feature check">Los clientes no dejarán de ver su marca.</li>
                        <li className="feature check">Espacio exclusivo para usted.</li>
                    </ul>
                    <a href="#" className="card-button">Comenzar Ahora</a>
                </div>

                {/* TARJETA 3: Superior (Bloque de Tarjetas) */}
                <div className="pricing-card superior">
                    <h3 className="card-plan-name">Superior</h3>
                    <hr className="card-divider" />
                    <div className="card-price">
                        $49.99 <span className="price-currency">USD/mes</span>
                    </div>
                    <ul className="card-features">
                        <li className="feature check">Banner superior.</li>
                        <li className="feature check">Los clientes no dejarán de ver su marca.</li>
                        <li className="feature check">Espacio exclusivo para usted.</li>
                        <li className="feature check">Nivel más alto de visibilidad en el sitio.</li>
                        <li className="feature check">El banner más grande de la plataforma.</li>
                    </ul>
                    <a href="#" className="card-button">Comenzar Ahora</a>
                </div>
                
            </div>

            {/* --- TABLA DE COMPARACIÓN --- */}
            <h2 className="comparison-title">Compara todos los planes</h2>
            
            <div className="comparison-grid">
                
                {/* 1. CABECERA Y PLANES (AJUSTADO PARA UNIFORMIDAD) */}
                <div className="plan-header-row">
                    
                    {/* Columna de Título de Características (REEMPLAZA placeholder-characteristics) */}
                    <div className="plan-column characteristics-label">
                        <h3 className="plan-name">Características</h3>
                    </div>
                    
                    {/* Plan Estándar */}
                    <div className="plan-column">
                        <h3 className="plan-name">Estándar</h3>
                        <p className="plan-tagline">La opción más accesible para mostrar tu marca.</p>
                        <a href="#" className="plan-button">Comenzar ahora</a>
                    </div>
                    
                    {/* Plan Lateral (QUITAMOS 'popular-tag') */}
                    <div className="plan-column featured">
                        {/* 🚫 Etiqueta 'Más popular' eliminada de aquí */}
                        <h3 className="plan-name">Lateral</h3>
                        <p className="plan-tagline">Sólida publicidad para tu empresa.</p>
                        <a href="#" className="plan-button">Comenzar ahora</a>
                    </div>
                    
                    {/* Plan Superior */}
                    <div className="plan-column">
                        <h3 className="plan-name">Superior</h3>
                        <p className="plan-tagline">Convierte tu compañía en el centro de atención.</p>
                        <a href="#" className="plan-button">Comenzar ahora</a>
                    </div>
                </div>

                {/* 2. CARACTERÍSTICAS Y FILAS DE COMPARACIÓN (AJUSTADO PARA 4 COLUMNAS IGUALES) */}
                <div className="characteristics-row">
                    
                    {/* Las etiquetas de características se manejan dentro de cada fila: */}
                    
                    {/* Fila 1 */}
                    <div className="comparison-feature-row">
                        <div className="feature-label">Banner publicitario.</div>
                        <div className="plan-check check"></div>
                        <div className="plan-check check"></div>
                        <div className="plan-check check"></div>
                    </div>
                    
                    {/* Fila 2 */}
                    <div className="comparison-feature-row">
                        <div className="feature-label">Espacio exclusivo.</div>
                        <div className="plan-check cross"></div>
                        <div className="plan-check check"></div>
                        <div className="plan-check check"></div>
                    </div>

                    {/* Fila 3 */}
                    <div className="comparison-feature-row">
                        <div className="feature-label">Nivel más alto de visibilidad.</div>
                        <div className="plan-check cross"></div>
                        <div className="plan-check cross"></div>
                        <div className="plan-check check"></div>
                    </div>

                    {/* Fila 4 */}
                    <div className="comparison-feature-row">
                        <div className="feature-label">Banner de mayor tamaño.</div>
                        <div className="plan-check cross"></div>
                        <div className="plan-check cross"></div>
                        <div className="plan-check check"></div>
                    </div>
                </div>

            </div>

            <FAQSection /> 

        </section>

        
    );
}

export default Advertise;