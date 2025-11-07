# app/api/v1/endpoints/perfil_usuario.py

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import Usuario
from app.services.s3_service import s3_service
import logging

router = APIRouter(
    prefix="/usuarios",
    tags=["Perfil Usuario"]
)

logger = logging.getLogger(__name__)


# -----------------------------------------------------------------
# 1️⃣ Subir o actualizar foto de perfil
# -----------------------------------------------------------------
@router.put("/{id_usuario}/foto-perfil")
async def actualizar_foto_perfil(
    id_usuario: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Sube una nueva foto de perfil a S3 y actualiza la referencia en la base de datos.
    (Usa la carpeta profile-images del bucket existente)
    """
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    try:
        # Generar la ruta del objeto en S3
        s3_key = f"profile-images/{id_usuario}_{file.filename}"

        # Subir archivo a S3
        uploaded_key = s3_service.upload_file(
            file_obj=file.file,
            object_name=s3_key,
            content_type=file.content_type
        )

        # Guardar key en la BD
        usuario.foto_perfil = uploaded_key
        db.commit()
        db.refresh(usuario)

        # Generar URL firmada temporal
        presigned_url = s3_service.get_presigned_url(uploaded_key)

        logger.info(f"Foto de perfil actualizada para usuario {id_usuario}")
        return {
            "message": "Foto de perfil actualizada correctamente",
            "foto_perfil_url": presigned_url
        }

    except Exception as e:
        logger.error(f"Error al subir o actualizar foto de perfil: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al subir la foto de perfil"
        )


# -----------------------------------------------------------------
# 2️⃣ Obtener foto de perfil
# -----------------------------------------------------------------
@router.get("/{id_usuario}/foto-perfil")
def obtener_foto_perfil(id_usuario: int, db: Session = Depends(get_db)):
    """
    Devuelve la URL firmada de la foto de perfil del usuario si existe.
    """
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario or not usuario.foto_perfil:
        raise HTTPException(status_code=404, detail="Foto de perfil no encontrada")

    presigned_url = s3_service.get_presigned_url(usuario.foto_perfil)
    return {"foto_perfil_url": presigned_url}

