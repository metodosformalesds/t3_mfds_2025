# app/schemas/proveedor.py

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

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

# ... (Al final del archivo, después de ProveedorPerfilAboutSchema) ...

# --- Esquema para las imágenes de una publicación ---
class ImagenPublicacionSchema(BaseModel):
    id_imagen: int
    url_imagen: str
    orden: Optional[int]

    class Config:
        from_attributes = True

# --- Esquema para cada item de la lista "Mis Servicios" ---
class PublicacionServicioSchema(BaseModel):
    id_publicacion: int
    id_proveedor: int
    id_categoria: int
    titulo: str
    descripcion: str
    rango_precio_min: Decimal
    rango_precio_max: Decimal
    fecha_publicacion: datetime
    estado: str
    vistas: int
    
    # --- Relación anidada ---
    # Aquí cargaremos la lista de imágenes
    imagen_publicacion: List[ImagenPublicacionSchema] = []

    class Config:
        from_attributes = True