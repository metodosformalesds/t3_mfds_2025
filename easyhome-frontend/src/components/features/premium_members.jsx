import React, { useState, useEffect } from 'react'; 
import '../../assets/styles/premium_members.css';

import api from '../../config/api';
const API_BASE_URL = api.BASE_URL;

export default function MiembrosPremium() {
    const [miembros, setMiembros] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMiembros = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/publicaciones/miembros-premium?limit=3`); //`${API_BASE_URL}/publicaciones/?${params.toString()}`;
                if (!response.ok) {
                    throw new Error('Error al cargar miembros premium');
                }
                const data = await response.json();
                setMiembros(data);
            } catch (err) {
                console.error("Error al obtener miembros premium:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMiembros();
    }, []);

    // ... (Estilos y lógica de renderizado del componente MiembrosPremium) ...
    
    if (isLoading) {
        return <div className="premium-sidebar">Cargando...</div>;
    }
    
    return (
        <div className="premium-sidebar">
            <h2 className="premium-sidebar-title">Miembros Premium</h2>

            <div className="premium-list">
                {miembros.map(miembro => (
                    // Mapeamos los datos del endpoint Miembros Premium
                    <div key={miembro.id_proveedor} className="miembro-card">
                        
                        <img 
                            src={miembro.foto_perfil_url || 'ruta/a/default_avatar.jpg'} 
                            alt={`Avatar de ${miembro.nombre_completo}`} 
                            className="miembro-avatar" 
                        />
                        
                        <div className="miembro-info">
                            <span className="miembro-name">{miembro.nombre_completo}</span>
                            <span className="miembro-membership">Miembro premium de EayHome</span>
                            <div className="miembro-rating">
                                <span className="rating-star">★</span>
                                <span>{miembro.calificacion_promedio?.toFixed(1) || 0}({/* No tenemos conteo de opiniones */})</span>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
}