from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

# ────────────────────────────────────────────────
# Entidad: Foto_Trabajo
# Referencia: SRS 3.4.2.7 (RF-06)
# Descripción: Almacena fotografías de trabajos anteriores con
# una descripción opcional para contextualizar la evidencia.
# ────────────────────────────────────────────────

class Foto_Trabajo(Base):
    __tablename__ = "foto_trabajo"

    id_foto = Column(Integer, primary_key=True, autoincrement=True, index=True)
    id_proveedor = Column(Integer, ForeignKey("proveedor_servicio.id_proveedor", ondelete="CASCADE"), nullable=False)
    url_foto = Column(String(500), nullable=False)
    descripcion = Column(Text, nullable=True)  # <- añadido
    fecha_subida = Column(TIMESTAMP, nullable=False, default=datetime.utcnow)

    # Relaciones
    proveedor_servicio = relationship("Proveedor_Servicio", back_populates="foto_trabajo")
