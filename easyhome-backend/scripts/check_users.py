"""
Script para verificar los usuarios en la base de datos
Ejecutar con: python scripts/check_users.py
Uso:
  - python scripts/check_users.py              # Ver todos los usuarios
"""
import sys
import os
from pathlib import Path

# Añadir el directorio raíz al path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))
os.chdir(ROOT_DIR)

from sqlalchemy import create_engine, text
from app.core.config import settings

def check_usuarios_data(engine):
    """Verifica y muestra los datos de la tabla usuarios"""
    print("\n" + "=" * 80)
    print("📋 DATOS DE TABLA: usuarios")
    print("=" * 80)

    with engine.connect() as conn:
        # Contar total de usuarios
        result = conn.execute(text("SELECT COUNT(*) FROM usuarios"))
        total = result.scalar()

        print(f"\n📊 Total de usuarios: {total}")

        if total == 0:
            print("\n⚠️  La tabla está VACÍA - No hay usuarios registrados")
            return

        # Mostrar los primeros 10 usuarios
        print("\n📋 Primeros 10 usuarios:")
        result = conn.execute(text("""
            SELECT id_usuario, nombre_completo, email, fecha_registro
            FROM usuarios
            ORDER BY fecha_registro DESC
            LIMIT 10
        """))
        rows = result.fetchall()
        if rows:
            print("\n   ID  | Nombre                    | Email                      | Fecha registro")
            print("   " + "-" * 80)
            for row in rows:
                fecha = row.fecha_registro.strftime("%Y-%m-%d %H:%M") if row.fecha_registro else "N/A"
                print(f"   {row.id_usuario:3d} | {row.nombre_completo[:25]:25s} | {row.email[:25]:25s} | {fecha}")

def main():
    """Verificar los usuarios en la base de datos"""
    print("=" * 80)
    print("VERIFICANDO USUARIOS EN LA BASE DE DATOS")
    print("=" * 80)

    # Construir URL síncrona
    sync_url = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

    print(f"\n📋 Conectando a:")
    print(f"   - Base de datos: {settings.DB_NAME}")
    print(f"   - Host: {settings.DB_HOST}")

    try:
        # Crear engine
        engine = create_engine(sync_url, pool_pre_ping=True)
        print(f"\n✅ Conexión exitosa!")
        check_usuarios_data(engine)
        print("\n" + "=" * 80)
    except Exception as e:
        print(f"\n❌ Error al verificar los usuarios: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
