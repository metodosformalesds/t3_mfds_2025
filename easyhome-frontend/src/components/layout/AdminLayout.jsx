import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from '../../pages/admin/AdminDashboard';
import AdminCategories from '../../pages/admin/AdminCategories';
import AdminPublicaciones from '../../pages/admin/AdminPublicaciones';
import AdminSolicitudes from '../../pages/admin/AdminSolicitudes';
import '../../assets/styles/AdminLayout.css';

function AdminLayout() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard onNavigate={setActiveSection} />;
      case 'categorias':
        return <AdminCategories />;
      case 'publicaciones':
        return <AdminPublicaciones />;
      case 'postulaciones':
        return <AdminSolicitudes />;
      default:
        return <AdminDashboard onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="admin-content-wrapper">
        <div className="admin-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
