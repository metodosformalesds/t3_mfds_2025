
import React, { useState, useEffect } from 'react';
import '../../assets/styles/Filters.css';
import categoryService from '../../services/categoryService';

export default function Filtros({ onApplyFilters, currentFilters = {} }) {
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const busquedaPor = [
        { name: "Suscriptores", value: "suscriptores" },
        { name: "Mejor calificados", value: "mejor_calificados" },
        { name: "Más recientes", value: "mas_recientes" },
    ];

    // Cargar categorías al montar (usar el servicio compartido)
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await categoryService.getAll();
                setCategorias(data);
            } catch (error) {
                console.error("Error al cargar categorías:", error);
                setCategorias([]);
            } finally {
                setLoadingCategories(false);
            }
        };

        fetchCategorias();
    }, []);

    // Sincronizar con los filtros actuales cuando cambien externamente
    useEffect(() => {
        if (currentFilters?.categorias) {
            setSelectedCategories(currentFilters.categorias);
        }
        if (currentFilters?.ordenar_por) {
            setSelectedFilters(currentFilters.ordenar_por ? [currentFilters.ordenar_por] : []);
        }
    }, [currentFilters]);

    // Manejador para cambio de categorías
    const handleCategoryChange = (e, categoryId) => {
        const { checked } = e.target;
        if (checked) {
            setSelectedCategories([...selectedCategories, categoryId]);
        } else {
            setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
        }
    };

    // Manejador para cambio de filtros de búsqueda
    const handleFilterChange = (e, filterValue) => {
        const { checked } = e.target;
        if (checked) {
            setSelectedFilters([filterValue]);
        } else {
            setSelectedFilters([]);
        }
    };

    // Aplicar filtros y notificar al padre
    const handleApplyFilters = () => {
        const filtrosFinales = {
            categorias: selectedCategories,
            suscriptores: selectedFilters.includes("suscriptores"),
            ordenar_por: selectedFilters.includes("mejor_calificados") 
                ? "mejor_calificados"
                : selectedFilters.includes("mas_recientes")
                ? "mas_recientes"
                : null,
        };

        // Llamar a la función del padre para actualizar los filtros
        if (onApplyFilters) {
            onApplyFilters(filtrosFinales);
        }

        console.log("Filtros aplicados:", filtrosFinales);
    };

    return (
        <div className="filtro-card">
            <h2 className="filtro-titulo-principal">Filtros</h2>

            {/* Sección de Categorías */}
            <div className="filtro-seccion">
                <h3 className="filtro-titulo-seccion">Categorías</h3>
                <div className="filtro-grupo-checkbox">
                    {loadingCategories ? (
                        <p style={{ fontSize: '0.9em', color: '#999' }}>Cargando categorías...</p>
                    ) : categorias.length > 0 ? (
                        categorias.map(cat => (
                            <label key={cat.id_categoria} className="filtro-item">
                                <input
                                    type="checkbox"
                                    name="category"
                                    value={cat.id_categoria}
                                    checked={selectedCategories.includes(cat.id_categoria)}
                                    onChange={(e) => handleCategoryChange(e, cat.id_categoria)}
                                    className="filtro-checkbox"
                                />
                                <span>{cat.nombre_categoria}</span>
                            </label>
                        ))
                    ) : (
                        <p style={{ fontSize: '0.9em', color: '#999' }}>No hay categorías disponibles</p>
                    )}
                </div>
            </div>

            <hr className="filtro-separador" />

            {/* Sección de Buscar por */}
            <div className="filtro-seccion">
                <h3 className="filtro-titulo-seccion">Buscar por</h3>
                <div className="filtro-grupo-checkbox">
                    {busquedaPor.map(fil => (
                        <label key={fil.value} className="filtro-item">
                            <input
                                type="checkbox"
                                name="filter"
                                value={fil.value}
                                checked={selectedFilters.includes(fil.value)}
                                onChange={(e) => handleFilterChange(e, fil.value)}
                                className="filtro-checkbox"
                            />
                            {fil.name}
                        </label>
                    ))}
                </div>
            </div>

            {/* Botón Aplicar */}
            <button
                onClick={handleApplyFilters}
                className="filtro-boton-aplicar"
            >
                Aplicar
            </button>
        </div>
    );
}