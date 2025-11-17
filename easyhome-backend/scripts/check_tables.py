"""
Script para verificar las tablas en la base de datos
Ejecutar con: python scripts/check_tables.py
Uso:
  - python scripts/check_tables.py              # Ver todas las tablas
  - python scripts/check_tables.py solicitudes  # Ver solo tabla proveedor_servicio con datos
"""
import sys
import os
from pathlib import Path

# Añadir el directorio raíz al path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))
os.chdir(ROOT_DIR)

from sqlalchemy import create_engine, inspect, text
from app.core.config import settings


def check_proveedor_servicio_data(engine):
    """Verifica y muestra los datos de la tabla proveedor_servicio"""
    print("\n" + "=" * 80)
    print("📋 DATOS DE TABLA: proveedor_servicio")
    print("=" * 80)

    with engine.connect() as conn:
        # Contar total de registros
        result = conn.execute(text("SELECT COUNT(*) FROM proveedor_servicio"))
        total = result.scalar()

        print(f"\n📊 Total de solicitudes: {total}")

        if total == 0:
            print("\n⚠️  La tabla está VACÍA - No hay solicitudes registradas")
            return

        # Contar por estado
        print("\n📈 Solicitudes por estado:")
        result = conn.execute(text("""
            SELECT estado_solicitud, COUNT(*) as cantidad
            FROM proveedor_servicio
            GROUP BY estado_solicitud
        """))
        for row in result:
            print(f"   - {row.estado_solicitud}: {row.cantidad}")

        # Mostrar últimas 5 solicitudes
        print("\n📋 Últimas 5 solicitudes:")
        result = conn.execute(text("""
            SELECT
                id_proveedor,
                nombre_completo,
                estado_solicitud,
                especializaciones,
                años_experiencia,
                fecha_solicitud
            FROM proveedor_servicio
            ORDER BY fecha_solicitud DESC
            LIMIT 5
        """))

        rows = result.fetchall()
        if rows:
            print("\n   ID  | Nombre                    | Estado      | Especialización       | Años | Fecha")
            print("   " + "-" * 95)
            for row in rows:
                fecha = row.fecha_solicitud.strftime("%Y-%m-%d %H:%M") if row.fecha_solicitud else "N/A"
                especialidades = (row.especializaciones[:20] + "...") if row.especializaciones and len(row.especializaciones) > 20 else (row.especializaciones or "N/A")
                print(f"   {row.id_proveedor:3d} | {row.nombre_completo[:25]:25s} | {row.estado_solicitud:11s} | {especialidades:21s} | {row.años_experiencia:4d} | {fecha}")

        # Contar fotos asociadas
        print("\n📷 Fotos de trabajo:")
        result = conn.execute(text("""
            SELECT COUNT(*) as total_fotos
            FROM foto_trabajo_anterior
        """))
        total_fotos = result.scalar()
        print(f"   Total de fotos guardadas: {total_fotos}")

        if total_fotos > 0:
            result = conn.execute(text("""
                SELECT
                    ps.nombre_completo,
                    COUNT(ft.id_foto) as num_fotos
                FROM proveedor_servicio ps
                LEFT JOIN foto_trabajo_anterior ft ON ps.id_proveedor = ft.id_proveedor
                GROUP BY ps.id_proveedor, ps.nombre_completo
                HAVING COUNT(ft.id_foto) > 0
                ORDER BY COUNT(ft.id_foto) DESC
                LIMIT 5
            """))

            print("\n   Proveedores con más fotos:")
            for row in result:
                print(f"      - {row.nombre_completo}: {row.num_fotos} foto(s)")


def main():
    """Verificar las tablas en la base de datos"""
    # Verificar si se pasó argumento 'solicitudes'
    check_solicitudes_only = len(sys.argv) > 1 and sys.argv[1] == 'solicitudes'

    print("=" * 80)
    if check_solicitudes_only:
        print("VERIFICANDO TABLA proveedor_servicio")
    else:
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

        print(f"\n✅ Conexión exitosa!")

        # Si solo queremos ver solicitudes
        if check_solicitudes_only:
            check_proveedor_servicio_data(engine)
            print("\n" + "=" * 80)
            return

        # Crear inspector
        inspector = inspect(engine)

        # Obtener nombres de tablas
        table_names = inspector.get_table_names()

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

        # Mostrar datos de proveedor_servicio si existe
        if 'proveedor_servicio' in table_names:
            check_proveedor_servicio_data(engine)

        print("\n" + "=" * 80)

    except Exception as e:
        print(f"\n❌ Error al verificar las tablas: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
