import "../assets/styles/Service_publication_form.css"
import React, { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';
import { useAuth } from 'react-oidc-context';
import servicePublicationService from '../services/servicePublicationService';


function PublicarServicio() {
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(500);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [titulo, setTitulo] = useState(''); 
    const [descripcion, setDescripcion] = useState(''); 
    const [fotos, setFotos] = useState([]);
    
    const auth = useAuth();
    if (auth.isLoading) {
    return <p>Cargando autenticación...</p>;
    }

    if (!auth.isAuthenticated || !auth.user || !auth.user.profile) {
    return <p>No has iniciado sesión. Por favor inicia sesión para publicar un servicio.</p>;
    }

    const userEmail = auth.user.profile.email || '';

     //Cargar categorías existentes

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAll();
                setCategories(data);
            } catch (err) {
                console.error("Error al cargar categorías:", err);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();

    }, []); // El array vacío asegura que se ejecuta solo una vez al montar


    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const fotosActuales = fotos.length;
        const espacioDisponible = 10 - fotosActuales;
        
        // Validar que no exceda el límite de 10 fotos
        if (fotosActuales >= 10) {
            alert('Ya alcanzaste el límite de 10 fotos');
            return;
        }
        
        // Validar tamaño (5MB por archivo)
        const archivosValidos = files.filter(file => {
            if (file.size > 5 * 1024 * 1024) {
                alert(`${file.name} excede el tamaño máximo de 5MB`);
                return false;
            }
            return true;
        });
        
        // Tomar las fotos que caben dentro del límite
        const fotosAgregar = archivosValidos.slice(0, espacioDisponible);
        
        if (archivosValidos.length > espacioDisponible) {
            alert(`Solo se pueden agregar ${espacioDisponible} foto(s) más. Límite: 10 fotos`);
        }
        
        setFotos([...fotos, ...fotosAgregar]);
        
        e.target.value = '';
    };

    // Manejo de envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("auth.user.profile:", auth.user?.profile);

        if (!userEmail) {
            alert("Error: El usuario no está autenticado o el email no se pudo extraer.");
            return;
        }
        if (selectedCategory === '' || fotos.length === 0) {
            alert("Error: Por favor, selecciona una categoría y al menos una foto.");
            return;
        }

        // 1. Crear el objeto FormData
        const formData = new FormData();
        
        // 2. Asegurar el tipo y el valor para FastAPI 
        formData.append("user_email", auth?.user?.profile?.email);
        formData.append("titulo", titulo);
        
        // Convertir números a string para FormData antes de enviar
        formData.append("id_categoria", String(selectedCategory)); 
        formData.append("descripcion", descripcion);
        formData.append("rango_precio_min", String(minPrice));
        formData.append("rango_precio_max", String(maxPrice));
        
        console.log("Enviando publicación con email:", auth?.user?.profile?.email);

        // 3. Adjuntar las fotos (List[UploadFile])
        fotos.forEach(file => {
            formData.append("fotos", file);
        });
        
        try {
            const response = await servicePublicationService.createPublication(formData);
            console.log("Publicación exitosa:", response);
            alert(`Servicio "${response.titulo}" publicado con éxito.`);
        } catch (error) {
            let errorMessage = "Error desconocido.";
            if (error.response && error.response.data && Array.isArray(error.response.data.detail)) {
                const validationErrors = error.response.data.detail.map(err => {
                    return `${err.loc.join('.')}: ${err.msg}`;
                }).join('\n');
                errorMessage = "Error de Validación (422):\n" + validationErrors;
            } else if (error.message) {
                 errorMessage = error.message;
            }
            console.error("Error final:", errorMessage, error);
            alert(`FALLO DE ENVÍO:\n${errorMessage}`);
        }
    };
    
    const handleMinRangeChange = (e) => {
    const value = Number(e.target.value);
    if (value <= maxPrice) setMinPrice(value);
    };

    const handleMaxRangeChange = (e) => {
    const value = Number(e.target.value);
    if (value >= minPrice) setMaxPrice(value);
    };

    return (
    <div className="form-container">
        <h2 className="form-title">Publica tu servicio</h2>
        <form onSubmit={handleSubmit}>
            
            {/* Título */}
            <div className="form-group">
                <label htmlFor="titulo">Título <span className="required-star">*</span></label>
                <input 
                    type="text" 
                    id="titulo" 
                    placeholder="Título del servicio" 
                    value={titulo} 
                    onChange={(e) => setTitulo(e.target.value)} 
                    required 
                />
            </div>
            
            {/* Categoría */}
            <div className="form-group">
                <label htmlFor="categoria">
                    Categoría a la que pertenece el servicio <span className="required-star">*</span>
                </label>
                <div className="custom-select-wrapper">
                    <select 
                        id="categoria" 
                        required 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)} 
                    >
                        <option value="" disabled>Seleccione una opción</option>
                        {categories.map((category) => (
                            <option 
                                key={category.id_categoria} 
                                value={category.id_categoria} 
                            >
                                {category.nombre_categoria}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            
            {/* Descripción*/}
            <div className="form-group">
                <label htmlFor="descripcion">Descripción del servicio <span className="required-star">*</span></label>
                <textarea 
                    id="descripcion" 
                    rows="4" 
                    placeholder="Ingrese la descripción del servicio" 
                    value={descripcion} 
                    onChange={(e) => setDescripcion(e.target.value)} 
                    required>
                </textarea>
            </div>
            
            {/* Subir Fotos */}
    
            <div className="form-group">
                <label htmlFor="fotos">Agregar fotos de referencia 
                    {fotos.length > 0 && 
                    <span style={{ marginLeft: '10px', color: '#16394f', fontWeight: 'bold' }}>
                        ({fotos.length} seleccionada{fotos.length > 1 ? 's' : ''})
                    </span>
                    }
                    <span className="required-star">*</span>
                </label>
                
                <div className="file-upload-box">
                    <input type="file" id="fotos" multiple accept="image/jpeg, image/png" style={{ display: 'none' }} 
                        required onChange={handleFileChange} disabled={fotos.length >= 10}
                    />
                    <label htmlFor="fotos" className={`file-upload-label ${fotos.length >= 10 ? 'disabled' : ''}`}>
                        {/* ... SVG Icon ... */}
                        <p><b>Haz click </b>para subir fotos</p>
                        {fotos.length >= 10 ? (
                            <small style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                                Límite alcanzado (10/10 fotos)
                            </small>
                        ) : (
                            <small>JPG, PNG hasta 5MB (máximo 10 fotos)</small>
                        )}
                    </label>
                </div>

                {/* Preview de las fotos seleccionadas */}
                {fotos.length > 0 && (
                    <div className="photo-previews-container">
                        <div className="photo-previews-grid">
                            {fotos.map((foto, index) => (
                                <div key={index} className="photo-preview-card">
                                    <img src={URL.createObjectURL(foto)} alt={`Preview ${index + 1}`} className="photo-preview-image"/>
                                    <div className="photo-preview-info">
                                        <div className="photo-preview-name" title={foto.name}>{foto.name}</div>
                                        <div className="photo-preview-size">{(foto.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => { const newFotos = fotos.filter((_, i) => i !== index);
                                            setFotos(newFotos);}} className="photo-preview-delete"
                                            title="Eliminar foto"> × </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Rango de precio*/}
            <div className="form-group">
                <label>Rango de precio por hora</label>
                <div className="price-range">
                    
                    {/* Input Mínimo (Min) */}
                    <input type="number" value={minPrice} onChange={handleMinRangeChange} className="price-input min" 
                        placeholder="Min $" />
                    <div className="separator"></div>
                    {/* Input Máximo (Max) */}
                    <input type="number" value={maxPrice} onChange={handleMaxRangeChange} className="price-input max" 
                        placeholder="Max $" />
                </div>
            </div>
            
            {/* Publicar */}
            <button type="submit" className="submit-button">Publicar</button>
        </form>
    </div>
    );

};
export default PublicarServicio;