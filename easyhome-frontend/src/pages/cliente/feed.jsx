
import Publicaciones from '../../components/features/Publicaciones'
import Filtros from '../../components/features/filters'
import PremiumMembers from '../../components/features/premium_members'


function Feed() {
  
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
          <Filtros />

          {/* CONTENIDO PRINCIPAL (Servicios y Publicaciones) */}
          <div style={{width: '600px', flexShrink: 0 }}> {/* Esto hace que este div ocupe el espacio restante */}
            <h1 className="section-title"> Servicios disponibles </h1>
            <Publicaciones />
          </div>
          <PremiumMembers/>
      </div>
    </div>
  );
}

export default Feed;