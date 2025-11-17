import React, { useState } from 'react';
import Publicaciones from '../../components/features/Publicaciones';
import Filtros from '../../components/features/filters';
// import PremiumMembers from '../../components/features/PremiumMembers';
import usePublicaciones from '../../hooks/usePublicaciones';
import { useNavigate } from 'react-router-dom';

function Feed() {
  const navigate = useNavigate();
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

  // Renderizado de publicaciones
  const renderPublicaciones = () => {
    if (isLoading) return <p>Cargando servicios...</p>;
    if (error) return <p style={{ color: 'red' }}>No se pudieron cargar los servicios: {error}</p>;
    if (publicaciones.length === 0) return <p>No se encontraron publicaciones activas con esos criterios.</p>;
    return publicaciones.map(pub => (
      <Publicaciones
        key={pub.id_publicacion}
        publicacionData={pub}
        onVerPerfil={() => handleVerPerfil(pub)}
      />
    ));
  };

  const handleVerPerfil = (publicacion) => {
 
    const provider = {
      id: publicacion.id_proveedor || publicacion.proveedor_id,
      nombreCompleto: publicacion.nombre_proveedor || publicacion.nombreCompleto || publicacion.nombre,
      fotoPerfil: publicacion.foto_perfil || publicacion.fotoProveedor || publicacion.fotoPerfil,
      calificacionPromedio: publicacion.calificacionPromedio || publicacion.calificacion || 4.4,
      totalResenas: publicacion.totalResenas || publicacion.totalReseñas || 0,
      esPremium: publicacion.esPremium || publicacion.proveedor_premium || false,
      oficio: publicacion.oficio || publicacion.categoria || publicacion.titulo,
      descripcion: publicacion.descripcion || publicacion.detalle || "Proveedor en EasyHome."
    };
 
    // Navegamos a la ruta del perfil del proveedor y mandamos la info en `state`
    navigate("/cliente/proveedor", { state: { provider } });
  };

  const feedContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    maxWidth: '1200px',
    margin: '30px auto',
    alignItems: 'flex-start',
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#000000', fontSize: '2.5em' }}>Publicaciones</h1>
        <p style={{ color: '#333333' }}>Ponte al día con las actualizaciones más recientes de los profesionales de EasyHome..</p>
      </div>
      <div style={feedContainerStyle}>
        <div style={{ width: '280px', flexShrink: 0 }}>
          <Filtros
            onApplyFilters={aplicarFiltros}
            currentFilters={filtrosActivos}
          />
        </div>

        <main style={{ flex: 1, maxWidth: '760px' }}>
          <h1 className="section-title"> Servicios disponibles </h1>
          {renderPublicaciones()}
        </main>
      </div>
    </div>
  );
}

export default Feed;