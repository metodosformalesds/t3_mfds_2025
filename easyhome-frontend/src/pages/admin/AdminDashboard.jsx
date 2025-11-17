import '../../assets/styles/AdminDashboard.css';

function AdminDashboard({ onNavigate }) {
  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-container">
        <header className="dashboard-header">
          <h1>Panel de Administración</h1>
          <p className="dashboard-subtitle">Gestiona todos los aspectos de EasyHome</p>
        </header>

        <div className="dashboard-grid">
          {/* Card de Categorías */}
          <div className="dashboard-card" onClick={() => onNavigate('categorias')}>
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-category-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4h6v6h-6zm10 0h6v6h-6zm-10 10h6v6h-6zm10 3h6m-3 -3v6" /></svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Categorías</h3>
              <p className="card-description">
                Gestiona las categorías de servicios disponibles en la plataforma
              </p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          {/* Card de Publicaciones */}
          <div className="dashboard-card" onClick={() => onNavigate('publicaciones')}>
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-briefcase"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" /><path d="M12 12l0 .01" /><path d="M3 13a20 20 0 0 0 18 0" /></svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Publicaciones</h3>
              <p className="card-description">
                Modera y gestiona las publicaciones de servicios
              </p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          {/* Card de Solicitudes de Proveedor */}
          <div className="dashboard-card" onClick={() => onNavigate('postulaciones')}>
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-user-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M16 19h6" /><path d="M19 16v6" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4" /></svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Solicitudes de Proveedor</h3>
              <p className="card-description">
                Revisa, aprueba o rechaza solicitudes de trabajadores
              </p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          {/* Card de Usuarios - Próximamente */}
          <div className="dashboard-card dashboard-card-disabled">
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Usuarios</h3>
              <p className="card-description">
                Administra usuarios, roles y permisos
              </p>
              <span className="card-badge">Próximamente</span>
            </div>
          </div>

          {/* Card de Reportes - Próximamente */}
          <div className="dashboard-card dashboard-card-disabled">
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="20" x2="12" y2="10"></line>
                <line x1="18" y1="20" x2="18" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="16"></line>
              </svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Reportes</h3>
              <p className="card-description">
                Visualiza estadísticas y reportes del sistema
              </p>
              <span className="card-badge">Próximamente</span>
            </div>
          </div>

          {/* Card de Suscripciones - Próximamente */}
          <div className="dashboard-card dashboard-card-disabled">
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Suscripciones</h3>
              <p className="card-description">
                Gestiona planes y suscripciones premium
              </p>
              <span className="card-badge">Próximamente</span>
            </div>
          </div>

          {/* Card de Configuración - Próximamente */}
          <div className="dashboard-card dashboard-card-disabled">
            <div className="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m6-12h-6m-6 0h6m6 6h-6m-6 0h6"></path>
              </svg>
            </div>
            <div className="card-content">
              <h3 className="card-title">Configuración</h3>
              <p className="card-description">
                Configura parámetros generales del sistema
              </p>
              <span className="card-badge">Próximamente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
