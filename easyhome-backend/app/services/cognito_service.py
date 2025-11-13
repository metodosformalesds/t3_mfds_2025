"""
Servicio para interactuar con AWS Cognito
"""
import boto3
from botocore.exceptions import ClientError
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class CognitoService:
    """Servicio para gestionar usuarios y grupos en AWS Cognito"""
    
    def __init__(self):
        """Inicializa el cliente de Cognito"""
        self.client = None
        self.user_pool_id = settings.COGNITO_USER_POOL_ID
        
        # Solo inicializar si tenemos las credenciales configuradas
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            self.client = boto3.client(
                'cognito-idp',
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
    
    def add_user_to_group(self, username: str, group_name: str) -> bool:
        """
        Agrega un usuario a un grupo en Cognito
        
        Args:
            username: El username del usuario (puede ser email o sub)
            group_name: Nombre del grupo
            
        Returns:
            True si se agregó exitosamente, False en caso contrario
        """
        if not self.client or not self.user_pool_id:
            logger.warning("Cliente de Cognito no configurado. Verifica las credenciales de AWS.")
            return False
        
        try:
            self.client.admin_add_user_to_group(
                UserPoolId=self.user_pool_id,
                Username=username,
                GroupName=group_name
            )
            logger.info(f"Usuario {username} agregado al grupo {group_name}")
            return True
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            
            # Si el usuario ya está en el grupo, lo consideramos exitoso
            if error_code == 'ResourceNotFoundException':
                logger.error(f"Grupo {group_name} no encontrado en Cognito")
            elif error_code == 'UserNotFoundException':
                logger.error(f"Usuario {username} no encontrado en Cognito")
            else:
                logger.error(f"Error al agregar usuario al grupo: {e}")
            
            return False
        except Exception as e:
            logger.error(f"Error inesperado al agregar usuario al grupo: {e}")
            return False
    
    def get_user_groups(self, username: str) -> list[str]:
        """
        Obtiene los grupos a los que pertenece un usuario
        
        Args:
            username: El username del usuario
            
        Returns:
            Lista de nombres de grupos
        """
        if not self.client or not self.user_pool_id:
            logger.warning("Cliente de Cognito no configurado")
            return []
        
        try:
            response = self.client.admin_list_groups_for_user(
                UserPoolId=self.user_pool_id,
                Username=username
            )
            
            groups = [group['GroupName'] for group in response.get('Groups', [])]
            logger.info(f"Usuario {username} pertenece a los grupos: {groups}")
            return groups
            
        except ClientError as e:
            logger.error(f"Error al obtener grupos del usuario: {e}")
            return []
        except Exception as e:
            logger.error(f"Error inesperado al obtener grupos: {e}")
            return []
    
    def get_user_attributes(self, username: str) -> dict:
        """
        Obtiene los atributos del usuario desde Cognito
        (por ejemplo: name, given_name, family_name, email, etc.)
        """
        if not self.client or not self.user_pool_id:
            logger.warning("Cliente de Cognito no configurado")
            return {}
        
        try:
            response = self.client.admin_get_user(
                UserPoolId=self.user_pool_id,
                Username=username
            )
            attributes = {attr['Name']: attr['Value'] for attr in response.get('UserAttributes', [])}
            logger.info(f"Atributos obtenidos para {username}: {attributes}")
            return attributes
        except ClientError as e:
            logger.error(f"Error al obtener atributos del usuario {username}: {e}")
            return {}
        except Exception as e:
            logger.error(f"Error inesperado al obtener atributos del usuario {username}: {e}")
            return {}

    def get_user_by_email(self, email: str) -> dict:
        """
        Busca un usuario en Cognito por su correo electrónico
        y devuelve sus atributos si existe.
        """
        if not self.client or not self.user_pool_id:
            logger.warning("Cliente de Cognito no configurado")
            return {}

        try:
            # Busca al usuario por correo (case-insensitive)
            response = self.client.list_users(
                UserPoolId=self.user_pool_id,
                Filter=f'email = "{email}"',
                Limit=1
            )

            # 🔍 DEBUG: mostrar la respuesta cruda de Cognito
            print("DEBUG RESPONSE:", response)

            users = response.get("Users", [])
            if not users:
                logger.warning(f"No se encontró usuario con el correo {email}")
                return {}

            username = users[0]["Username"]
            logger.info(f"Usuario encontrado: {username} para {email}")

            # Obtén atributos reales con admin_get_user
            return self.get_user_attributes(username)

        except ClientError as e:
            logger.error(f"Error al buscar usuario por correo {email}: {e}")
            return {}
        except Exception as e:
            logger.error(f"Error inesperado al buscar usuario por correo {email}: {e}")
            return {}
    
    def ensure_user_has_default_group(self, username: str, current_groups: list[str] = None) -> bool:
        """
        Asegura que un usuario tenga al menos el grupo por defecto (Clientes)
        
        Args:
            username: El username del usuario
            current_groups: Grupos actuales del usuario (opcional)
            
        Returns:
            True si el usuario tiene o se le asignó el grupo, False en caso contrario
        """
        default_group = settings.COGNITO_DEFAULT_GROUP
        
        # Si no se proporcionan grupos actuales, obtenerlos de Cognito
        if current_groups is None:
            current_groups = self.get_user_groups(username)
        
        # Si el usuario no tiene grupos, asignar el grupo por defecto
        if not current_groups or len(current_groups) == 0:
            logger.info(f"Usuario {username} sin grupos. Asignando grupo por defecto: {default_group}")
            return self.add_user_to_group(username, default_group)
        
        logger.info(f"Usuario {username} ya tiene grupos: {current_groups}")
        return True


# Instancia global del servicio
cognito_service = CognitoService()
