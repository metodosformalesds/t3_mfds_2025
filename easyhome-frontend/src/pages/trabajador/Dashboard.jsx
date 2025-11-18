/**
 * Autor: CRISTIAN HERIBERTO MARTINEZ GALLARDO
 * Componente: Dashboard
 * Descripción: Dashboard del trabajador con resumen y acciones.
 */
function TrabajadorDashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard del Trabajador</h1>
      <p>Bienvenido a tu panel de trabajador. Aquí podrás:</p>
      <ul>
        <li>Ver solicitudes de servicios</li>
        <li>Gestionar tus trabajos activos</li>
        <li>Ver tus ganancias</li>
        <li>Actualizar tu disponibilidad</li>
      </ul>
      <div style={{
        marginTop: '20px',
        padding: '10px',
        backgroundColor: '#d1ecf1',
        border: '1px solid #bee5eb',
        borderRadius: '4px'
      }}>
        <strong>📝 En desarrollo:</strong> El equipo implementará las funcionalidades completas.
      </div>
    </div>
  );
}

export default TrabajadorDashboard;
