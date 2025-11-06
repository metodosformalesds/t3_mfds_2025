import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function CambiarDatos({ userData, splitName, calculateAge }) {
  const { nombres: nombresIniciales, apellidos: apellidosIniciales } = splitName(userData.nombre);
  const edadCalculada = calculateAge(userData.fecha_nacimiento);

  const [formData, setFormData] = useState({
    nombres: nombresIniciales,
    apellidos: apellidosIniciales,
    edad: edadCalculada || '',
    telefono: userData.numero_telefono || '',
    email: userData.correo_electronico || '',
    fotoPerfil: null
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const { nombres, apellidos } = splitName(userData.nombre);
    setFormData(prev => ({
      ...prev,
      nombres,
      apellidos,
      edad: calculateAge(userData.fecha_nacimiento) || '',
      telefono: userData.numero_telefono || '',
      email: userData.correo_electronico || ''
    }));
  }, [userData, splitName, calculateAge]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, fotoPerfil: file }));
      
      // Preview de la imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);

    try {
      // Aquí iría la lógica para actualizar el backend
      // Por ahora solo simulamos el guardado
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMensaje({ type: 'success', text: 'Datos actualizados correctamente' });
    } catch (error) {
      setMensaje({ type: 'error', text: 'Error al guardar los datos' });
    } finally {
      setGuardando(false);
    }
  };

  const handleCambiarContrasena = () => {
    // Aquí iría la lógica para cambiar contraseña
    alert('Funcionalidad de cambiar contraseña próximamente');
  };

  return (
    <div className="cambiar-datos-container">
      <h2>Cambiar Datos</h2>

      {mensaje && (
        <div className={`mensaje ${mensaje.type}`}>
          {mensaje.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="datos-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="nombres">Nombres *</label>
            <input
              type="text"
              id="nombres"
              name="nombres"
              value={formData.nombres}
              onChange={handleInputChange}
              placeholder="Pon aquí tus nombres..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="apellidos">Apellido</label>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleInputChange}
              placeholder="Pon aquí tu apellido..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="edad">Edad</label>
            <input
              type="number"
              id="edad"
              name="edad"
              value={formData.edad}
              onChange={handleInputChange}
              placeholder="Pon aquí tu edad..."
              min="18"
              max="120"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group form-group-password">
            <label htmlFor="contrasena">Contraseña</label>
            <div className="password-field">
              <button
                type="button"
                className="btn-cambiar-contrasena"
                onClick={handleCambiarContrasena}
              >
                Cambiar contraseña
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="fotoPerfil">Foto de perfil</label>
            <div className="foto-input-container">
              <input
                type="file"
                id="fotoPerfil"
                name="fotoPerfil"
                onChange={handleFotoChange}
                accept="image/*"
                className="foto-input"
              />
              <label htmlFor="fotoPerfil" className="foto-label">
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="foto-preview" />
                ) : (
                  <>
                    <i className="icon">📁</i>
                    <span>Fotodeperfil1.jpg</span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-guardar" disabled={guardando}>
            {guardando ? 'Guardando...' : 'GUARDAR'}
            <i className="icon">💾</i>
          </button>
        </div>
      </form>
    </div>
  );
}

CambiarDatos.propTypes = {
  userData: PropTypes.object.isRequired,
  splitName: PropTypes.func.isRequired,
  calculateAge: PropTypes.func.isRequired
};

export default CambiarDatos;
