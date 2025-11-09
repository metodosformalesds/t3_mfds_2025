
import Publicaciones from '../../components/features/Publicaciones'

function feed() {
  return (
    <div style={{ padding: '20px' }}>
      {/* 1. Título principal: Color establecido a negro (#000) */}
      <h1 style={{ color: '#000000' }}>Publicaciones</h1> 
      
      {/* 2. Párrafo: Color establecido a un gris oscuro (#333) para mejor legibilidad */}
      <p style={{ color: '#000000' }}>Ponte al día con las actualizaciones más recientes de los profesionales de EayHome..</p>
      
      <div style={{
        marginTop: '20px',
        padding: '10px',
        borderRadius: '4px'
      }}>

        <h1> Servicios disponibles </h1>

        <Publicaciones />
      </div>
    </div>
  );
}

export default feed;