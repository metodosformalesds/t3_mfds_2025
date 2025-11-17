import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Publicaciones from '../../components/features/Publicaciones';
import Filtros from '../../components/features/filters';
import usePublicaciones from '../../hooks/usePublicaciones';

function Feed() {
  const navigate = useNavigate();
  const location = useLocation();

  // 1️⃣ Leer filtros iniciales desde navegación (categorías.jsx)
  const filtrosIniciales = location.state?.filtrosIniciales || {
    categorias: [],
    suscriptores: false,
    ordenar_por: null,
  };

  // 2️⃣ Estado inicial corregido
  const [filtrosActivos, setFiltrosActivos] = useState(filtrosIniciales);

  // 3️⃣ Cuando vengan nuevos filtros desde navegación, aplicarlos
  useEffect(() => {
    if (location.state?.filtrosIniciales) {
      setFiltrosActivos(location.state.filtrosIniciales);
    }
  }, [location.state]);

  // 4️⃣ Hook que obtiene las publicaciones
  const { publicaciones, isLoading, error } = usePublicaciones(filtrosActivos);

  // Pasar filtros del UI → Hook
  const aplicarFiltros = (nuevosFiltros) => {
    setFiltrosActivos(nuevosFiltros);
  };

  // Navegación al perfil
  const handleVerPerfil = (publicacion) => {
    const provider = {
      id: publicacion.id_proveedor,
      nombreCompleto: publicacion.nombre_proveedor,
      fotoPerfil: publicacion.foto_perfil_proveedor,
      calificacionPromedio: publicacion.calificacion_proveedor || 0,
      totalResenas: publicacion.total_reseñas_proveedor || 0,
      oficio: publicacion.categoria || publicacion.titulo,
      descripcion: publicacion.descripcion_completa
    };

    navigate("/cliente/proveedor", { state: { provider } });
  };

  const renderPublicaciones = () => {
    if (isLoading) return <p>Cargando servicios...</p>;
    if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
    if (publicaciones.length === 0) return <p>No se encontraron publicaciones con esos filtros.</p>;

    return publicaciones.map((pub) => (
      <Publicaciones
        key={pub.id_publicacion}
        publicacionData={pub}
        onVerPerfil={() => handleVerPerfil(pub)}
      />
    ));
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
        <p style={{ color: '#333333' }}>
          Ponte al día con las actualizaciones más recientes de los profesionales de EasyHome..
        </p>
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
