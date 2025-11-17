import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Categories.css';
import categoryService from '../../services/categoryService';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err) {
        setError(err.detail || err.message || 'Error al cargar las categorías');
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
        <h2 className="categories-title">Categorías</h2>
        
        <div className="categories-list">
          {categories.map((category, index) => (
            <div 
              key={category.id_categoria} 
              className={`category-item ${index % 2 === 0 ? 'category-left-icon' : 'category-right-icon'}`}
            >
              <div className="category-icon-wrapper">
                {category.icono_url ? (
                  <div className="category-icon">
                    <img src={category.icono_url} alt={category.nombre_categoria} />
                  </div>
                ) : (
                  <div className="category-icon category-icon-placeholder">
                    <span>🔧</span>
                  </div>
                )}
              </div>
              
              <div className="category-content">
                <h3 className="category-name">{category.nombre_categoria}</h3>
                {category.descripcion && (
                  <p className="category-description">{category.descripcion}</p>
                )}

                {/* 🔥 REDIRECCIÓN CON FILTRO */}
                <button
                  className="category-link"
                  onClick={() =>
                    navigate("/publicaciones", {
                      state: {
                        filtrosIniciales: {
                          categorias: [category.id_categoria],
                          suscriptores: false,
                          ordenar_por: null
                        }
                      }
                    })
                  }
                >
                  Ver publicaciones ›
                </button>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
