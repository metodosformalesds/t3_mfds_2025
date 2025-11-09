import React, { useState, useEffect } from 'react'; 
import Publicaciones from '../../components/features/Publicaciones'
import Filtros from '../../components/features/filters'
import PremiumMembers from '../../components/features/premium_members'

import api from '../../config/api';
const API_BASE_URL = api.BASE_URL;

function Feed() {
  //Para datos obtenidos
  const [publicaciones, setPublicaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filtrosActivos, setFiltrosActivos] = useState({
    categorias: [],
    suscriptores: false,
    ordenar_por: null,
  });

  //Llamada a la API 
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    //Query string basada en el estado 'filtrosActivos'
    const params=new URLSearchParams();

    //Filtro por categorias
    if (filtrosActivos.categorias && filtrosActivos.categorias.length > 0) {
      filtrosActivos.categorias.forEach(catID => params.append('categorias', catID));
    }
    
    //Filtro por suscriptores premium
    if (filtrosActivos.suscriptores) {
        params.append('suscriptores', 'true');
    }

    //ordenamiento
    if (filtrosActivos.ordenar_por) {
        params.append('ordenar_por', filtrosActivos.ordenar_por);
    }

    const endpoint = `${API_BASE_URL}/publicaciones/?${params.toString()}`;

    // 2. Ejecutar la llamada
    fetch(endpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar las publicaciones: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            setPublicaciones(data);
        })
        .catch(err => {
            console.error("Fetch error:", err);
            setError(err.message);
        })
        .finally(() => {
            setIsLoading(false);
        });

    }, [filtrosActivos]); // <--- La dependencia hace que se recargue cuando cambian los filtros

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
            <Publicaciones />
          </div>
          <PremiumMembers/>
      </div>
    </div>
  );
}

export default Feed;