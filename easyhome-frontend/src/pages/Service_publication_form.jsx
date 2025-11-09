import "../assets/styles/Service_publication_form.css"
import React, { useState, useEffect } from 'react';
import categoryService from '../services/categoryService';

function PublicarServicio() {
  const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(500);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState(''); // Para manejar la selección

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

    // Manejo de envío del formulario
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
           
            
    </div>
    );

};
export default PublicarServicio;