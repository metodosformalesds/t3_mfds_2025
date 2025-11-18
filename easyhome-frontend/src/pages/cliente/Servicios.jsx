/**
 * Autor: SEBASTIAN VALENCIA TERRAZAS
 * Componente: Servicios
 * Descripción: Lista de servicios contratados del cliente y navegación.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useClientServices from '../../hooks/useClientServices';
import ServiceCard from '../../components/features/ServiceCard';
import { useUserProfile } from '../../hooks/useUserProfile';


// Componente para la pantalla completa 
const ClienteServicios = () => {
    const navigate = useNavigate();
    const { userData, loading: userLoading } = useUserProfile();
    const clientId = userData?.id_usuario;

    // 1. Usar el hook personalizado para obtener datos
    const { services, isLoading, error } = useClientServices(clientId);

    if (userLoading || isLoading) {
        return (
            <div className="flex justify-center items-center h-48 bg-gray-50 p-6">
                <div className="text-lg font-medium text-blue-600">Cargando servicios contratados...</div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="p-6 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                <p className="font-semibold">Error:</p>
                <p>No se pudo cargar la información del usuario.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-100 text-red-700 border border-red-300 rounded-lg">
                <p className="font-semibold">Error al cargar:</p>
                <p>{error}. Por favor, verifica la conexión a tu API.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-extrabold mb-6 border-b pb-2" style={{ color: '#000000' }}>
                Tus Servicios Contratados
            </h2>
            
            <div className="space-y-4">
                {/* Mapear y renderizar las tarjetas */}
                {services.length > 0 ? (
                    services.map(service => (
                        <ServiceCard 
                            key={service.id} 
                            service={service}
                            onReview={(id) => navigate(`/cliente/resena?id_servicio_contratado=${id}`)}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 bg-white rounded-xl shadow-inner">
                        <p className="text-xl text-gray-500">
                            Aún no tienes servicios contratados.
                        </p>
                        <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium">
                            Buscar un servicio ahora
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClienteServicios;