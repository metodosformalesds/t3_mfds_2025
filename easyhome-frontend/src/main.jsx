/**
 * Autor: CRISTIAN HERIBERTO MARTINEZ GALLARDO
 * Componente: main
 * Descripción: Punto de entrada de React y proveedor de autenticación.
 */
import React from 'react'
import { AuthProvider } from "react-oidc-context";

// 1. Importamos el userManager, indicando que está en la carpeta 'config'
// ESTA ES LA LÍNEA QUE SE CORRIGE:
import { userManager } from './config/authService';

// 2. Ya no definimos la configuración aquí.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Le pasamos el userManager directamente al AuthProvider */}
    <AuthProvider userManager={userManager}>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)