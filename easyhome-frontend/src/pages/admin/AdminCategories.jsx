import { useState, useEffect } from 'react';
import '../../assets/styles/AdminCategories.css';
import categoryService from '../../services/categoryService';

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre_categoria: '',
    descripcion: '',
    icono_url: '',
    orden_visualizacion: 1
  });

  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err.detail || err.message || 'Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'orden_visualizacion' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(false);

    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id_categoria, formData);
      } else {
        await categoryService.create(formData);
      }

      setFormSuccess(true);
      setFormData({
        nombre_categoria: '',
        descripcion: '',
        icono_url: '',
        orden_visualizacion: 1
      });
      setEditingCategory(null);
      
      // Recargar categorías
      await fetchCategories();
      
      // Ocultar formulario después de 2 segundos
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess(false);
      }, 2000);

    } catch (err) {
      setFormError(err.detail || err.message || 'Error al guardar la categoría');
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    if (!window.confirm(`¿Estás seguro de eliminar la categoría "${categoryName}"?`)) {
      return;
    }

    try {
      await categoryService.delete(categoryId);
      // Recargar categorías
      await fetchCategories();
    } catch (err) {
      alert(`Error: ${err.detail || err.message || 'Error al eliminar la categoría'}`);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      nombre_categoria: category.nombre_categoria,
      descripcion: category.descripcion || '',
      icono_url: category.icono_url || '',
      orden_visualizacion: category.orden_visualizacion
    });
    setShowForm(true);
    setFormError(null);
    setFormSuccess(false);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setFormData({
      nombre_categoria: '',
      descripcion: '',
      icono_url: '',
      orden_visualizacion: 1
    });
    setShowForm(false);
    setFormError(null);
    setFormSuccess(false);
  };

  if (loading) {
    return <div className="admin-loading">Cargando...</div>;
  }

  return (
    <div className="admin-categories">
      <div className="admin-header">
        <h1>Gestión de Categorías</h1>
        <button 
          className="btn-add-category"
          onClick={() => {
            if (showForm && editingCategory) {
              handleCancelEdit();
            } else {
              setShowForm(!showForm);
              setEditingCategory(null);
              setFormData({
                nombre_categoria: '',
                descripcion: '',
                icono_url: '',
                orden_visualizacion: 1
              });
            }
          }}
        >
          {showForm ? 'Cancelar' : '+ Nueva Categoría'}
        </button>
      </div>

      {showForm && (
        <div className="category-form-container">
          <h2>{editingCategory ? 'Editar Categoría' : 'Crear Nueva Categoría'}</h2>
          <form onSubmit={handleSubmit} className="category-form">
            <div className="form-group">
              <label htmlFor="nombre_categoria">Nombre de la Categoría *</label>
              <input
                type="text"
                id="nombre_categoria"
                name="nombre_categoria"
                value={formData.nombre_categoria}
                onChange={handleInputChange}
                required
                placeholder="Ej: Plomería, Electricidad, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows="3"
                placeholder="Descripción de la categoría (opcional)"
              />
            </div>

            <div className="form-group">
              <label htmlFor="icono_url">URL del Icono</label>
              <input
                type="url"
                id="icono_url"
                name="icono_url"
                value={formData.icono_url}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/icono.png"
              />
            </div>

            <div className="form-group">
              <label htmlFor="orden_visualizacion">Orden de Visualización</label>
              <input
                type="number"
                id="orden_visualizacion"
                name="orden_visualizacion"
                value={formData.orden_visualizacion}
                onChange={handleInputChange}
                min="1"
              />
            </div>

            {formError && (
              <div className="form-error">{formError}</div>
            )}

            {formSuccess && (
              <div className="form-success">
                {editingCategory ? '¡Categoría actualizada exitosamente!' : '¡Categoría creada exitosamente!'}
              </div>
            )}

            <div className="form-buttons">
              <button type="submit" className="btn-submit">
                {editingCategory ? 'Actualizar Categoría' : 'Crear Categoría'}
              </button>
              {editingCategory && (
                <button type="button" className="btn-cancel" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="categories-list">
        <h2>Categorías Existentes ({categories.length})</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {categories.length === 0 ? (
          <p className="no-categories">No hay categorías registradas</p>
        ) : (
          <div className="categories-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Icono</th>
                  <th>Orden</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id_categoria}>
                    <td>{category.id_categoria}</td>
                    <td className="category-name">{category.nombre_categoria}</td>
                    <td className="category-desc">
                      {category.descripcion || '-'}
                    </td>
                    <td>
                      {category.icono_url ? (
                        <img 
                          src={category.icono_url} 
                          alt={category.nombre_categoria}
                          className="category-icon-preview"
                        />
                      ) : '-'}
                    </td>
                    <td>{category.orden_visualizacion}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(category)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(category.id_categoria, category.nombre_categoria)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCategories;
