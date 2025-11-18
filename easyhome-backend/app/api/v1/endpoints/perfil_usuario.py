# Autor: ENRIQUE ALEJANDRO PEREDA MERAZ

# Fecha: 07/11/2025

# Descripción: define la capa de la API responsable de gestionar las fotos de perfil de los usuarios. Proporciona endpoints para subir, obtener y eliminar fotos de perfil, interactuando con el servicio de almacenamiento S3 y la base de datos a través de SQLAlchemy.
# app/api/v1/endpoints/perfil_usuario.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import Usuario
from app.services.s3_service import s3_service
import logging
import io

router = APIRouter(
    prefix="/usuarios",
    tags=["Perfil Usuario"]
)

logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024


def validate_image_file(file: UploadFile, file_size: int):
    """
    Autor: Enrique Alejandro Pereda Meraz
    Descripción: Valida que el archivo subido sea una imagen válida y cumpla
    con las restricciones de tamaño y formato definidas.

    Parámetros:
        file (UploadFile): El objeto de archivo subido (metadata).
        file_size (int): El tamaño real del archivo en bytes.

    Genera:
        HTTPException 400: Si el archivo no cumple con alguna restricción.
    """
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

    if not file.content_type or not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser una imagen"
        )

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


@router.put("/{id_usuario}/foto-perfil")
async def actualizar_foto_perfil(
    id_usuario: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Autor: Enrique Alejandro Pereda Meraz
    Descripción: Sube una nueva foto de perfil a S3, elimina la foto anterior (si existe) 
    y actualiza la clave de S3 en la base de datos del usuario. Devuelve una URL pre-firmada.

    Parámetros:
        id_usuario (int): ID del usuario cuya foto de perfil se va a actualizar.
        file (UploadFile): El archivo de la imagen de perfil a subir.
        db (Session): Sesión de la base de datos inyectada por dependencia.

    Retorna:
        dict: Mensaje de éxito y la URL temporal de la nueva foto.

    Genera:
        HTTPException 404: Si el usuario no es encontrado.
        HTTPException 400: Si el archivo es inválido (tamaño/tipo).
        HTTPException 500: Si falla la conexión con S3 o la base de datos.
    """
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    try:
        file_contents = await file.read()
        file_size = len(file_contents)
    except Exception as e:
        logger.error(f"Error al leer el archivo: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo leer el archivo"
        )
    finally:
        await file.close()

    validate_image_file(file, file_size)

    try:
        if usuario.foto_perfil:
            try:
                s3_service.delete_file(usuario.foto_perfil)
                logger.info(f"Foto anterior eliminada: {usuario.foto_perfil}")
            except Exception as e:
                logger.warning(f"No se pudo eliminar foto anterior: {e}")

        file_extension = file.filename.split('.')[-1].lower()
        s3_key = f"profile-images/{id_usuario}_{file.filename}"

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

        usuario.foto_perfil = uploaded_key
        db.commit()
        db.refresh(usuario)

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


@router.get("/{id_usuario}/foto-perfil")
def obtener_foto_perfil(id_usuario: int, db: Session = Depends(get_db)):
    """
    Autor: Enrique Alejandro Pereda Meraz
    Descripción: Obtiene la URL temporal pre-firmada de la foto de perfil de un usuario.

    Parámetros:
        id_usuario (int): ID del usuario cuya foto se desea obtener.
        db (Session): Sesión de la base de datos inyectada por dependencia.

    Retorna:
        dict: La URL pre-firmada para la foto de perfil.

    Genera:
        HTTPException 404: Si el usuario o su foto de perfil no son encontrados.
    """
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario or not usuario.foto_perfil:
        raise HTTPException(status_code=404, detail="Foto de perfil no encontrada")

    presigned_url = s3_service.get_presigned_url(usuario.foto_perfil)
    return {"foto_perfil_url": presigned_url}


@router.delete("/{id_usuario}/foto-perfil")
def eliminar_foto_perfil(id_usuario: int, db: Session = Depends(get_db)):
    """
    Autor: Enrique Alejandro Pereda Meraz
    Descripción: Elimina permanentemente la foto de perfil de un usuario de S3 y
    borra la referencia en la base de datos.

    Parámetros:
        id_usuario (int): ID del usuario cuya foto se va a eliminar.
        db (Session): Sesión de la base de datos inyectada por dependencia.

    Retorna:
        dict: Mensaje de confirmación de la eliminación.

    Genera:
        HTTPException 404: Si la foto de perfil no es encontrada.
        HTTPException 500: Si falla la operación de borrado en S3.
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