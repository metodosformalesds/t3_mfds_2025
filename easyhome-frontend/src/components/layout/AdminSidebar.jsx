/**
 * Autor: CRISTIAN HERIBERTO MARTINEZ GALLARDO
 * Componente: AdminSidebar
 * Descripción: Muestra un producto individual con imagen, precio y botón de agregar.
 */
import { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useUserProfile } from '../../hooks/useUserProfile';
import '../../assets/styles/AdminSidebar.css';

function AdminSidebar({ activeSection, onSectionChange }) {
  const auth = useAuth();
  const { userData, getProfilePhotoUrl } = useUserProfile();
  const [profilePhoto, setProfilePhoto] = useState(null);

  useEffect(() => {
    const loadProfilePhoto = async () => {
      if (userData?.id_usuario) {
        const result = await getProfilePhotoUrl();
        if (result.success) {
          setProfilePhoto(result.url);
        }
      }
    };

    loadProfilePhoto();
  }, [userData?.id_usuario]);

  const handleLogout = () => {
    const clientId = "478qnp7vk39jamq13sl8k4sp7t";
    const logoutUri = "https://main.d30cfshgj52c8r.amplifyapp.com";
    const cognitoDomain = "https://us-east-1gbsgbtrls.auth.us-east-1.amazoncognito.com";

    auth.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userName = userData?.nombre || auth.user?.profile?.name || auth.user?.profile?.email || 'Admin';
  const firstName = userName.split(' ')[0];

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
      )
    },
    {
      id: 'categorias',
      label: 'Categorías',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-category-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4h6v6h-6zm10 0h6v6h-6zm-10 10h6v6h-6zm10 3h6m-3 -3v6" /></svg>
      )
    },
    {
      id: 'publicaciones',
      label: 'Publicaciones',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-briefcase"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" /><path d="M12 12l0 .01" /><path d="M3 13a20 20 0 0 0 18 0" /></svg>
      )
    },
    {
      id: 'postulaciones',
      label: 'Postulaciones',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-user-plus"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M16 19h6" /><path d="M19 16v6" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4" /></svg>
      )
    }
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo">
        </div>
      </div>

      <div className="admin-user-info">
        <div className="admin-user-avatar">
          {profilePhoto ? (
            <img src={profilePhoto} alt={userName} />
          ) : (
            <div className="admin-avatar-initials">
              {getInitials(userName)}
            </div>
          )}
        </div>
        <div className="admin-user-details">
          <p className="admin-welcome">Bienvenido</p>
          <h3 className="admin-user-name">{firstName}</h3>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        <ul className="admin-menu">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`admin-menu-item ${activeSection === item.id ? 'active' : ''}`}
                onClick={() => onSectionChange(item.id)}
              >
                <span className="admin-menu-icon">{item.icon}</span>
                <span className="admin-menu-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-logout-btn" onClick={handleLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
