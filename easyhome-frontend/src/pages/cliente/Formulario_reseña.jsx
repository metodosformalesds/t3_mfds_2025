// src/pages/cliente/Formulario_reseña.jsx
import "../../assets/styles/reseñaservicio.css";
import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import reviewService from '../../services/reseñaservicio';

function ReviewPage() {
  const [generalRating, setGeneralRating] = useState(0);
  const [puntualidadRating, setPuntualidadRating] = useState(0);
  const [relacionCalidadPrecio, setRelacionCalidadPrecio] = useState(0);
  const [calidadServicio, setCalidadServicio] = useState(0);
  const [servicioInfo, setServicioInfo] = useState(null);
  const [loadingServicio, setLoadingServicio] = useState(true);
  const [comentario, setComentario] = useState('');
  const [fotos, setFotos] = useState([]);
  const [recomendacion, setRecomendacion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [idServicioContratado, setIdServicioContratado] = useState(null);

  const auth = useAuth();

  useEffect(() => {
    const cargarInfoServicio = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('id_servicio_contratado');
      
      if (id) {
        setIdServicioContratado(parseInt(id));
        
        try {
          // Cargar información del servicio desde el backend
          const info = await reviewService.getServicioInfo(parseInt(id));
          setServicioInfo(info);
        } catch (error) {
          console.error("Error al cargar información del servicio:", error);
          alert("No se pudo cargar la información del servicio. Usando datos por defecto.");
          // Datos por defecto en caso de error
          setServicioInfo({
            nombre_proveedor: "Profesional",
            nombre_servicio: "Servicio",
            fecha_contratacion: "Recientemente",
            foto_perfil: null
          });
        } finally {
          setLoadingServicio(false);
        }
      } else {
        // Si no hay ID, usar datos por defecto
        setServicioInfo({
          nombre_proveedor: "Profesional",
          nombre_servicio: "Servicio",
          fecha_contratacion: "Recientemente",
          foto_perfil: null
        });
        setLoadingServicio(false);
      }
    };
    
    cargarInfoServicio();
  }, []);

  // Verificar autenticación y carga
  if (auth.isLoading || loadingServicio) {
    return (
      <div className="review-page">
        <div className="review-card">
          <p className="loading-message">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated || !auth.user || !auth.user.profile) {
    return (
      <div className="review-page">
        <div className="review-card">
          <p className="error-message">No has iniciado sesión. Por favor inicia sesión para dejar una reseña.</p>
        </div>
      </div>
    );
  }

  const userEmail = auth.user.profile.email || '';

  // Usar datos del servicio cargados
  const profesional = servicioInfo || {
    nombre_proveedor: "Profesional",
    nombre_servicio: "Servicio",
    fecha_contratacion: "Recientemente",
    foto_perfil: null
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const fotosActuales = fotos.length;
    const espacioDisponible = 5 - fotosActuales;
    
    if (fotosActuales >= 5) {
      alert('Ya alcanzaste el límite de 5 fotos');
      return;
    }
    
    const archivosValidos = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} excede el tamaño máximo de 5MB`);
        return false;
      }
      const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!tiposPermitidos.includes(file.type)) {
        alert(`${file.name} no es un tipo de archivo válido. Solo JPG y PNG.`);
        return false;
      }
      return true;
    });
    
    const fotosAgregar = archivosValidos.slice(0, espacioDisponible);
    
    if (archivosValidos.length > espacioDisponible) {
      alert(`Solo se pueden agregar ${espacioDisponible} foto(s) más. Límite: 5 fotos`);
    }
    
    setFotos([...fotos, ...fotosAgregar]);
    e.target.value = '';
  };

  const handleSubmit = async () => {
    // Validaciones
    if (generalRating === 0) {
      alert("Por favor, selecciona una calificación general.");
      return;
    }

    if (puntualidadRating === 0 || calidadServicio === 0 || relacionCalidadPrecio === 0) {
      alert("Por favor, completa todas las calificaciones de aspectos específicos.");
      return;
    }
    
    if (recomendacion === null) {
      alert("Por favor, indica si recomendarías este profesional.");
      return;
    }

    // Usar ID del servicio contratado o valor por defecto para pruebas
    const servicioId = idServicioContratado || 1;
    
    setLoading(true);
    
    try {
      const reviewData = {
        id_servicio_contratado: servicioId,
        user_email: userEmail,
        calificacion_general: generalRating,
        calificacion_puntualidad: puntualidadRating,
        calificacion_calidad_servicio: calidadServicio,
        calificacion_calidad_precio: relacionCalidadPrecio,
        comentario: comentario || null,
        recomendacion: recomendacion ? "Sí" : "No",
        imagenes: fotos
      };

      const response = await reviewService.createReview(reviewData);

      alert(`¡Reseña publicada con éxito!\nID: ${response.id_reseña}`);
      
      // Resetear formulario
      setGeneralRating(0);
      setPuntualidadRating(0);
      setRelacionCalidadPrecio(0);
      setCalidadServicio(0);
      setComentario('');
      setFotos([]);
      setRecomendacion(null);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = '/servicios';
      }, 2000);
      
    } catch (error) {
      console.error("Error al crear la reseña:", error);

      let errorMessage = "Error desconocido.";
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          const validationErrors = error.response.data.detail
            .map((err) => `${err.loc.join('.')}: ${err.msg}`)
            .join('\n');
          errorMessage = "Error de Validación:\n" + validationErrors;
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(`Fallo al publicar la reseña:\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, setRating }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="star-button"
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill={star <= rating ? "#FBBF24" : "none"}
              stroke={star <= rating ? "#FBBF24" : "#D1D5DB"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const CircleRating = ({ rating, setRating }) => {
    return (
      <div className="circle-rating">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => setRating(num)}
            className={`circle-button ${num <= rating ? 'active' : ''}`}
          >
            {num}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="review-page">
      <div className="review-card">
        <h2 className="review-title">¿Cómo fue tu experiencia?</h2>
        <p className="review-subtitle">
          Tu opinión ayuda a otros usuarios a tomar mejores decisiones y al profesional a mejorar su servicio
        </p>

        {/* Información del Profesional */}
        <div className="profesional-info">
          <div className="profesional-avatar">
            {profesional.foto_perfil ? (
              <img 
                src={profesional.foto_perfil} 
                alt={profesional.nombre_proveedor}
                onError={(e) => {
                  // Si la imagen falla, mostrar iniciales
                  e.target.style.display = 'none';
                  if (e.target.nextElementSibling) {
                    e.target.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div 
              className="avatar-placeholder" 
              style={{
                display: profesional.foto_perfil ? 'none' : 'flex',
                width: '100%',
                height: '100%',
                backgroundColor: '#3b82f6',
                color: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              {profesional.nombre_proveedor?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'PR'}
            </div>
          </div>
          <div className="profesional-details">
            <h3>{profesional.nombre_proveedor}</h3>
            <p className="servicio">{profesional.nombre_servicio}</p>
            <p className="fecha">Contratado el {profesional.fecha_contratacion}</p>
          </div>
        </div>

        {/* Calificación General */}
        <div className="form-section">
          <h3 className="section-title">
            Calificación General <span className="required">*</span>
          </h3>
          <StarRating rating={generalRating} setRating={setGeneralRating} />
          <p className="helper-text">Selecciona una calificación</p>
        </div>

        {/* Aspectos Específicos */}
        <div className="form-section">
          <h3 className="section-title">
            Evalúa Aspectos Específicos <span className="required">*</span>
          </h3>
          
          <div className="ratings-grid">
            <div className="rating-item">
              <label>Puntualidad</label>
              <CircleRating rating={puntualidadRating} setRating={setPuntualidadRating} />
            </div>
            <div className="rating-item">
              <label>Calidad del Servicio</label>
              <CircleRating rating={calidadServicio} setRating={setCalidadServicio} />
            </div>
          </div>

          <div className="rating-item full-width">
            <label>Relación Calidad-Precio</label>
            <CircleRating rating={relacionCalidadPrecio} setRating={setRelacionCalidadPrecio} />
          </div>
        </div>