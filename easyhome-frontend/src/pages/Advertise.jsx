import React from 'react';
import FAQSection from '../components/features/FAQSection'
import "../assets/styles/FAQSection.css"
import "../assets/styles/advertise.css"

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" 
      fill="#4caf50" className="icon icon-tabler icons-tabler-filled icon-tabler-rosette-discount-check">
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M12.01 2.011a3.2 3.2 0 0 1 2.113 .797l.154 .145l.698 
      .698a1.2 1.2 0 0 0 .71 .341l.135 .008h1a3.2 3.2 0 0 1 3.195 3.018l.005 .182v1c0 .27 
      .092 .533 .258 .743l.09 .1l.697 .698a3.2 3.2 0 0 1 .147 4.382l-.145 .154l-.698 
      .698a1.2 1.2 0 0 0 -.341 .71l-.008 .135v1a3.2 3.2 0 0 1 -3.018 3.195l-.182 .005h-1a1.2 
      1.2 0 0 0 -.743 .258l-.1 .09l-.698 .697a3.2 3.2 0 0 1 -4.382 .147l-.154 -.145l-.698 
      -.698a1.2 1.2 0 0 0 -.71 -.341l-.135 -.008h-1a3.2 3.2 0 0 1 -3.195 -3.018l-.005 -.182v-1a1.2 
      1.2 0 0 0 -.258 -.743l-.09 -.1l-.697 -.698a3.2 3.2 0 0 1 -.147 -4.382l.145 -.154l.698 
      -.698a1.2 1.2 0 0 0 .341 -.71l.008 -.135v-1l.005 -.182a3.2 3.2 0 0 1 3.013 -3.013l.182 
      -.005h1a1.2 1.2 0 0 0 .743 -.258l.1 -.09l.698 -.697a3.2 3.2 0 0 1 2.269 -.944zm3.697 
      7.282a1 1 0 0 0 -1.414 0l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.32 1.497l2 
      2l.094 .083a1 1 0 0 0 1.32 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
    </svg>
  );
}

function CircleXIcon({ size = 24, color = "#dc3545", className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color} className={`icon icon-tabler icons-tabler-filled icon-tabler-circle-x ${className}`}>
      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
      <path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-6.489 5.8a1 1 0 0 0 -1.218 1.567l1.292 1.293l-1.292 1.293l-.083 .094a1 1 0 0 0 1.497 1.32l1.293 -1.292l1.293 1.292l.094 .083a1 1 0 0 0 1.32 -1.497l-1.292 -1.293l1.292 -1.293l.083 -.094a1 1 0 0 0 -1.497 -1.32l-1.293 1.292l-1.293 -1.292l-.094 -.083z"/>
    </svg>
  );
}

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
                            <li className="feature check"><CheckIcon /> Banner rotatorio</li>
                            <li className="feature check"><CheckIcon /> Posicionado en el centro del sitio.</li>
                            <li className="feature cross"><CircleXIcon /> Compartido con otros anunciantes.</li>
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
                            <li className="feature check"><CheckIcon /> Banner lateral.</li>
                            <li className="feature check"><CheckIcon /> Los clientes no dejarán de ver su marca.</li>
                            <li className="feature check"><CheckIcon /> Espacio exclusivo para usted.</li>
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
                            <li className="feature check"><CheckIcon /> Banner superior.</li>
                            <li className="feature check"><CheckIcon /> Los clientes no dejarán de ver su marca.</li>
                            <li className="feature check"><CheckIcon /> Espacio exclusivo para usted.</li>
                            <li className="feature check"><CheckIcon /> Nivel más alto de visibilidad en el sitio.</li>
                            <li className="feature check"><CheckIcon /> El banner más grande de la plataforma.</li>
                        </ul>
                    <a href="#" className="card-button">Comenzar Ahora</a>
                </div>
                
            </div>

            {/* --- TABLA DE COMPARACIÓN --- */}
            <h2 className="comparison-title">Compara todos los planes</h2>
            
            <div className="comparison-grid">
                
                {/* 1. CABECERA Y PLANES (AJUSTADO PARA UNIFORMIDAD) */}
                <div className="plan-header-row">
                    
                    {/* Columna de Título de Características  */}
                    <div className="plan-column characteristics-label">
                        <h3 className="plan-name">Características</h3>
                    </div>
                    
                    {/* Plan Estándar */}
                    <div className="plan-column">
                        <h3 className="plan-name">Estándar</h3>
                        <p className="plan-tagline">La opción más accesible para mostrar tu marca.</p>
                        <a href="#" className="plan-button">Comenzar ahora</a>
                    </div>
                    
                    {/* Plan Lateral */}
                    <div className="plan-column featured">
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
                        <div className="plan-check check"><CheckIcon /></div>
                        <div className="plan-check check"><CheckIcon /></div>
                        <div className="plan-check check"><CheckIcon /></div>
                    </div>
                    
                    {/* Fila 2 */}
                    <div className="comparison-feature-row">
                        <div className="feature-label">Espacio exclusivo.</div>
                        <div className="plan-check cross"><CircleXIcon /></div>
                        <div className="plan-check check"><CheckIcon /></div>
                        <div className="plan-check check"><CheckIcon /></div>
                    </div>

                    {/* Fila 3 */}
                    <div className="comparison-feature-row">
                        <div className="feature-label">Nivel más alto de visibilidad.</div>
                        <div className="plan-check cross"><CircleXIcon /></div>
                        <div className="plan-check cross"><CircleXIcon /></div>
                        <div className="plan-check check"><CheckIcon /></div>
                    </div>

                    {/* Fila 4 */}
                    <div className="comparison-feature-row">
                        <div className="feature-label">Banner de mayor tamaño.</div>
                        <div className="plan-check cross"><CircleXIcon /></div>
                        <div className="plan-check cross"><CircleXIcon /></div>
                        <div className="plan-check check"><CheckIcon /></div>
                    </div>
                </div>

            </div>

            <FAQSection /> 

        </section>

        
    );
}

export default Advertise;