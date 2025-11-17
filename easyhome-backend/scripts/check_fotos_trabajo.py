"""
Script para verificar las fotos de trabajo en la base de datos
Ejecutar con: python scripts/check_fotos_trabajo.py
Uso:
  - python scripts/check_fotos_trabajo.py              # Ver todas las fotos
  - python scripts/check_fotos_trabajo.py <id_proveedor>  # Ver fotos de un proveedor específico
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

def check_fotos_trabajo(engine, id_proveedor=None):
    """Verifica y muestra los datos de la tabla foto_trabajo_anterior"""
    print("\n" + "=" * 120)
    print("📸 DATOS DE TABLA: foto_trabajo_anterior")
    print("=" * 120)

    with engine.connect() as conn:
        # Contar total de fotos
        if id_proveedor:
            result = conn.execute(text("SELECT COUNT(*) FROM foto_trabajo_anterior WHERE id_proveedor = :id"),
                                {"id": id_proveedor})
            total = result.scalar()
            print(f"\n📊 Total de fotos del proveedor {id_proveedor}: {total}")
        else:
            result = conn.execute(text("SELECT COUNT(*) FROM foto_trabajo_anterior"))
            total = result.scalar()
            print(f"\n📊 Total de fotos de trabajo: {total}")

        if total == 0:
            print("\n⚠️  La tabla está VACÍA - No hay fotos de trabajo registradas")
            return

        # Query para obtener fotos con información del proveedor
        query = """
            SELECT
                f.id_foto,
                f.id_proveedor,
                p.nombre_completo,
                u.correo_electronico,
                f.url_imagen,
                f.descripcion,
                f.fecha_subida,
                p.estado_solicitud
            FROM foto_trabajo_anterior f
            INNER JOIN proveedor_servicio p ON f.id_proveedor = p.id_proveedor
            INNER JOIN usuario u ON p.id_proveedor = u.id_usuario
        """

        if id_proveedor:
            query += " WHERE f.id_proveedor = :id"
            query += " ORDER BY f.fecha_subida DESC"
            result = conn.execute(text(query), {"id": id_proveedor})
        else:
            query += " ORDER BY f.fecha_subida DESC LIMIT 50"
            result = conn.execute(text(query))

        rows = result.fetchall()

        if not rows:
            print("\n⚠️  No se encontraron fotos")
            return

        # Encabezado de la tabla
        print("\n   ID   | Prov | Proveedor              | Email                       | S3 Key (url_imagen)                          | Estado      | Fecha")
        print("   " + "-" * 160)

        # Mostrar cada foto
        for row in rows:
            fecha = row.fecha_subida.strftime("%Y-%m-%d %H:%M") if row.fecha_subida else "N/A"
            s3_key_display = row.url_imagen[:45] + "..." if len(row.url_imagen) > 45 else row.url_imagen

            print(f"   {row.id_foto:4d} | {row.id_proveedor:4d} | {row.nombre_completo[:22]:22s} | {row.correo_electronico[:27]:27s} | {s3_key_display:48s} | {row.estado_solicitud[:11]:11s} | {fecha}")

        # Resumen
        print("\n" + "=" * 120)
        print("📊 RESUMEN:")
        print("=" * 120)

        # Contar por proveedor
        if not id_proveedor:
            result = conn.execute(text("""
                SELECT
                    p.id_proveedor,
                    p.nombre_completo,
                    u.correo_electronico,
                    COUNT(f.id_foto) as total_fotos,
                    p.estado_solicitud
                FROM proveedor_servicio p
                INNER JOIN usuario u ON p.id_proveedor = u.id_usuario
                LEFT JOIN foto_trabajo_anterior f ON p.id_proveedor = f.id_proveedor
                GROUP BY p.id_proveedor, p.nombre_completo, u.correo_electronico, p.estado_solicitud
                HAVING COUNT(f.id_foto) > 0
                ORDER BY total_fotos DESC
            """))
            proveedores_con_fotos = result.fetchall()

            print(f"\n   📸 Proveedores con fotos: {len(proveedores_con_fotos)}")
            print("\n   ID   | Proveedor                  | Email                       | Fotos | Estado")
            print("   " + "-" * 100)

            for prov in proveedores_con_fotos:
                print(f"   {prov.id_proveedor:4d} | {prov.nombre_completo[:26]:26s} | {prov.correo_electronico[:27]:27s} | {prov.total_fotos:5d} | {prov.estado_solicitud}")

        # Estadísticas de S3 keys
        print("\n" + "=" * 120)
        print("🗂️  ESTADÍSTICAS DE ALMACENAMIENTO S3:")
        print("=" * 120)

        # Verificar prefijos de S3 keys
        result = conn.execute(text("""
            SELECT
                CASE
                    WHEN url_imagen LIKE 'work-images/%' THEN 'work-images/'
                    WHEN url_imagen LIKE 'publicaciones/%' THEN 'publicaciones/'
                    ELSE 'otro/'
                END as prefijo,
                COUNT(*) as cantidad
            FROM foto_trabajo_anterior
            GROUP BY prefijo
        """))
        prefijos = result.fetchall()

        for prefijo_row in prefijos:
            print(f"   • {prefijo_row.prefijo:20s}: {prefijo_row.cantidad:5d} foto(s)")

        # Advertencias
        result = conn.execute(text("SELECT COUNT(*) FROM foto_trabajo_anterior WHERE url_imagen IS NULL OR url_imagen = ''"))
        fotos_sin_key = result.scalar()

        if fotos_sin_key > 0:
            print(f"\n   ⚠️  ADVERTENCIA: {fotos_sin_key} foto(s) sin S3 key guardado")

def check_proveedores_sin_fotos(engine):
    """Verifica proveedores que NO tienen fotos de trabajo"""
    print("\n" + "=" * 120)
    print("🔍 PROVEEDORES SIN FOTOS DE TRABAJO")
    print("=" * 120)

    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                p.id_proveedor,
                p.nombre_completo,
                u.correo_electronico,
                p.estado_solicitud,
                p.fecha_solicitud
            FROM proveedor_servicio p
            INNER JOIN usuario u ON p.id_proveedor = u.id_usuario
            LEFT JOIN foto_trabajo_anterior f ON p.id_proveedor = f.id_proveedor
            WHERE f.id_foto IS NULL
            ORDER BY p.fecha_solicitud DESC
        """))
        proveedores_sin_fotos = result.fetchall()

        if not proveedores_sin_fotos:
            print("\n✅ Todos los proveedores tienen fotos de trabajo registradas")
            return

        print(f"\n⚠️  {len(proveedores_sin_fotos)} proveedor(es) sin fotos de trabajo:")
        print("\n   ID   | Proveedor                  | Email                       | Estado      | Fecha Solicitud")
        print("   " + "-" * 110)

        for prov in proveedores_sin_fotos:
            fecha = prov.fecha_solicitud.strftime("%Y-%m-%d") if prov.fecha_solicitud else "N/A"
            print(f"   {prov.id_proveedor:4d} | {prov.nombre_completo[:26]:26s} | {prov.correo_electronico[:27]:27s} | {prov.estado_solicitud[:11]:11s} | {fecha}")

        print("\n   💡 Estos proveedores deberían tener fotos si pasaron por el proceso de postulación normal")

def main():
    """Verificar las fotos de trabajo en la base de datos"""
    print("=" * 120)
    print("VERIFICANDO FOTOS DE TRABAJO EN LA BASE DE DATOS")
    print("=" * 120)

    # Verificar si se proporcionó un ID de proveedor
    id_proveedor = None
    if len(sys.argv) > 1:
        try:
            id_proveedor = int(sys.argv[1])
            print(f"\n🔍 Filtrando por proveedor ID: {id_proveedor}")
        except ValueError:
            print(f"\n⚠️  ID de proveedor inválido: {sys.argv[1]}")
            print("   Uso: python scripts/check_fotos_trabajo.py [id_proveedor]")
            sys.exit(1)

    # Construir URL síncrona
    sync_url = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

    print(f"\n📋 Conectando a:")
    print(f"   - Base de datos: {settings.DB_NAME}")
    print(f"   - Host: {settings.DB_HOST}")

    try:
        # Crear engine
        engine = create_engine(sync_url, pool_pre_ping=True)
        print(f"\n✅ Conexión exitosa!")

        # Verificar fotos
        check_fotos_trabajo(engine, id_proveedor)

        # Si no se filtró por proveedor, mostrar proveedores sin fotos
        if not id_proveedor:
            check_proveedores_sin_fotos(engine)

        print("\n" + "=" * 120)
    except Exception as e:
        print(f"\n❌ Error al verificar las fotos: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
