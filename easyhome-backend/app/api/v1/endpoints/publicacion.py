# Autor: BRANDON GUSTAVO HERNANDEZ ORTIZ

# Fecha: 07/11/2025

# Descripción: define la capa de la API responsable de gestionar las publicaciones de servicios realizadas por los proveedores. Proporciona endpoints para crear, listar y eliminar publicaciones, interactuando con el servicio de almacenamiento S3 y la base de datos a través de SQLAlchemy.
# app/api/v1/endpoints/publicacion.py
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, Query, Header
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import uuid
import logging

# --- Importaciones de tu proyecto ---
from app.core.database import get_db
from app.models.user import Usuario, Proveedor_Servicio
# Ajusta esta importación si tus modelos están en archivos separados
from app.models.property import Publicacion_Servicio, Categoria_Servicio, Imagen_Publicacion
# from app.models.etiqueta import Etiqueta 

# --- Importaciones de Servicios ---
from app.services.s3_service import s3_service # Usamos el mismo servicio S3
from app.services.cognito_service import cognito_service # Servicio de Cognito

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/publicaciones", tags=["Publicaciones de Servicios"])


# =========================================================
#   CREAR PUBLICACIÓN DE SERVICIO (Proveedor)
# (Coincide con el formulario "Publica tu servicio")
# =========================================================
@router.post("/", status_code=status.HTTP_201_CREATED)
async def crear_publicacion(
    # --- Datos del Formulario ---
    titulo: str = Form(...),
    id_categoria: int = Form(..., description="El ID de la categoría seleccionada"),
    descripcion: str = Form(...),
    rango_precio_min: float = Form(...),
    rango_precio_max: float = Form(...),
    fotos: List[UploadFile] = File(..., description="Máximo 10 fotos"),
    user_email: str = Form(..., description="Email del usuario autenticado"),
    
    # --- Datos de autenticación y BD ---
    db: Session = Depends(get_db)
):
    """
    Autor: BRANDON GUSTAVO HERNANDEZ ORTIZ

    Descripción: Permite a un PROVEEDOR autenticado crear una nueva publicación
    de servicio. Sube las fotos de referencia a S3, guarda las keys en la tabla
    `Imagen_Publicacion` y registra la publicación en la base de datos.

    Parámetros:
        titulo (str): Título de la publicación.
        id_categoria (int): ID de la categoría seleccionada.
        descripcion (str): Descripción del servicio.
        rango_precio_min (float): Precio mínimo del rango.
        rango_precio_max (float): Precio máximo del rango.
        fotos (List[UploadFile]): Archivos de imagen enviados en el formulario.
        user_email (str): Email del usuario autenticado (proveedor).
        db (Session): Sesión de la base de datos (Depends).

    Retorna:
        dict: Mensaje de resultado, `id_publicacion`, `titulo` y listas de keys
        de las fotos subidas.
    """
    
    #  1. Obtener el usuario desde la BD por email
    current_user = db.query(Usuario).filter(Usuario.correo_electronico == user_email).first()
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado."
        )
    
    #  2. Verificar que el usuario sea un Proveedor
    if not current_user.tipo_usuario == "proveedor" or not current_user.proveedor_servicio:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los proveedores de servicio pueden crear publicaciones."
        )
    
    # 3. Verificar límite de fotos (Máximo 10)
    if len(fotos) > 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Se permite un máximo de 10 fotos por publicación."
        )

    # 4. Verificar que la categoría exista
    categoria = db.query(Categoria_Servicio).filter(Categoria_Servicio.id_categoria == id_categoria).first()
    if not categoria:
        raise HTTPException(status_code=404, detail="La categoría seleccionada no existe.")

    try:
        proveedor = current_user.proveedor_servicio

        if not proveedor:
            raise HTTPException(
                status_code=403,
                detail="Tu cuenta debe estar registrada como proveedor para crear publicaciones."
            )
        # 5. Crear la publicación en la BD
        nueva_publicacion = Publicacion_Servicio(
            id_proveedor=proveedor.id_proveedor,
            id_categoria=id_categoria,
            titulo=titulo,
            descripcion=descripcion,
            rango_precio_min=rango_precio_min,
            rango_precio_max=rango_precio_max,
            estado="activo",
            fecha_publicacion=datetime.utcnow()
        )
        
        db.add(nueva_publicacion)
        db.commit()
        db.refresh(nueva_publicacion) # Para obtener el 'id_publicacion' generado

        # 6. Subir fotos a S3 (MISMA LÓGICA DE SOLICITUD.PY)
        urls_fotos_guardadas = []
        for index, file in enumerate(fotos):
            try:
                # Generar S3 key (ruta en S3)
                file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
                # Carpeta 'publicaciones/' -> 'id_publicacion' -> 'uuid.jpg'
                s3_key = f"publicaciones/{nueva_publicacion.id_publicacion}/{uuid.uuid4()}.{file_extension}"
                content_type = file.content_type
                
                # Subir a S3
                s3_service.upload_file(
                    file_obj=file.file,
                    object_name=s3_key,
                    content_type=content_type
                )
                
                # Guardar S3 KEY en la tabla Imagen_Publicacion
                nueva_foto = Imagen_Publicacion(
                    id_publicacion=nueva_publicacion.id_publicacion,
                    url_imagen=s3_key, # <-- Guardamos la S3 key, NO la URL
                    orden=index + 1
                )
                db.add(nueva_foto)
                urls_fotos_guardadas.append(s3_key)
                
            except Exception as e:
                logger.error(f"Error al subir foto {file.filename} para pub {nueva_publicacion.id_publicacion}: {e}")
                continue 
        
        db.commit()
        
        return {
            "message": "Publicación creada exitosamente",
            "id_publicacion": nueva_publicacion.id_publicacion,
            "titulo": nueva_publicacion.titulo,
            "fotos_guardadas_keys": urls_fotos_guardadas
        }

    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear publicación para proveedor {current_user.id_usuario}: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno al crear la publicación: {e}")

# =========================================================
# 2️⃣ MOSTRAR TODAS LAS PUBLICACIONES (FEED COMPLETO)
# =========================================================
@router.get("/", response_model=None)
def listar_publicaciones(
    db: Session = Depends(get_db),
    categorias: Optional[List[int]] = Query(None),
    suscriptores: Optional[bool] = Query(False),
    ordenar_por: Optional[str] = Query(None)
):
    """
    Autor: BRANDON GUSTAVO HERNANDEZ ORTIZ

    Descripción: Devuelve un listado de publicaciones activas, soportando
    filtros por `categorias`, opción para limitar solo proveedores suscritos
    y ordenamiento. La respuesta incluye datos del proveedor, URLs prefirmadas
    para imágenes y contacto del usuario asociado.

    Parámetros:
        db (Session): Sesión de base de datos (Depends).
        categorias (Optional[List[int]]): Lista de ids de categorías para filtrar.
        suscriptores (Optional[bool]): Si True, filtra solo proveedores suscritos.
        ordenar_por (Optional[str]): Criterio de orden ('mas_recientes'|'mejor_calificados').

    Retorna:
        List[dict]: Lista de publicaciones con metadatos preparados para el frontend.
    """

    try:
        # =====================================================
        # 🟦 BASE QUERY + FILTROS
        # =====================================================
        query = (
            db.query(Publicacion_Servicio)
            .options(joinedload(Publicacion_Servicio.proveedor_servicio).joinedload(Proveedor_Servicio.usuario))
            .options(joinedload(Publicacion_Servicio.imagen_publicacion))
            .options(joinedload(Publicacion_Servicio.categoria_servicio)) # Asegúrate de cargar la categoría
            .filter(Publicacion_Servicio.estado == "activo")
        )

        # 🟧 FILTRO POR CATEGORÍAS
        if categorias:
            query = query.filter(Publicacion_Servicio.id_categoria.in_(categorias))

        # 🟩 FILTRO POR SUSCRIPTORES
        if suscriptores:
            query = query.join(Proveedor_Servicio).filter(
                Proveedor_Servicio.id_plan_suscripcion.isnot(None)
            )

        # 🟨 ORDENAMIENTO
        if ordenar_por == "mas_recientes":
            query = query.order_by(Publicacion_Servicio.fecha_publicacion.desc())

        elif ordenar_por == "mejor_calificados":
            query = query.join(Proveedor_Servicio).order_by(
                Proveedor_Servicio.calificacion_promedio.desc().nullslast()
            )

        # Obtener publicaciones finales
        publicaciones = query.limit(100).all()

        # =====================================================
        # 🔄 ARMAR RESPUESTA
        # =====================================================
        resultado = []

        for pub in publicaciones:
            prov = pub.proveedor_servicio
            usuario = prov.usuario if prov else None

            # ===========================
            # FOTO DE PERFIL
            # ===========================
            foto_perfil_url = None
            foto_key = None

            if prov:
                foto_key = prov.foto_perfil or (
                    usuario.foto_perfil if usuario else None
                )

            if foto_key:
                try:
                    foto_perfil_url = s3_service.get_presigned_url(foto_key)
                except:
                    foto_perfil_url = None

            # ===========================
            # PORTADA (primera imagen)
            # ===========================
            url_imagen_portada = None
            if pub.imagen_publicacion:
                portada = sorted(pub.imagen_publicacion, key=lambda x: x.orden)[0]
                try:
                    url_imagen_portada = s3_service.get_presigned_url(portada.url_imagen)
                except:
                    url_imagen_portada = None

            # ===========================
            # CALCULAR CALIFICACIÓN PROMEDIO DEL PROVEEDOR
            # ===========================
            calificacion_promedio = 0.0
            if prov:
                # Calcular promedio de reseñas activas del proveedor
                from app.models.reseña_servicio import Reseña_Servicio
                avg_result = db.query(func.avg(Reseña_Servicio.calificacion_general))\
                    .filter(Reseña_Servicio.id_proveedor == prov.id_proveedor)\
                    .filter(Reseña_Servicio.estado == "activa")\
                    .scalar()
                
                if avg_result is not None:
                    calificacion_promedio = round(float(avg_result), 1)
            
            # ===========================
            # AGREGAR PUBLICACIÓN AL RESULTADO
            # GALERÍA COMPLETA
            # ===========================
            imagenes = []
            for img in sorted(pub.imagen_publicacion, key=lambda x: x.orden):
                try:
                    img_url = s3_service.get_presigned_url(img.url_imagen)
                except:
                    img_url = None

                imagenes.append({
                    "id_imagen": img.id_imagen,
                    "url_imagen": img_url
                })

            # ===========================
            # ARMAR RESPUESTA FINAL
            # ===========================
            resultado.append({
                "id_publicacion": pub.id_publicacion,
                "titulo": pub.titulo,
                "descripcion_completa": pub.descripcion,
                "id_proveedor": pub.id_proveedor,

                "nombre_proveedor": (
                    prov.nombre_completo if prov and getattr(prov, "nombre_completo", None)
                    else usuario.nombre if usuario and getattr(usuario, "nombre", None)
                    else "Sin nombre"
                ),

                "foto_perfil_proveedor": foto_perfil_url,
                "calificacion_proveedor": calificacion_promedio,

                # --- 👇 AQUÍ ESTÁ LA SOLUCIÓN 👇 ---
                # Agregamos los datos del 'usuario' asociado al proveedor
                
                "correo_proveedor": usuario.correo_electronico if usuario else None,
                "telefono_proveedor": usuario.numero_telefono if usuario else None,
                
                # --- 👆 FIN DE LA SOLUCIÓN 👆 ---

                "rango_precio_min": pub.rango_precio_min,
                "rango_precio_max": pub.rango_precio_max,

                "categoria": pub.categoria_servicio.nombre_categoria if pub.categoria_servicio else None,

                "url_imagen_portada": url_imagen_portada,
                "fecha_publicacion": pub.fecha_publicacion.isoformat() if pub.fecha_publicacion else None,
                "imagen_publicacion": imagenes,
            })

        return resultado

    except Exception as e:
        logger.error(f"Error al listar publicaciones: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
# =========================================================
# ELIMINAR PUBLICACIÓN POR ID (versión sencilla, SIN headers)
# =========================================================
@router.delete("/{id_publicacion}", status_code=status.HTTP_200_OK)
def eliminar_publicacion(
    id_publicacion: int,
    db: Session = Depends(get_db)
):
    """
    Elimina una publicación de servicio por su ID.
    (Versión sencilla, sin validar usuario para evitar errores 422
    mientras terminas el flujo de MisServicios).
    """

    # 1. Buscar publicación
    publicacion = (
        db.query(Publicacion_Servicio)
        .filter(Publicacion_Servicio.id_publicacion == id_publicacion)
        .first()
    )

    if not publicacion:
        raise HTTPException(status_code=404, detail="La publicación no existe")

    # 2. Obtener imágenes asociadas
    imagenes = db.query(Imagen_Publicacion).filter(
        Imagen_Publicacion.id_publicacion == id_publicacion
    ).all()

    # 3. Intentar eliminar archivos en S3 (si truena, solo se registra)
    for img in imagenes:
        try:
            s3_service.delete_file(img.url_imagen)
        except Exception as e:
            logger.error(f"Error al eliminar archivo S3 {img.url_imagen}: {e}")

    # 4. Eliminar registros de imágenes
    db.query(Imagen_Publicacion).filter(
        Imagen_Publicacion.id_publicacion == id_publicacion
    ).delete()

    # 5. Eliminar la publicación
    db.delete(publicacion)
    db.commit()

    return {"message": "Publicación eliminada exitosamente"}


# =========================================================
# 3️⃣ (NUEVO) OBTENER MIEMBROS PREMIUM
# (Para la barra lateral)
# =========================================================
@router.get("/miembros-premium", response_model=None)
def listar_miembros_premium(
    limit: int = Query(3, description="Número de miembros a mostrar (default: 3)"),
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de los proveedores suscritos ("Premium"),
    ordenados por la calificación más alta (RF-15)[cite: 402], 
    para mostrar en la barra lateral[cite: 96].
    """
    try:
        # 🔹 1. Query para buscar Proveedores Premium
        # Hacemos 'join' con Usuario para verificar que la cuenta esté activa
        query = db.query(Proveedor_Servicio)\
            .join(Proveedor_Servicio.usuario)\
            .filter(
                # Tienen que tener un plan de suscripción (RF-15) 
                Proveedor_Servicio.id_plan_suscripcion != None, 
                # Tienen que estar 'aprobados'
                Proveedor_Servicio.estado_solicitud == 'aprobado',
                # Y su cuenta de 'usuario' debe estar 'activa' [cite: 451]
                Usuario.estado_cuenta == 'activo'
            )\
            .order_by(
                # Ordenar por mejor calificación (RF-15) 
                Proveedor_Servicio.calificacion_promedio.desc().nullslast()
            )\
            .limit(limit) # Limitar a los 3 (o N) primeros

        proveedores_premium = query.all()

        # 🔹 2. Construir respuesta con URLs pre-firmadas
        resultado = []
        for prov in proveedores_premium:
            url_foto = None
            # Generar URL pre-firmada para la foto de perfil (fallback a Usuario.foto_perfil)
            foto_key = prov.foto_perfil or (prov.usuario.foto_perfil if getattr(prov, 'usuario', None) else None)
            if foto_key:
                try:
                    url_foto = s3_service.get_presigned_url(foto_key)
                except Exception as e:
                    logger.error(f"Error S3 URL para foto de perfil {foto_key}: {e}")
            
            resultado.append({
                "id_proveedor": prov.id_proveedor,
                "nombre_completo": prov.nombre_completo,
                "calificacion_promedio": prov.calificacion_promedio,
                "foto_perfil_url": url_foto # URL Temporal
            })
            
        return resultado

    except Exception as e:
        logger.error(f"Error al obtener miembros premium: {e}")
        raise HTTPException(status_code=500, detail="Error al obtener miembros premium.")
