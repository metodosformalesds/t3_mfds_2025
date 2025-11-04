# app/api/v1/endpoints/auth.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.core.database import get_db
from app.models.user import Usuario
from app.services.cognito_service import cognito_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class CognitoUserSync(BaseModel):
    email: EmailStr
    cognito_sub: str
    name: str = None
    phone: str = None
    cognito_groups: list[str] = []


@router.post("/sync-cognito-user")
def sync_cognito_user(user_data: CognitoUserSync, db: Session = Depends(get_db)):
    """
    Sincroniza un usuario de Cognito con la base de datos local.
    Si el usuario ya existe, actualiza su última sesión.
    Si no existe, lo crea.
    
    IMPORTANTE: Si el usuario no tiene grupos en Cognito, se le asigna automáticamente al grupo "Clientes"
    """
    # Buscar usuario por email o google_id (usaremos google_id para guardar el cognito_sub)
    existing_user = db.query(Usuario).filter(
        (Usuario.correo_electronico == user_data.email) |
        (Usuario.google_id == user_data.cognito_sub)
    ).first()

    # Asegurar que el usuario tenga al menos el grupo "Clientes"
    # Usamos el email como username (Cognito puede usar email o sub según configuración)
    groups_assigned = cognito_service.ensure_user_has_default_group(
        username=user_data.email,
        current_groups=user_data.cognito_groups
    )
    
    if groups_assigned and not user_data.cognito_groups:
        # Si se asignó el grupo por defecto, actualizar los grupos en la respuesta
        user_data.cognito_groups = [cognito_service.client and 
                                     cognito_service.get_user_groups(user_data.email) or 
                                     ["Clientes"]]
        logger.info(f"Usuario {user_data.email} asignado al grupo por defecto")

    if existing_user:
        # Actualizar última sesión
        existing_user.ultima_sesion = datetime.now()
        db.commit()
        db.refresh(existing_user)
        
        return {
            "message": "Usuario actualizado",
            "user_id": existing_user.id_usuario,
            "is_new": False,
            "groups": user_data.cognito_groups
        }
    
    # Determinar tipo de usuario basado en los grupos de Cognito
    tipo_usuario = "cliente"  # Por defecto
    if "Admin" in user_data.cognito_groups:
        tipo_usuario = "administrador"
    elif "Trabajadores" in user_data.cognito_groups:
        tipo_usuario = "proveedor"
    elif "Clientes" in user_data.cognito_groups:
        tipo_usuario = "cliente"
    
    # Crear nuevo usuario
    new_user = Usuario(
        nombre=user_data.name or user_data.email.split('@')[0],
        correo_electronico=user_data.email,
        contraseña="",  # No necesitamos contraseña porque usa Cognito
        numero_telefono=user_data.phone,
        tipo_usuario=tipo_usuario,
        estado_cuenta="activo",
        metodo_autenticacion="cognito",
        google_id=user_data.cognito_sub,  # Guardamos el sub de Cognito
        fecha_registro=datetime.now(),
        ultima_sesion=datetime.now()
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "Usuario creado exitosamente",
        "user_id": new_user.id_usuario,
        "is_new": True,
        "groups": user_data.cognito_groups
    }


@router.get("/user-info/{email}")
def get_user_info(email: str, db: Session = Depends(get_db)):
    """
    Obtiene información del usuario por email.
    """
    user = db.query(Usuario).filter(Usuario.correo_electronico == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    return {
        "id_usuario": user.id_usuario,
        "nombre": user.nombre,
        "correo_electronico": user.correo_electronico,
        "tipo_usuario": user.tipo_usuario,
        "estado_cuenta": user.estado_cuenta,
        "fecha_registro": user.fecha_registro,
        "ultima_sesion": user.ultima_sesion
    }
