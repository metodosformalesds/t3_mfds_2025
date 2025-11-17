"""
Script para verificar los proveedores de servicio en la base de datos
Ejecutar con: python scripts/check_proveedores.py
Uso:
  - python scripts/check_proveedores.py           # Ver todos los proveedores
  - python scripts/check_proveedores.py --missing  # Solo proveedores con campos faltantes
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

def check_proveedores_data(engine, missing_only=False):
    """Verifica y muestra los datos de la tabla proveedor_servicio"""
    print("\n" + "=" * 100)
    print("📋 DATOS DE TABLA: proveedor_servicio")
    print("=" * 100)

    with engine.connect() as conn:
        # Contar total de proveedores
        result = conn.execute(text("SELECT COUNT(*) FROM proveedor_servicio"))
        total = result.scalar()

        print(f"\n📊 Total de proveedores: {total}")

        if total == 0:
            print("\n⚠️  La tabla está VACÍA - No hay proveedores registrados")
            return

        # Contar proveedores con campos faltantes (campos requeridos: curp, años_experiencia)
        result = conn.execute(text("""
            SELECT COUNT(*) FROM proveedor_servicio
            WHERE curp IS NULL OR años_experiencia IS NULL
        """))
        missing_count = result.scalar()

        print(f"⚠️  Proveedores con campos obligatorios faltantes: {missing_count}")

        # Query para obtener proveedores
        query = """
            SELECT
                ps.id_proveedor,
                ps.nombre_completo,
                u.correo_electronico,
                ps.curp,
                ps.años_experiencia,
                ps.estado_solicitud,
                ps.fecha_solicitud,
                ps.calificacion_promedio,
                ps.cantidad_trabajos_realizados
            FROM proveedor_servicio ps
            INNER JOIN usuario u ON ps.id_proveedor = u.id_usuario
        """

        if missing_only:
            query += " WHERE ps.curp IS NULL OR ps.años_experiencia IS NULL"
            print("\n📋 Mostrando SOLO proveedores con campos faltantes:")
        else:
            print("\n📋 Todos los proveedores:")

        query += " ORDER BY ps.fecha_solicitud DESC"

        result = conn.execute(text(query))
        rows = result.fetchall()

        if not rows:
            if missing_only:
                print("\n✅ No hay proveedores con campos faltantes")
            return

        # Encabezado de la tabla
        print("\n   ID  | Nombre                     | Correo                      | CURP            | Años Exp | Estado      | Calif | Trabajos")
        print("   " + "-" * 140)

        # Mostrar cada proveedor
        for row in rows:
            curp_display = row.curp if row.curp else "❌ FALTA"
            años_display = str(row.años_experiencia) if row.años_experiencia is not None else "❌ FALTA"
            calif_display = str(row.calificacion_promedio) if row.calificacion_promedio else "N/A"

            # Marcar con ⚠️ si faltan campos
            marker = "⚠️ " if (not row.curp or row.años_experiencia is None) else "   "

            print(f"{marker}{row.id_proveedor:3d} | {row.nombre_completo[:25]:25s} | {row.correo_electronico[:26]:26s} | {curp_display:15s} | {años_display:8s} | {row.estado_solicitud[:11]:11s} | {calif_display:5s} | {row.cantidad_trabajos_realizados:8d}")

        # Resumen de campos faltantes
        if not missing_only:
            print("\n" + "=" * 100)
            print("📊 RESUMEN DE CAMPOS OBLIGATORIOS FALTANTES:")
            print("=" * 100)

            # Contar por campo
            result = conn.execute(text("SELECT COUNT(*) FROM proveedor_servicio WHERE curp IS NULL"))
            curp_missing = result.scalar()

            result = conn.execute(text("SELECT COUNT(*) FROM proveedor_servicio WHERE años_experiencia IS NULL"))
            años_missing = result.scalar()

            print(f"\n   • CURP faltante: {curp_missing} proveedor(es)")
            print(f"   • Años de experiencia faltante: {años_missing} proveedor(es)")

            if curp_missing > 0 or años_missing > 0:
                print("\n⚠️  ADVERTENCIA: Estos proveedores NO pueden crear publicaciones hasta completar estos campos")
                print("   Para ver solo los registros con problemas, ejecuta:")
                print("   python scripts/check_proveedores.py --missing")

def check_usuarios_tipo_proveedor(engine):
    """Verifica usuarios con tipo 'proveedor' que NO tienen registro en proveedor_servicio"""
    print("\n" + "=" * 100)
    print("🔍 VERIFICANDO USUARIOS TIPO PROVEEDOR SIN REGISTRO EN PROVEEDOR_SERVICIO")
    print("=" * 100)

    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                u.id_usuario,
                u.nombre,
                u.correo_electronico,
                u.tipo_usuario,
                u.estado_cuenta
            FROM usuario u
            LEFT JOIN proveedor_servicio ps ON u.id_usuario = ps.id_proveedor
            WHERE u.tipo_usuario = 'proveedor' AND ps.id_proveedor IS NULL
        """))
        rows = result.fetchall()

        if not rows:
            print("\n✅ Todos los usuarios tipo 'proveedor' tienen su registro en proveedor_servicio")
            return

        print(f"\n⚠️  {len(rows)} usuario(s) con tipo 'proveedor' sin registro en proveedor_servicio:")
        print("\n   ID  | Nombre                     | Correo                              | Estado")
        print("   " + "-" * 90)

        for row in rows:
            print(f"   {row.id_usuario:3d} | {row.nombre[:25]:25s} | {row.correo_electronico[:35]:35s} | {row.estado_cuenta:10s}")

        print("\n⚠️  ADVERTENCIA: Estos usuarios tienen tipo_usuario='proveedor' pero NO pueden crear publicaciones")
        print("   porque falta su registro en la tabla proveedor_servicio")

def main():
    """Verificar los proveedores de servicio en la base de datos"""
    print("=" * 100)
    print("VERIFICANDO PROVEEDORES DE SERVICIO EN LA BASE DE DATOS")
    print("=" * 100)

    # Verificar argumentos
    missing_only = "--missing" in sys.argv

    # Construir URL síncrona
    sync_url = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

    print(f"\n📋 Conectando a:")
    print(f"   - Base de datos: {settings.DB_NAME}")
    print(f"   - Host: {settings.DB_HOST}")

    try:
        # Crear engine
        engine = create_engine(sync_url, pool_pre_ping=True)
        print(f"\n✅ Conexión exitosa!")

        # Verificar proveedores
        check_proveedores_data(engine, missing_only)

        # Verificar usuarios tipo proveedor sin registro
        if not missing_only:
            check_usuarios_tipo_proveedor(engine)

        print("\n" + "=" * 100)
    except Exception as e:
        print(f"\n❌ Error al verificar los proveedores: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
