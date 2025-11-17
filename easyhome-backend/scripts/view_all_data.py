"""
Script para visualizar todos los registros de todas las tablas de la base de datos
Ejecutar con: python scripts/view_all_data.py
Uso:
  - python scripts/view_all_data.py              # Ver todos los registros de todas las tablas
  - python scripts/view_all_data.py --limit 5    # Limitar a 5 registros por tabla
  - python scripts/view_all_data.py --table usuario  # Ver solo una tabla específica
"""
import sys
import os
from pathlib import Path
from datetime import datetime

# Añadir el directorio raíz al path
ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))
os.chdir(ROOT_DIR)

from sqlalchemy import create_engine, inspect, text
from app.core.config import settings


def format_value(value, max_length=30):
    """Formatea un valor para mostrarlo en tabla"""
    if value is None:
        return "NULL"
    elif isinstance(value, datetime):
        return value.strftime("%Y-%m-%d %H:%M:%S")
    elif isinstance(value, bool):
        return "✓" if value else "✗"
    else:
        value_str = str(value)
        if len(value_str) > max_length:
            return value_str[:max_length-3] + "..."
        return value_str


def view_table_data(engine, table_name, limit=None):
    """Visualiza todos los registros de una tabla específica"""
    print("\n" + "=" * 100)
    print(f"📋 TABLA: {table_name}")
    print("=" * 100)

    with engine.connect() as conn:
        # Contar total de registros
        try:
            result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
            total = result.scalar()

            print(f"\n📊 Total de registros: {total}")

            if total == 0:
                print(f"\n⚠️  La tabla '{table_name}' está VACÍA - No hay registros")
                return

            # Obtener información de columnas
            inspector = inspect(engine)
            columns = inspector.get_columns(table_name)
            column_names = [col['name'] for col in columns]

            # Construir query
            query = f"SELECT * FROM {table_name}"
            if limit:
                query += f" LIMIT {limit}"

            # Ejecutar query
            result = conn.execute(text(query))
            rows = result.fetchall()

            if not rows:
                print(f"\n⚠️  No se pudieron obtener registros de la tabla '{table_name}'")
                return

            # Mostrar encabezado
            print(f"\n📄 Mostrando {len(rows)} de {total} registro(s):")
            print()

            # Crear encabezado de la tabla
            header = " | ".join([f"{col[:20]:20s}" for col in column_names])
            print("   " + header)
            print("   " + "-" * len(header))

            # Mostrar cada registro
            for row in rows:
                # Convertir row a diccionario si es necesario
                row_dict = dict(row._mapping) if hasattr(row, '_mapping') else dict(zip(column_names, row))

                values = []
                for col_name in column_names:
                    value = row_dict.get(col_name)
                    formatted = format_value(value, max_length=20)
                    values.append(f"{formatted:20s}")

                row_str = " | ".join(values)
                print("   " + row_str)

            if limit and total > limit:
                print(f"\n   ... y {total - limit} registro(s) más")
                print(f"   💡 Usa --limit N para ver más registros o --table {table_name} para ver solo esta tabla")

        except Exception as e:
            print(f"\n❌ Error al leer la tabla '{table_name}': {e}")


def view_all_tables(engine, limit=None, specific_table=None):
    """Visualiza todos los registros de todas las tablas"""
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    if not table_names:
        print("\n⚠️  No se encontraron tablas en la base de datos")
        return

    # Si se especificó una tabla, verificar que existe
    if specific_table:
        if specific_table not in table_names:
            print(f"\n❌ La tabla '{specific_table}' no existe en la base de datos")
            print(f"\n📋 Tablas disponibles:")
            for table in sorted(table_names):
                print(f"   - {table}")
            return
        table_names = [specific_table]

    print(f"\n📊 Total de tablas a visualizar: {len(table_names)}")

    # Ordenar tablas alfabéticamente
    for table_name in sorted(table_names):
        view_table_data(engine, table_name, limit)

    # Resumen final
    print("\n" + "=" * 100)
    print("📊 RESUMEN GENERAL")
    print("=" * 100)

    with engine.connect() as conn:
        print("\n   Tabla                                  | Total Registros")
        print("   " + "-" * 60)

        total_records = 0
        for table_name in sorted(table_names):
            try:
                result = conn.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
                count = result.scalar()
                total_records += count
                print(f"   {table_name:40s} | {count:15,d}")
            except Exception as e:
                print(f"   {table_name:40s} | Error: {str(e)[:30]}")

        print("   " + "-" * 60)
        print(f"   {'TOTAL':40s} | {total_records:15,d}")


def main():
    """Visualizar todos los registros de todas las tablas"""
    print("=" * 100)
    print("VISUALIZANDO TODOS LOS REGISTROS DE LA BASE DE DATOS")
    print("=" * 100)

    # Parsear argumentos
    limit = None
    specific_table = None

    i = 1
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg == "--limit" and i + 1 < len(sys.argv):
            try:
                limit = int(sys.argv[i + 1])
                i += 2
            except ValueError:
                print(f"❌ Error: --limit requiere un número entero")
                sys.exit(1)
        elif arg == "--table" and i + 1 < len(sys.argv):
            specific_table = sys.argv[i + 1]
            i += 2
        else:
            i += 1

    # Si no se especificó límite, usar 10 por defecto
    if limit is None and specific_table is None:
        limit = 10
        print("\n💡 Mostrando los primeros 10 registros de cada tabla (usa --limit N para cambiar)")

    # Construir URL síncrona
    sync_url = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

    print(f"\n📋 Conectando a:")
    print(f"   - Base de datos: {settings.DB_NAME}")
    print(f"   - Host: {settings.DB_HOST}")
    print(f"   - Puerto: {settings.DB_PORT}")

    try:
        # Crear engine
        engine = create_engine(sync_url, pool_pre_ping=True)
        print(f"\n✅ Conexión exitosa!")

        # Visualizar todas las tablas
        view_all_tables(engine, limit, specific_table)

        print("\n" + "=" * 100)
        print("✅ Visualización completada")
        print("=" * 100)

    except Exception as e:
        print(f"\n❌ Error al conectar con la base de datos: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
