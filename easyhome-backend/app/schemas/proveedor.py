# app/schemas/proveedor.py

from pydantic import BaseModel, EmailStr
from typing import Optional
from decimal import Decimal

# --- Esquema de Apoyo ---
# Esto define qué campos del 'Usuario' queremos mostrar
class UsuarioPerfilSchema(BaseModel):
    correo_electronico: EmailStr
    numero_telefono: Optional[str]

    class Config:
        from_attributes = True  # Permite que Pydantic lea desde modelos SQLAlchemy

# --- Esquema Principal de Respuesta ---
# Esto define la respuesta JSON para la pestaña "Acerca de"
class ProveedorPerfilAboutSchema(BaseModel):
    # --- Datos de la tabla Proveedor_Servicio ---
    id_proveedor: int
    nombre_completo: str
    foto_perfil: Optional[str]
    biografia: Optional[str]
    especializaciones: Optional[str]
    calificacion_promedio: Optional[Decimal]
    cantidad_trabajos_realizados: int
    direccion: Optional[str]
    estado_solicitud: str  # Para verificar que sea 'aprobado'
    
    # --- Datos anidados de la tabla Usuario ---
    usuario: UsuarioPerfilSchema 

    # --- Campos Calculados (que creamos en el endpoint) ---
    total_reseñas: int = 0
    años_activo: int = 0

    class Config:
        from_attributes = True