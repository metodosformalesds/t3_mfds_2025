import { Routes, Route } from 'react-router-dom';
import Home from '../../pages/Home';
import ProtectedRoute from './ProtectedRoute';
import Callback from '../../pages/auth/Callback';

// Páginas de autenticación (placeholder)
const Login = () => <div>Login Page</div>;
const Register = () => <div>Register Page</div>;
const Unauthorized = () => <div>No autorizado</div>;

// Páginas de Cliente (incluyendo usuarios de Google)
const ClienteDashboard = () => <div>Dashboard Cliente</div>;
const ClienteServicios = () => <div>Servicios Contratados</div>;
const ClientePerfil = () => <div>Perfil Cliente</div>;

// Páginas de Trabajador
const TrabajadorDashboard = () => <div>Dashboard Trabajador</div>;
const TrabajadorServicios = () => <div>Servicios Ofrecidos</div>;
const TrabajadorPerfil = () => <div>Perfil Trabajador</div>;

// Páginas de Admin
const AdminDashboard = () => <div>Dashboard Admin</div>;
const AdminUsuarios = () => <div>Gestión de Usuarios</div>;
const AdminReportes = () => <div>Reportes</div>;

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/callback" element={<Callback />} /> 
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Rutas de Cliente (prioridad 1 - incluye Google) */}
      <Route 
        path="/cliente/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Clientes']}>
            <ClienteDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cliente/servicios" 
        element={
          <ProtectedRoute allowedRoles={['Clientes']}>
            <ClienteServicios />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cliente/perfil" 
        element={
          <ProtectedRoute allowedRoles={['Clientes']}>
            <ClientePerfil />
          </ProtectedRoute>
        } 
      />

      {/* Rutas de Trabajador (prioridad 2) */}
      <Route 
        path="/trabajador/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Trabajadores']}>
            <TrabajadorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trabajador/servicios" 
        element={
          <ProtectedRoute allowedRoles={['Trabajadores']}>
            <TrabajadorServicios />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/trabajador/perfil" 
        element={
          <ProtectedRoute allowedRoles={['Trabajadores']}>
            <TrabajadorPerfil />
          </ProtectedRoute>
        } 
      />

      {/* Rutas de Admin */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/usuarios" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminUsuarios />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/reportes" 
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminReportes />
          </ProtectedRoute>
        } 
      />

      {/* Ruta 404 */}
      <Route path="*" element={<div>Página no encontrada</div>} />
    </Routes>
  );
};

export default AppRoutes;