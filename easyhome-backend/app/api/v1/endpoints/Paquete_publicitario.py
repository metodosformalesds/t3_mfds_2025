from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import logging

from app.core.database import get_db
from app.models.user import Usuario
from app.models.solicitud_paquete_publicitario import Solicitud_Paquete_Publicitario
from app.models.paquete_publicidad import Paquete_Publicidad
from app.services.s3_service import s3_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/publicidad", tags=["Publicidad"])


@router.post("/solicitudes", status_code=status.HTTP_201_CREATED)
async def crear_solicitud_paquete_publicitario(
    id_paquete: int = Form(..., description="ID del paquete publicitario seleccionado"),
    nombre_empresa: str = Form(...),
    informacion_empresa: str = Form(None),
    tamaño_imagen: str = Form(..., description="Ejemplo: 120x600 px"),
    formato_imagen: str = Form(..., description="Ejemplo: PNG o JPG"),
    imagen_publicitaria: UploadFile = File(..., description="Imagen de la publicidad"),
    user_email: str = Form(..., description="Correo electrónico del usuario autenticado"),
    db: Session = Depends(get_db)
):
   
    try:
        usuario = db.query(Usuario).filter(Usuario.correo_electronico == user_email).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")

        paquete = db.query(Paquete_Publicidad).filter(Paquete_Publicidad.id_paquete == id_paquete).first()
        if not paquete:
            raise HTTPException(status_code=404, detail="El paquete publicitario no existe.")

        extension = imagen_publicitaria.filename.split('.')[-1] if '.' in imagen_publicitaria.filename else 'jpg'
        s3_key = f"publicidad/solicitudes/{uuid.uuid4()}.{extension}"

        s3_service.upload_file(
            file_obj=imagen_publicitaria.file,
            object_name=s3_key,
            content_type=imagen_publicitaria.content_type
        )

        nueva_solicitud = Solicitud_Paquete_Publicitario(
            id_usuario=usuario.id_usuario,
            id_paquete=id_paquete,
            nombre_empresa=nombre_empresa,
            informacion_empresa=informacion_empresa,
            url_imagen_publicitaria=s3_key,
            tamaño_imagen=tamaño_imagen,
            formato_imagen=formato_imagen,
            estado_solicitud="pendiente",
            fecha_solicitud=datetime.utcnow()
        )

        db.add(nueva_solicitud)
        db.commit()
        db.refresh(nueva_solicitud)

        return {
            "message": "Solicitud de paquete publicitario enviada exitosamente.",
            "id_solicitud_publicidad": nueva_solicitud.id_solicitud_publicidad,
            "estado": nueva_solicitud.estado_solicitud,
            "fecha_solicitud": nueva_solicitud.fecha_solicitud,
            "imagen_key": nueva_solicitud.url_imagen_publicitaria
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear solicitud publicitaria: {e}")
        raise HTTPException(status_code=500, detail="Error interno al crear la solicitud.")
