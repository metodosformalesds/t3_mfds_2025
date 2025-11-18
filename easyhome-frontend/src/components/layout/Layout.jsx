/**
 * Autor: CRISTIAN HERIBERTO MARTINEZ GALLARDO
 * Componente: Layout
 * Descripción: Muestra un producto individual con imagen, precio y botón de agregar.
 */
import Header from './Header'
import Footer from './Footer'

function Layout({ children }) {
  return (
    <div className="app-container">
      <Header />
      <main className="app-main">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout
