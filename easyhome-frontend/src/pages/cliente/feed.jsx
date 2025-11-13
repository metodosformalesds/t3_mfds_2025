import React, { useState } from 'react';
import Publicaciones from '../../components/features/Publicaciones'
import Filtros from '../../components/features/filters'
// import PremiumMembers from '../../components/features/PremiumMembers'

import usePublicaciones from '../../hooks/usePublicaciones';

function Feed() {
  // Filtros activos
  const [filtrosActivos, setFiltrosActivos] = useState({
    categorias: [],
    suscriptores: false,
    ordenar_por: null,
  });

  // Hook para obtener publicaciones
  const { publicaciones, isLoading, error } = usePublicaciones(filtrosActivos);


    // Función que pasamos a <Filtros /> para actualizar el estado
    const aplicarFiltros = (nuevosFiltros) => {
        setFiltrosActivos(nuevosFiltros);
    }; 

    // --- Renderizado (Sección de Publicaciones) ---
    const renderPublicaciones = () => {
        if (isLoading) return <p>Cargando servicios...</p>;
        if (error) return <p style={{ color: 'red' }}>No se pudieron cargar los servicios: {error}</p>;
        if (publicaciones.length === 0) return <p>No se encontraron publicaciones activas con esos criterios.</p>;
        
        // Mapeamos los datos de la API a nuestro componente Publicaciones
        return publicaciones.map(pub => (
            // pub contiene todos los campos que definiste en tu endpoint
            <Publicaciones 
                key={pub.id_publicacion} 
                publicacionData={pub} 
            />
        ));
    };
  
  const feedContainerStyle = {
    // 2. APLICAR FLEXBOX para que Filtros y Publicaciones estén lado a lado
    display: 'flex',
    justifyContent: 'space-between',
    gap: '30px', // Espacio entre el sidebar de filtros y las publicaciones
    maxWidth: '1200px', // Ancho máximo para centrar el contenido principal
    margin: '30px auto', // Centrar el contenedor del feed en la página
    alignItems: 'flex-start', // Alinea los elementos a la parte superior (Importante para la altura)

  };

  return (
    <div style={{ padding: '20px' }}>
      
      {/* Título y Párrafo (Encabezado) */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: '#000000', fontSize: '2.5em' }}>Publicaciones</h1> 
          <p style={{ color: '#333333' }}>Ponte al día con las actualizaciones más recientes de los profesionales de EayHome..</p>
      </div>

      {/* 3. CONTENEDOR FLEX PRINCIPAL: Muestra Filtros y Publicaciones */}
      <div style={feedContainerStyle}> 
          {/* SIDEBAR DE FILTROS */}
          <Filtros
              onApplyFilters={aplicarFiltros}
              currentFilters={filtrosActivos}
          />

          {/* CONTENIDO PRINCIPAL (Servicios y Publicaciones) */}
          <div style={{width: '600px', flexShrink: 0 }}> {/* Esto hace que este div ocupe el espacio restante */}
            <h1 className="section-title"> Servicios disponibles </h1>
            {renderPublicaciones()}
          </div>
          {/* PremiumMembers removido */}
      </div>
    </div>
  );
}

export default Feed;