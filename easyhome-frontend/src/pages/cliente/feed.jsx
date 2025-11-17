import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Publicaciones from '../../components/features/Publicaciones';
import Filtros from '../../components/features/filters';
import usePublicaciones from '../../hooks/usePublicaciones';

function Feed() {
  const navigate = useNavigate();
  const location = useLocation();

  const getFiltrosIniciales = () => {
    // 1️⃣ Filtros enviados desde Categories (logueado)
    if (location.state?.filtrosIniciales) {
      return location.state.filtrosIniciales;
    }

    // 2️⃣ Filtros guardados cuando se inició sesión
    const stored = sessionStorage.getItem('feedFiltrosAfterLogin');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        sessionStorage.removeItem('feedFiltrosAfterLogin');
        return parsed;
      } catch (e) {
        sessionStorage.removeItem('feedFiltrosAfterLogin');
      }
    }

    // 3️⃣ Filtros por defecto
    return {
      categorias: [],
      suscriptores: false,
      ordenar_por: null,
    };
  };

  const [filtrosActivos, setFiltrosActivos] = useState(getFiltrosIniciales);

  useEffect(() => {
    if (location.state?.filtrosIniciales) {
      setFiltrosActivos(location.state.filtrosIniciales);
    }
  }, [location.state]);

  const { publicaciones, isLoading, error } = usePublicaciones(filtrosActivos);

  const aplicarFiltros = (nuevosFiltros) => {
    setFiltrosActivos(nuevosFiltros);
  };

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
