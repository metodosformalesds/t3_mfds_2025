from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from datetime import datetime
import uuid
import logging
from typing import List

from app.core.database import get_db
from app.models.reseña_servicio import Reseña_Servicio 
from app.models.imagen_reseña import Imagen_Reseña
from app.models.user import Usuario, Proveedor_Servicio
from app.models.servicio_contratado import Servicio_Contratado
from app.models.property import Publicacion_Servicio
from app.services.s3_service import s3_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/reseñas", tags=["Reseñas"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def crear_reseña_servicio(
    id_servicio_contratado: int = Form(...),
    user_email: str = Form(..., description="Correo electrónico del cliente autenticado"),
    calificacion_general: int = Form(...),
    calificacion_puntualidad: int = Form(...),
    calificacion_calidad_servicio: int = Form(...),
    calificacion_calidad_precio: int = Form(...),
    comentario: str = Form(None),
    recomendacion: str = Form(..., description="Sí o No"),
    imagenes: List[UploadFile] = File(None, description="Máx. 5 imágenes"),
    db: Session = Depends(get_db)
):
    try:
        usuario = db.query(Usuario).filter(Usuario.correo_electronico == user_email).first()
        if not usuario:
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")

        servicio_contratado = db.query(Servicio_Contratado).filter(
            Servicio_Contratado.id_servicio_contratado == id_servicio_contratado
        ).first()
        if not servicio_contratado:
            raise HTTPException(status_code=404, detail="Servicio contratado no encontrado.")

        proveedor = db.query(Proveedor_Servicio).filter(
            Proveedor_Servicio.id_proveedor == servicio_contratado.id_proveedor
        ).first()
        if not proveedor:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado.")

        nueva_reseña = Reseña_Servicio(
            id_servicio_contratado=id_servicio_contratado,
            id_cliente=usuario.id_usuario,
            id_proveedor=proveedor.id_proveedor,
            calificacion_general=calificacion_general,
            calificacion_puntualidad=calificacion_puntualidad,
            calificacion_calidad_servicio=calificacion_calidad_servicio,
            calificacion_calidad_precio=calificacion_calidad_precio,
            comentario=comentario,
            recomendacion=recomendacion,
            fecha_reseña=datetime.utcnow(),
            estado="activa"
        )

        db.add(nueva_reseña)
        db.commit()
        db.refresh(nueva_reseña)

        if imagenes:
            for imagen in imagenes[:5]:  # máximo 5
                extension = imagen.filename.split('.')[-1] if '.' in imagen.filename else 'jpg'
                s3_key = f"reseñas/{uuid.uuid4()}.{extension}"

                s3_service.upload_file(
                    file_obj=imagen.file,
                    object_name=s3_key,
                    content_type=imagen.content_type
                )

                nueva_imagen = Imagen_Reseña(
                    id_reseña=nueva_reseña.id_reseña,
                    url_imagen=s3_key,
                    fecha_subida=datetime.utcnow()
                )
                db.add(nueva_imagen)

            db.commit()

        return {
            "message": "Reseña creada exitosamente.",
            "id_reseña": nueva_reseña.id_reseña,
            "total_imagenes": len(imagenes) if imagenes else 0,
            "estado": nueva_reseña.estado,
            "fecha_reseña": nueva_reseña.fecha_reseña
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear reseña: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")
    
@router.get("/servicio-info/{id_servicio_contratado}")
async def obtener_info_servicio_contratado(
    id_servicio_contratado: int,
    db: Session = Depends(get_db)
):
    """
    Obtener información del servicio contratado para mostrar en el formulario de reseña
    """
    try:
        servicio_contratado = db.query(Servicio_Contratado).filter(
            Servicio_Contratado.id_servicio_contratado == id_servicio_contratado
        ).first()
        
        if not servicio_contratado:
            raise HTTPException(status_code=404, detail="Servicio contratado no encontrado.")
        
        # Obtener información del proveedor
        proveedor = db.query(Proveedor_Servicio).filter(
            Proveedor_Servicio.id_proveedor == servicio_contratado.id_proveedor
        ).first()
        
        if not proveedor:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado.")
        
        # Obtener usuario del proveedor para el nombre y foto
        usuario_proveedor = db.query(Usuario).filter(
            Usuario.id_usuario == proveedor.id_usuario
        ).first()
        
        # Obtener información de la publicación del servicio
        publicacion = db.query(Publicacion_Servicio).filter(
            Publicacion_Servicio.id_publicacion == servicio_contratado.id_publicacion
        ).first()
        
        # Generar URL pre-firmada para la foto de perfil si existe
        foto_perfil_url = None
        if usuario_proveedor and usuario_proveedor.foto_perfil:
            try:
                # Generar URL pre-firmada válida por 1 hora
                foto_perfil_url = s3_service.get_presigned_url(
                    usuario_proveedor.foto_perfil,
                    expiration=3600
                )
            except Exception as e:
                logger.warning(f"No se pudo generar URL para foto de perfil: {e}")
                foto_perfil_url = None
        
        return {
            "id_servicio_contratado": servicio_contratado.id_servicio_contratado,
            "nombre_proveedor": f"{usuario_proveedor.nombre} {usuario_proveedor.apellido}" if usuario_proveedor else "Proveedor",
            "nombre_servicio": publicacion.titulo if publicacion else "Servicio",
            "fecha_contratacion": servicio_contratado.fecha_contratacion.strftime("%d de %B, %Y") if servicio_contratado.fecha_contratacion else "Recientemente",
            "estado": servicio_contratado.estado,
            "foto_perfil": foto_perfil_url  # Nueva propiedad con URL pre-firmada
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener info del servicio: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")