from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import Usuario
from app.services.s3_service import s3_service
import logging
import io  ### CAMBIO: Importar 'io' para el buffer en memoria

router = APIRouter(
    prefix="/usuarios",
    tags=["Perfil Usuario"]
)

logger = logging.getLogger(__name__)

# Configuración de validación
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def validate_image_file(file: UploadFile, file_size: int): ### CAMBIO: Recibe file_size
    """
    Valida que el archivo sea una imagen válida
    """
    # Validar extensión
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nombre de archivo inválido"
        )

    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de archivo no permitido. Permitidos: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Validar content type
    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser una imagen"
        )

    ### CAMBIO: Se elimina el bloque seek/tell. La validación de tamaño se hace ahora con file_size
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Archivo muy grande. Tamaño máximo: {MAX_FILE_SIZE // (1024*1024)}MB"
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo está vacío"
        )


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
    
    Validaciones:
    - Formatos permitidos: JPG, JPEG, PNG, GIF, WEBP
    - Tamaño máximo: 5MB
    """
    # Validar que el usuario exista
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    ### CAMBIO: Leer el archivo en memoria UNA SOLA VEZ
    try:
        file_contents = await file.read()
        file_size = len(file_contents)
    except Exception as e:
        logger.error(f"Error al leer el archivo: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo leer el archivo"
        )

    # Validar archivo de imagen (pasando el tamaño)
    validate_image_file(file, file_size)

    try:
        # Si ya tiene una foto, eliminar la anterior de S3
        if usuario.foto_perfil:
            try:
                s3_service.delete_file(usuario.foto_perfil)
                logger.info(f"Foto anterior eliminada: {usuario.foto_perfil}")
            except Exception as e:
                logger.warning(f"No se pudo eliminar foto anterior: {e}")

        # Generar la ruta del objeto en S3
        file_extension = file.filename.split('.')[-1].lower()
        # Genera un nombre de archivo único para evitar colisiones
        s3_key = f"profile-images/{id_usuario}_{file.filename}"

        ### CAMBIO: Subir el archivo desde el buffer de memoria (BytesIO)
        try:
            with io.BytesIO(file_contents) as file_obj:
                uploaded_key = s3_service.upload_file(
                    file_obj=file_obj,
                    object_name=s3_key,
                    content_type=file.content_type
                )
        except Exception as upload_error:
            logger.error(f"Error en s3_service.upload_file: {upload_error}")
            raise HTTPException(status_code=500, detail="Error al contactar S3")


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

    except HTTPException:
        raise
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


# -----------------------------------------------------------------
# 3️⃣ Eliminar foto de perfil
# -----------------------------------------------------------------
@router.delete("/{id_usuario}/foto-perfil")
def eliminar_foto_perfil(id_usuario: int, db: Session = Depends(get_db)):
    """
    Elimina la foto de perfil del usuario tanto de S3 como de la base de datos.
    """
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario or not usuario.foto_perfil:
        raise HTTPException(status_code=404, detail="Foto de perfil no encontrada")

    try:
        s3_service.delete_file(usuario.foto_perfil)
        usuario.foto_perfil = None
        db.commit()
        logger.info(f"Foto de perfil eliminada para usuario {id_usuario}")
        return {"message": "Foto de perfil eliminada correctamente"}
    except Exception as e:
        logger.error(f"Error al eliminar foto de perfil: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al eliminar la foto de perfil"
        )