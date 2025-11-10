"""
Script para inicializar la base de datos (VERSION SINCRONA PURA)
Ejecutar con: python scripts/init_db_sync.py
"""
import sys
from pathlib import Path

# Añadir el directorio raíz al path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))

from sqlalchemy import create_engine
from app.core.config import settings


def main():
    """Inicializar la base de datos usando solo SQLAlchemy síncrono"""
    print("=" * 80)
    print("INICIALIZANDO BASE DE DATOS EASYHOME (SYNC)")
    print("=" * 80)
    print(f"\n📋 Configuración:")
    print(f"   - Base de datos: {settings.DB_NAME}")
    print(f"   - Usuario: {settings.DB_USER}")
    print(f"   - Host: {settings.DB_HOST}:{settings.DB_PORT}")
    
    # Construir URL síncrona manualmente
    sync_url = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    print(f"   - URL: {sync_url}")
    print("\n🔄 Creando tablas...\n")
    
    try:
        # Crear engine síncrono directamente
        engine = create_engine(
            sync_url,
            pool_pre_ping=True,
            echo=True,  # Mostrar SQL queries
        )
        
        # Importar Base y modelos
        from app.models.base import Base
        from app.models import (
            Usuario,
            Proveedor_Servicio,
            Categoria_Servicio,
            Publicacion_Servicio,
            Imagen_Publicacion,
            Publicacion_Etiqueta,
            Etiqueta,
            Foto_Trabajo_Anterior,
            Servicio_Contratado,
            Alerta_Sistema,
            Reseña_Servicio,
            Imagen_Reseña,
            Plan_Suscripcion,
            Historial_Suscripcion,
            Paquete_Publicidad,
            Solicitud_Paquete_Publicitario,
            Publicidad_Activa,
            Reporte_Usuario,
            Token_Recuperacion_Password,
            Reporte_Mensual_Premium,
        )
        
        # Crear todas las tablas
        Base.metadata.create_all(bind=engine)
        
        print("\n" + "=" * 80)
        print("✅ Base de datos inicializada correctamente!")
        print("=" * 80)
        
        # Mostrar tablas creadas
        print("\n📊 Tablas creadas:")
        for table_name in Base.metadata.tables.keys():
            print(f"   ✓ {table_name}")
        
    except Exception as e:
        print("\n" + "=" * 80)
        print(f"❌ Error al inicializar la base de datos: {e}")
        print("=" * 80)
        print("\n💡 Verifica que:")
        print("   1. PostgreSQL esté instalado y corriendo")
        print("   2. La base de datos exista")
        print("   3. Las credenciales en .env sean correctas")
        print("   4. El servidor PostgreSQL permita conexiones desde esta IP")
        import traceback
        print("\n🔍 Traceback completo:")
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
