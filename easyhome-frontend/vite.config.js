import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Usar ruta relativa para que los assets referenciados en producción
  // no dependan de la raíz absoluta del dominio. Esto evita que
  // el servidor devuelva `index.html` (MIME `text/html`) cuando
  // una ruta de asset no se resuelva correctamente.
  base: './',
})
