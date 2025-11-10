"""
Script para verificar las tablas en la base de datos
Ejecutar con: python scripts/check_tables.py
"""
import sys
import os
from pathlib import Path

# Añadir el directorio raíz al path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))
os.chdir(ROOT_DIR)

from sqlalchemy import create_engine, inspect
from app.core.config import settings


def main():
    """Verificar las tablas en la base de datos"""
    print("=" * 80)
    print("VERIFICANDO TABLAS EN LA BASE DE DATOS")
    print("=" * 80)
    
    # Construir URL síncrona
    sync_url = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    
    print(f"\n📋 Conectando a:")
    print(f"   - Base de datos: {settings.DB_NAME}")
    print(f"   - Host: {settings.DB_HOST}")
    
    try:
        # Crear engine
        engine = create_engine(sync_url, pool_pre_ping=True)
        
        # Crear inspector
        inspector = inspect(engine)
        
        # Obtener nombres de tablas
        table_names = inspector.get_table_names()
        
        print(f"\n✅ Conexión exitosa!")
        print(f"\n📊 Total de tablas encontradas: {len(table_names)}\n")
        
        if table_names:
            print("=" * 80)
            print("TABLAS EN LA BASE DE DATOS:")
            print("=" * 80)
            
            for i, table_name in enumerate(sorted(table_names), 1):
                # Obtener número de columnas
                columns = inspector.get_columns(table_name)
                print(f"{i:2d}. {table_name:<40} ({len(columns)} columnas)")
            
            print("\n" + "=" * 80)
            print("DETALLES DE TABLAS:")
            print("=" * 80)
            
            for table_name in sorted(table_names):
                print(f"\n📋 Tabla: {table_name}")
                columns = inspector.get_columns(table_name)
                
                print("   Columnas:")
                for col in columns:
                    nullable = "NULL" if col['nullable'] else "NOT NULL"
                    print(f"      - {col['name']:<30} {str(col['type']):<20} {nullable}")
                
                # Mostrar claves primarias
                pk = inspector.get_pk_constraint(table_name)
                if pk and pk['constrained_columns']:
                    print(f"   Primary Key: {', '.join(pk['constrained_columns'])}")
                
                # Mostrar foreign keys
                fks = inspector.get_foreign_keys(table_name)
                if fks:
                    print("   Foreign Keys:")
                    for fk in fks:
                        print(f"      - {fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}")
        
        else:
            print("⚠️  No se encontraron tablas en la base de datos.")
            print("   Ejecuta: python scripts/init_db_sync.py")
        
        print("\n" + "=" * 80)
        
    except Exception as e:
        print(f"\n❌ Error al verificar las tablas: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
