# ────────────────────────────────────────────────────────────────
# Archivo: reporte_schemas.py
# Descripción:
#   Esquemas de validación y respuesta para el módulo de reportes.
#   Estos esquemas definen la estructura esperada para la creación
#   de reportes hacia proveedores de servicio.
#
# Basado en:
#   Entidad: Reporte_Usuario (SRS 3.4.2.16)
# ────────────────────────────────────────────────────────────────

from pydantic import BaseModel, Field

class ReporteCreate(BaseModel):
    """Datos requeridos para crear un nuevo reporte."""
    id_servicio_contratado: int = Field(..., description="ID del servicio contratado asociado al reporte")
    id_usuario_reportador: int = Field(..., description="ID del cliente que genera el reporte")
    motivo: str = Field(..., description="Motivo principal del reporte")
    descripcion: str = Field(..., description="Descripción detallada del incidente o queja")


