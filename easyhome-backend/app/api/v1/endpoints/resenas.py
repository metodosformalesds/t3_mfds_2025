# Autor: ENRIQUE ALEJANDRO PEREDA MERAZ

# Fecha: 15/11/2025

# Descripción: Endpoint para que un usuario pueda crear y ver reseñas de servicios.
# app/api/v1/endpoints/resenas.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
import uuid
import logging
from typing import List

from app.core.database import get_db
from app.models.reseña_servicio import Reseña_Servicio
from app.models.imagen_reseña import Imagen_Reseña
from app.models.user import Usuario, Proveedor_Servicio
from app.models.servicio_contratado import Servicio_Contratado
from app.services.s3_service import s3_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/resenas", tags=["Resenas"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def crear_resena_servicio(
    id_servicio_contratado: int = Form(...),
    user_email: str = Form(..., description="Correo electrónico del cliente autenticado"),
    calificacion_general: int = Form(...),
    calificacion_puntualidad: int = Form(...),
    calificacion_calidad_servicio: int = Form(...),
    calificacion_calidad_precio: int = Form(...),
    comentario: str = Form(None),
    recomendacion: str = Form(..., description="Sí o No"),
    imagenes: List[UploadFile] = File(default=[]),
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

        # Procesar imágenes solo si se enviaron
        imagenes_subidas = 0
        if imagenes and len(imagenes) > 0:
            for imagen in imagenes[:5]:  # máximo 5
                if imagen.filename:
                    extension = imagen.filename.split('.')[-1] if '.' in imagen.filename else 'jpg'
                    s3_key = f"resenas/{uuid.uuid4()}.{extension}"

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
                    imagenes_subidas += 1

            if imagenes_subidas > 0:
                db.commit()

        return {
            "message": "Reseña creada exitosamente.",
            "id_reseña": nueva_reseña.id_reseña,
            "total_imagenes": imagenes_subidas,
            "estado": nueva_reseña.estado,
            "fecha_reseña": nueva_reseña.fecha_reseña
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear reseña: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")


@router.get("/cliente/{user_email}", status_code=status.HTTP_200_OK)
async def obtener_resenas_cliente(
    user_email: str,
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las reseñas realizadas por un cliente específico.
    """
    try:
        logger.info(f"Solicitando reseñas para cliente: {user_email}")
        usuario = db.query(Usuario).filter(Usuario.correo_electronico == user_email).first()
        if not usuario:
            logger.warning(f"Usuario {user_email} no encontrado")
            raise HTTPException(status_code=404, detail="Usuario no encontrado.")

        resenas = db.query(Reseña_Servicio).filter(
            Reseña_Servicio.id_cliente == usuario.id_usuario
        ).all()

        resultado = []
        for resena in resenas:
            proveedor = db.query(Proveedor_Servicio).filter(
                Proveedor_Servicio.id_proveedor == resena.id_proveedor
            ).first()

            usuario_proveedor = None
            foto_perfil_url = None
            nombre_servicio = "Servicio"

            if proveedor:
                usuario_proveedor = db.query(Usuario).filter(
                    Usuario.id_usuario == proveedor.id_proveedor
                ).first()

                if usuario_proveedor and usuario_proveedor.foto_perfil:
                    try:
                        foto_perfil_url = s3_service.get_presigned_url(
                            usuario_proveedor.foto_perfil,
                            expiration=3600
                        )
                    except Exception as e:
                        logger.warning(f"No se pudo generar URL para foto de perfil: {e}")

                servicio_contratado = db.query(Servicio_Contratado).filter(
                    Servicio_Contratado.id_servicio_contratado == reseña.id_servicio_contratado
                ).first()

                if servicio_contratado and getattr(servicio_contratado, "id_publicacion", None):
                    from app.models.property import Publicacion_Servicio
                    publicacion = db.query(Publicacion_Servicio).filter(
                        Publicacion_Servicio.id_publicacion == servicio_contratado.id_publicacion
                    ).first()
                    if publicacion:
                        nombre_servicio = publicacion.titulo

            resultado.append({
                "reseña": {
                    "id_reseña": reseña.id_reseña,
                    "comentario": reseña.comentario,
                    "calificacion_general": reseña.calificacion_general,
                    "calificacion_puntualidad": reseña.calificacion_puntualidad,
                    "calificacion_calidad_servicio": reseña.calificacion_calidad_servicio,
                    "calificacion_calidad_precio": reseña.calificacion_calidad_precio,
                    "fecha_reseña": reseña.fecha_reseña.isoformat() if reseña.fecha_reseña else None,
                },
                "cliente": {
                    "email": user_email,
                },
                "proveedor": {
                    "nombre": usuario_proveedor.nombre if usuario_proveedor else "Proveedor",
                    "servicio": nombre_servicio,
                    "foto_perfil": foto_perfil_url,
                },
            })

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener reseñas del cliente: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")


@router.get("/proveedor/{id_proveedor}", status_code=status.HTTP_200_OK)
async def obtener_resenas_proveedor(
    id_proveedor: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene todas las reseñas recibidas por un proveedor específico.
    """
    try:
        logger.info(f"Solicitando reseñas para proveedor ID: {id_proveedor}")
        # Validar proveedor
        proveedor = db.query(Proveedor_Servicio).filter(Proveedor_Servicio.id_proveedor == id_proveedor).first()
        if not proveedor:
            logger.warning(f"Proveedor {id_proveedor} no encontrado")
            raise HTTPException(status_code=404, detail="Proveedor no encontrado.")

        usuario_proveedor = db.query(Usuario).filter(Usuario.id_usuario == proveedor.id_proveedor).first()

        # Obtener reseñas recibidas por el proveedor
        resenas = db.query(Reseña_Servicio).filter(
            Reseña_Servicio.id_proveedor == id_proveedor
        ).order_by(Reseña_Servicio.fecha_reseña.desc()).all()

        resultado = []
        for resena in resenas:
            # Info del cliente autor de la reseña
            cliente_usuario = db.query(Usuario).filter(Usuario.id_usuario == resena.id_cliente).first()

            # Foto de perfil del cliente (pre-firmada si existe)
            foto_cliente_url = None
            if cliente_usuario and cliente_usuario.foto_perfil:
                try:
                    foto_cliente_url = s3_service.get_presigned_url(cliente_usuario.foto_perfil, expiration=3600)
                except Exception as e:
                    logger.warning(f"No se pudo generar URL para foto del cliente: {e}")
                    foto_cliente_url = None

            # Calcular calificación promedio del cliente (como autor de reseñas)
            calificacion_promedio_cliente = db.query(
                func.avg(Reseña_Servicio.calificacion_general)
            ).filter(
                Reseña_Servicio.id_cliente == resena.id_cliente
            ).scalar() or 0.0

            # Nombre del servicio (desde Servicio_Contratado -> Publicacion_Servicio)
            nombre_servicio = "Servicio"
            servicio_contratado = db.query(Servicio_Contratado).filter(
                Servicio_Contratado.id_servicio_contratado == resena.id_servicio_contratado
            ).first()
            if servicio_contratado and getattr(servicio_contratado, "id_publicacion", None):
                from app.models.property import Publicacion_Servicio
                publicacion = db.query(Publicacion_Servicio).filter(
                    Publicacion_Servicio.id_publicacion == servicio_contratado.id_publicacion
                ).first()
                if publicacion:
                    nombre_servicio = publicacion.titulo

            # Foto de perfil del proveedor (pre-firmada si existe)
            foto_perfil_url = None
            if usuario_proveedor and usuario_proveedor.foto_perfil:
                try:
                    foto_perfil_url = s3_service.get_presigned_url(usuario_proveedor.foto_perfil, expiration=3600)
                except Exception:
                    foto_perfil_url = usuario_proveedor.foto_perfil

            resultado.append({
                "reseña": {
                    "id_reseña": resena.id_reseña,
                    "comentario": resena.comentario,
                    "calificacion_general": resena.calificacion_general,
                    "calificacion_puntualidad": resena.calificacion_puntualidad,
                    "calificacion_calidad_servicio": resena.calificacion_calidad_servicio,
                    "calificacion_calidad_precio": resena.calificacion_calidad_precio,
                    "fecha_reseña": resena.fecha_reseña.isoformat() if resena.fecha_reseña else None,
                },
                "cliente": {
                    "nombre": cliente_usuario.nombre if cliente_usuario else "Cliente",
                    "email": cliente_usuario.correo_electronico if cliente_usuario else None,
                    "foto_perfil": foto_cliente_url,
                    "calificacion_promedio": round(calificacion_promedio_cliente, 1) if calificacion_promedio_cliente else 0.0,
                },
                "proveedor": {
                    "nombre": usuario_proveedor.nombre if usuario_proveedor else "Proveedor",
                    "servicio": nombre_servicio,
                    "foto_perfil": foto_perfil_url,
                },
            })

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error al obtener reseñas del proveedor: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno: {e}")
