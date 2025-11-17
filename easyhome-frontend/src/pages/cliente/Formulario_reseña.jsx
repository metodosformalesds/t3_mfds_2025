// src/pages/cliente/Formulario_reseña.jsx
import "../../assets/styles/reseñaservicio.css";
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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

      // Navegar a la sección de Reseñas, pasando la nueva reseña para vista previa
      const newReview = {
        reseña: {
          id_reseña: response.id_reseña,
          comentario: comentario || '',
          calificacion_general: generalRating,
          calificacion_puntualidad: puntualidadRating,
          calificacion_calidad_servicio: calidadServicio,
          calificacion_calidad_precio: relacionCalidadPrecio,
          fecha_reseña: new Date().toISOString(),
        },
        cliente: {
          email: userEmail,
        },
        proveedor: {
          nombre: (servicioInfo && servicioInfo.nombre_proveedor) || 'Proveedor',
          servicio: (servicioInfo && servicioInfo.nombre_servicio) || 'Servicio',
          foto_perfil: (servicioInfo && servicioInfo.foto_perfil) || null,
        },
        baseImageUrl: '',
      };

      navigate('/perfil', { state: { goToTab: 'resenasRealizadas', newReview } });
      
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

        {/* Comentario */}
        <div className="form-section">
          <label className="section-title">Cuéntanos sobre tu Experiencia</label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Describe en detalle tu experiencia: ¿Qué te gustó más? ¿Qué podría mejorar? ¿Recomendarías este servicio?"
            className="comentario-textarea"
            rows="5"
          />
        </div>

        {/* Fotos */}
        <div className="form-section">
          <label className="section-title">
            Agregar Fotos (Opcional)
            {fotos.length > 0 && (
              <span className="photo-count"> ({fotos.length} seleccionada{fotos.length > 1 ? 's' : ''})</span>
            )}
          </label>
          
          <div className="file-upload-area">
            <input
              type="file"
              id="fotos-review"
              multiple
              accept="image/jpeg, image/png, image/jpg"
              onChange={handleFileChange}
              disabled={fotos.length >= 5}
              className="file-input-hidden"
            />
            <label
              htmlFor="fotos-review"
              className={`file-upload-label ${fotos.length >= 5 ? 'disabled' : ''}`}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <p className="upload-text">Haz click para subir fotos</p>
              <p className="upload-info">
                {fotos.length >= 5 
                  ? 'Límite alcanzado (5/5 fotos)'
                  : 'JPG, PNG hasta 5MB (máximo 5 fotos)'
                }
              </p>
            </label>
          </div>

          {fotos.length > 0 && (
            <div className="photo-previews">
              {fotos.map((foto, index) => (
                <div key={index} className="photo-preview-item">
                  <img src={URL.createObjectURL(foto)} alt={`Preview ${index + 1}`} />
                  <div className="photo-size">{(foto.size / 1024).toFixed(1)} KB</div>
                  <button
                    type="button"
                    onClick={() => setFotos(fotos.filter((_, i) => i !== index))}
                    className="photo-delete"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
 {/* Recomendación */}
        <div className="form-section">
          <label className="section-title">
            ¿Recomendarías este Profesional? <span className="required">*</span>
          </label>
          <div className="recommendation-buttons">
            <button
              type="button"
              onClick={() => setRecomendacion(true)}
              className={`recommendation-btn ${recomendacion === true ? 'active-yes' : ''}`}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
              <span>Sí, lo recomiendo</span>
            </button>
            
            <button
              type="button"
              onClick={() => setRecomendacion(false)}
              className={`recommendation-btn ${recomendacion === false ? 'active-no' : ''}`}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
              </svg>
              <span>No lo recomiendo</span>
            </button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="action-buttons">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Estás seguro de que deseas cancelar?')) {
                window.history.back();
              }
            }}
            disabled={loading}
            className="btn-cancel"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-submit"
          >
            {loading ? 'Enviando...' : 'Publicar Reseña'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReviewPage;
       