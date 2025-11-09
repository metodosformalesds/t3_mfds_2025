
import React from 'react';
import '../../assets/styles/premium_members.css';


export default function MiembrosPremium() {
    // Datos de ejemplo para los miembros premium
    const miembros = [
        { id: 1, nombre: "Roberta Alvarado", rating: 4.9, count: 127, avatarUrl: "ruta/a/roberta.jpg" },
    ];

    return (
        // Contenedor principal del componente (sidebar derecho)
        <div className="premium-sidebar">
            <h2 className="premium-sidebar-title">Miembros Premium</h2>

            <div className="premium-list">
                {miembros.map(miembro => (
                    // Tarjeta de cada miembro
                    <div key={miembro.id} className="miembro-card">
                        
                        {/* Avatar */}
                        <img 
                            src={miembro.avatarUrl} 
                            alt={`Avatar de ${miembro.nombre}`} 
                            className="miembro-avatar" 
                        />
                        
                        {/* Info del miembro */}
                        <div className="miembro-info">
                            <span className="miembro-name">{miembro.nombre}</span>
                            <span className="miembro-membership">Miembro premium de EayHome</span>
                            <div className="miembro-rating">
                                <span className="rating-star">★</span>
                                <span>{miembro.rating}({miembro.count})</span>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}