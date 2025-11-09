import "../assets/styles/Service_publication_form.css"
import React, { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';

function PublicarServicio() {
  const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(500);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(''); // Para manejar la selección

    // 3. Cargar categorías
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await categoryService.getAll();
                setCategories(data);
                // Opcional: Si quieres seleccionar la primera categoría por defecto:
                // if (data.length > 0) setSelectedCategory(data[0].id_categoria);
            } catch (err) {
                console.error("Error al cargar categorías:", err);
                // Aquí podrías agregar un estado de error si quieres mostrar un mensaje.
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategories();
    }, []); // El array vacío asegura que se ejecuta solo una vez al montar

    // 4. Manejo de envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Formulario enviado. Datos:", { minPrice, maxPrice, selectedCategory });
        //enviar los datos al servidor
    };
    
    const handleMinRangeChange = (e) => {
        const value = Number(e.target.value);
        setMinPrice(value < maxPrice ? value : maxPrice);
    };

    const handleMaxRangeChange = (e) => {
        const value = Number(e.target.value);
        setMaxPrice(value > minPrice ? value : minPrice);
    };

    return (
    <div className="form-container">
        <h2 className="form-title">Publica tu servicio</h2>
        {/* Ahora handleSubmit existe */}
        <form onSubmit={handleSubmit}>
            
            {/* Título */}
        <div className="form-group">
            <label htmlFor="titulo">Título <span className="required-star">*</span></label>
            <input type="text" id="titulo" placeholder="Título del servicio" required />
        </div>
        
        {/* Categoría */}
        <div className="form-group">
        {/* Etiqueta */}
            <label htmlFor="categoria">
                Categoría a la que pertenece el servicio <span className="required-star">*</span>
            </label>
                
            {/* Contenedor para el Select*/}
            <div className="custom-select-wrapper">
                <select 
                    id="categoria" 
                    required 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)} 
                >
                    {/* Opción deshabilitada por defecto */}
                    <option value="" disabled>Seleccione una opción</option>
                    
                    {/* Mapeo de Categorías Dinámicas */}
                    {categories.map((category) => (
                        <option 
                            key={category.id_categoria} 
                            value={category.id_categoria} 
                        >
                            {category.nombre_categoria}
                        </option>
                    ))}
                    </select>
                    <span className="select-icon">
                        <svg width="6" height="6" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L7 7L13 1" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
            </div>
        </div>
            
        {/* Descripción */}
        <div className="form-group">
            <label htmlFor="descripcion">Descripción del servicio <span className="required-star">*</span></label>
            <textarea id="descripcion" rows="4" placeholder="Ingrese la descripción del servicio" required></textarea>
        </div>
            
        {/* Subir Fotos */}
        <div className="form-group">
            <label htmlFor="fotos">Agregar fotos de referencia <span className="required-star">*</span></label>
            <div className="file-upload-box">
            <input type="file" id="fotos" multiple accept="image/jpeg, image/png" style={{ display: 'none' }} required />
            <label htmlFor="fotos" className="file-upload-label">
                <span className="upload-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M4.38852 19.3979C4.38852 19.8181 4.45136 20.2384 4.60043 20.7378L4.6434 
                    20.8794C5.27546 22.7651 7.01583 24.0317 8.9725 24.0317H26.7157L25.6151 27.5718C25.3033 28.7755 24.1907 29.5932 22.9735 
                    29.5933C22.736 29.5931 22.4992 29.5619 22.2694 29.5015L3.36899 24.3843C1.91121 23.9776 1.04247 22.4517 1.42368 20.98L4.38852 
                    10.9731V19.3979ZM27.6112 2.40674C29.2955 2.40674 30.6668 3.79377 30.6668 5.49658V19.0894C30.6668 20.7922 29.2955 22.1792 27.6112 
                    22.1792H9.27817C7.59411 22.1792 6.22252 20.7922 6.2225 19.0894V5.49658C6.22254 3.79377 7.59412 2.40674 9.27817 2.40674H27.6112ZM9.27817 
                    4.87842C8.94095 4.87842 8.66685 5.15542 8.66684 5.49658V17.1606L12.0399 13.7515C12.8747 12.9064 14.2352 12.9064 15.0711 13.7515L16.5506 
                    15.2427L21.0897 9.73389C21.4954 9.24202 22.0894 8.95821 22.7225 8.95459C23.3593 8.96924 23.9526 9.22878 24.3622 9.71436L28.2225 
                    14.269V5.49658C28.2225 5.15544 27.9487 4.87842 27.6112 4.87842H9.27817ZM12.3338 6.11377C13.6819 6.11392 14.7781 7.22263 
                    14.7782 8.58545C14.7782 9.94836 13.6819 11.057 12.3338 11.0571C10.9857 11.0571 9.88852 9.9484 9.88852 8.58545C9.88863 
                    7.22259 10.9857 6.11377 12.3338 6.11377Z" fill="#A3A3A3"/>
                    </svg>
                </span>
                            <p><b>Haz click </b>para subir fotos</p>
                <small>JPG, PNG hasta 5MB (máximo 10 fotos)</small>
            </label>
            </div>
        </div>

        {/* Rango de precio */}
        <div className="form-group">
            <label>Rango de precio por hora</label>
            <div className="price-range">
                
                {/* Input Mínimo (Min) */}
                <input 
                    type="number" 
                    value={minPrice} 
                    onChange={(e) => setMinPrice(Number(e.target.value))} 
                    className="price-input min" 
                    placeholder="Min $" 
                    min="0" 
                    max={maxPrice} 
                />
                
                <div className="separator"></div>
                
                {/* Input Máximo (Max) */}
                <input 
                    type="number" 
                    value={maxPrice} 
                    onChange={(e) => setMaxPrice(Number(e.target.value))} 
                    className="price-input max" 
                    placeholder="Max $" 
                    min={minPrice} 
                    max="1000"
                />
            </div>
        </div>
            
        {/* Publicar */}
        <button type="submit" className="submit-button">Publicar</button>
        </form>
    </div>
    );

};
export default PublicarServicio;