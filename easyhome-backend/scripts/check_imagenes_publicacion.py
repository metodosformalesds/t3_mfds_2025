"""
Script para verificar imágenes de publicaciones en la base de datos
Ejecutar con: python scripts/check_imagenes_publicacion.py
"""
import sys
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))
os.chdir(ROOT_DIR)

from sqlalchemy import create_engine, text
from app.core.config import settings

def main():
    print("=" * 100)
    print("VERIFICANDO IMÁGENES DE PUBLICACIONES")
    print("=" * 100)

    sync_url = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

    try:
        engine = create_engine(sync_url, pool_pre_ping=True)
        print(f"\n✅ Conexión exitosa a {settings.DB_NAME}")

        with engine.connect() as conn:
            # Verificar imágenes
            result = conn.execute(text("""
                SELECT
                    i.id_imagen,
                    i.id_publicacion,
                    p.titulo,
                    i.url_imagen,
                    i.orden
                FROM imagen_publicacion i
                INNER JOIN publicacion_servicio p ON i.id_publicacion = p.id_publicacion
                ORDER BY i.id_publicacion, i.orden
            """))
            rows = result.fetchall()

            if not rows:
                print("\n⚠️  No hay imágenes de publicaciones en la BD")
                return

            print(f"\n📸 Total de imágenes: {len(rows)}")
            print("\n   ID Img | ID Pub | Título                     | S3 Key (url_imagen)")
            print("   " + "-" * 120)

            for row in rows:
                s3_key = row.url_imagen[:70] + "..." if len(row.url_imagen) > 70 else row.url_imagen
                print(f"   {row.id_imagen:6d} | {row.id_publicacion:6d} | {row.titulo[:26]:26s} | {s3_key}")

            # Mostrar estadísticas
            result = conn.execute(text("""
                SELECT
                    p.id_publicacion,
                    p.titulo,
                    COUNT(i.id_imagen) as total_imagenes
                FROM publicacion_servicio p
                LEFT JOIN imagen_publicacion i ON p.id_publicacion = i.id_publicacion
                GROUP BY p.id_publicacion, p.titulo
                ORDER BY p.id_publicacion
            """))
            pubs = result.fetchall()

            print("\n" + "=" * 100)
            print("📊 PUBLICACIONES Y SUS IMÁGENES:")
            print("=" * 100)
            print("\n   ID Pub | Título                          | Imágenes")
            print("   " + "-" * 80)

            for pub in pubs:
                estado = "✅" if pub.total_imagenes > 0 else "❌"
                print(f"   {pub.id_publicacion:6d} | {pub.titulo[:32]:32s} | {estado} {pub.total_imagenes}")

        print("\n" + "=" * 100)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
