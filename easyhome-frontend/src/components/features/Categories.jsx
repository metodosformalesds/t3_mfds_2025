import { useState, useEffect } from 'react';
import '../../assets/styles/Categories.css';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/categories/');
        if (!response.ok) {
          throw new Error('Error al cargar las categorías');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="categories-loading">Cargando categorías...</div>;
  }

  if (error) {
    return <div className="categories-error">Error: {error}</div>;
  }

  return (
    <section className="categories-section">
      <div className="categories-container">
        <h2 className="categories-title">Categorías de Servicios</h2>
        <p className="categories-subtitle">Encuentra el servicio que necesitas</p>
        
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id_categoria} className="category-card">
              {category.icono_url && (
                <div className="category-icon">
                  <img src={category.icono_url} alt={category.nombre_categoria} />
                </div>
              )}
              <h3 className="category-name">{category.nombre_categoria}</h3>
              {category.descripcion && (
                <p className="category-description">{category.descripcion}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
