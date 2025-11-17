# app/schemas/proveedor.py

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from decimal import Decimal
from datetime import datetime

# -----------------------------------------------
# --- Esquemas para Endpoint 1: "Acerca de" ---
# -----------------------------------------------

class UsuarioPerfilSchema(BaseModel):
    correo_electronico: EmailStr
    numero_telefono: Optional[str]

    class Config:
        from_attributes = True  # Permite que Pydantic lea desde modelos SQLAlchemy

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

# -----------------------------------------------------------------
# --- Esquemas para Endpoint 2 ("Mis Servicios") y 3 ("Portafolio") ---
# -----------------------------------------------------------------

from pydantic import BaseModel
from typing import List, Optional

class ImagenPublicacionSchema(BaseModel):
    id_imagen: int
    url_imagen: str

    class Config:
        orm_mode = True


class PublicacionServicioSchema(BaseModel):
    id_publicacion: int
    titulo: str
    descripcion: str
    rango_precio_min: float
    rango_precio_max: float

    imagen_publicacion: List[ImagenPublicacionSchema]

    # 🔥 CAMPO QUE FALTABA
    nombre_proveedor: Optional[str]

    class Config:
        orm_mode = True


# -----------------------------------------------
# --- Esquemas para Endpoint 4: "Reseñas" ---
# -----------------------------------------------

class ImagenReseñaSchema(BaseModel):
    id_imagen_reseña: int
    url_imagen: str

    class Config:
        from_attributes = True

class ClienteReseñaSchema(BaseModel):
    id_usuario: int
    nombre: str
    
    class Config:
        from_attributes = True

class ServicioContratadoReseñaSchema(BaseModel):
    fecha_confirmacion_finalizacion: Optional[datetime]

    class Config:
        from_attributes = True

class ReseñaPublicaSchema(BaseModel):
    id_reseña: int
    calificacion_general: int
    comentario: Optional[str]
    recomendacion: str
    fecha_reseña: datetime
    
    # --- Relaciones anidadas ---
    usuario: ClienteReseñaSchema
    servicio_contratado: ServicioContratadoReseñaSchema
    imagen_reseña: List[ImagenReseñaSchema] = []

    class Config:
        from_attributes = True