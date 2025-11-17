"""
Script para verificar conexión con S3 y existencia de imágenes
Ejecutar con: python scripts/check_s3_connection.py
"""
import sys
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(ROOT_DIR))
os.chdir(ROOT_DIR)

from sqlalchemy import create_engine, text
from app.core.config import settings
from app.services.s3_service import s3_service
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

def test_s3_credentials():
    """Verifica que las credenciales de AWS estén configuradas"""
    print("\n" + "=" * 100)
    print("🔐 VERIFICANDO CREDENCIALES DE AWS")
    print("=" * 100)

    try:
        # Intentar crear cliente S3
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )

        # Intentar listar buckets
        response = s3_client.list_buckets()
        buckets = [bucket['Name'] for bucket in response['Buckets']]

        print(f"\n✅ Credenciales válidas")
        print(f"📦 Buckets disponibles: {len(buckets)}")
        for bucket in buckets:
            marker = "✓" if bucket == settings.S3_BUCKET_NAME else " "
            print(f"   [{marker}] {bucket}")

        # Verificar que el bucket configurado existe
        if settings.S3_BUCKET_NAME in buckets:
            print(f"\n✅ Bucket '{settings.S3_BUCKET_NAME}' existe y es accesible")
            return True, s3_client
        else:
            print(f"\n❌ Bucket '{settings.S3_BUCKET_NAME}' NO existe o no es accesible")
            return False, None

    except NoCredentialsError:
        print("\n❌ No se encontraron credenciales de AWS")
        return False, None
    except Exception as e:
        print(f"\n❌ Error al verificar credenciales: {e}")
        return False, None

def check_file_exists(s3_client, s3_key):
    """Verifica si un archivo existe en S3"""
    try:
        s3_client.head_object(Bucket=settings.S3_BUCKET_NAME, Key=s3_key)
        return True
    except ClientError as e:
        if e.response['Error']['Code'] == '404':
            return False
        else:
            raise

def list_s3_files(s3_client, prefix=""):
    """Lista archivos en S3 con un prefijo dado"""
    try:
        response = s3_client.list_objects_v2(
            Bucket=settings.S3_BUCKET_NAME,
            Prefix=prefix,
            MaxKeys=100
        )

        if 'Contents' not in response:
            return []

        files = []
        for obj in response['Contents']:
            files.append({
                'key': obj['Key'],
                'size': obj['Size'],
                'last_modified': obj['LastModified']
            })
        return files
    except Exception as e:
        print(f"Error listando archivos: {e}")
        return []

def check_images_in_s3(s3_client):
    """Verifica qué imágenes de publicaciones existen en S3"""
    print("\n" + "=" * 100)
    print("📸 VERIFICANDO IMÁGENES EN S3")
    print("=" * 100)

    # Conectar a BD para obtener las S3 keys registradas
    sync_url = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    engine = create_engine(sync_url, pool_pre_ping=True)

    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT
                i.id_imagen,
                i.id_publicacion,
                p.titulo,
                i.url_imagen
            FROM imagen_publicacion i
            INNER JOIN publicacion_servicio p ON i.id_publicacion = p.id_publicacion
            ORDER BY i.id_publicacion, i.orden
        """))
        images = result.fetchall()

    if not images:
        print("\n⚠️  No hay imágenes registradas en la BD")
        return

    print(f"\n📋 Imágenes registradas en BD: {len(images)}")
    print("\n   ID Img | ID Pub | Título                     | Existe en S3 | S3 Key")
    print("   " + "-" * 130)

    exists_count = 0
    missing_count = 0

    for img in images:
        exists = check_file_exists(s3_client, img.url_imagen)
        status = "✅ SÍ" if exists else "❌ NO"
        s3_key_short = img.url_imagen[:50] + "..." if len(img.url_imagen) > 50 else img.url_imagen

        print(f"   {img.id_imagen:6d} | {img.id_publicacion:6d} | {img.titulo[:26]:26s} | {status:12s} | {s3_key_short}")

        if exists:
            exists_count += 1
        else:
            missing_count += 1

    print("\n" + "=" * 100)
    print(f"📊 RESUMEN:")
    print(f"   ✅ Existen en S3:     {exists_count}")
    print(f"   ❌ NO existen en S3:  {missing_count}")

    if missing_count > 0:
        print("\n⚠️  ADVERTENCIA: Hay imágenes registradas en BD que NO existen en S3")
        print("   Esto causará errores al intentar mostrarlas en el frontend")

def test_presigned_url():
    """Prueba generar una URL pre-firmada"""
    print("\n" + "=" * 100)
    print("🔗 PROBANDO GENERACIÓN DE URLs PRE-FIRMADAS")
    print("=" * 100)

    # Conectar a BD para obtener una S3 key
    sync_url = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    engine = create_engine(sync_url, pool_pre_ping=True)

    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT url_imagen FROM imagen_publicacion LIMIT 1
        """))
        row = result.fetchone()

    if not row:
        print("\n⚠️  No hay imágenes para probar")
        return

    s3_key = row.url_imagen
    print(f"\n📄 Probando con: {s3_key}")

    try:
        url = s3_service.get_presigned_url(s3_key, expiration=3600)
        print(f"\n✅ URL pre-firmada generada exitosamente:")
        print(f"   {url[:100]}...")
        print(f"\n   Expira en: 3600 segundos (1 hora)")

        # Verificar que la URL tenga los parámetros necesarios
        if "AWSAccessKeyId" in url and "Signature" in url and "Expires" in url:
            print(f"   ✅ URL contiene parámetros de firma válidos")
        else:
            print(f"   ⚠️  URL parece incompleta o inválida")

    except Exception as e:
        print(f"\n❌ Error al generar URL pre-firmada: {e}")

def list_all_s3_folders():
    """Lista todas las carpetas/prefijos en el bucket"""
    print("\n" + "=" * 100)
    print("📁 ESTRUCTURA DE CARPETAS EN S3")
    print("=" * 100)

    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )

        # Listar archivos en cada carpeta esperada
        folders = ['publicaciones/', 'work-images/', 'profile-images/']

        for folder in folders:
            files = list_s3_files(s3_client, prefix=folder)
            print(f"\n📂 {folder}")
            if files:
                print(f"   Archivos: {len(files)}")
                for f in files[:5]:  # Mostrar solo los primeros 5
                    size_kb = f['size'] / 1024
                    print(f"   • {f['key']} ({size_kb:.1f} KB)")
                if len(files) > 5:
                    print(f"   ... y {len(files) - 5} más")
            else:
                print(f"   ⚠️  Vacía o no existe")

    except Exception as e:
        print(f"\n❌ Error listando carpetas: {e}")

def main():
    print("=" * 100)
    print("DIAGNÓSTICO COMPLETO DE CONEXIÓN S3")
    print("=" * 100)

    print(f"\n📋 Configuración actual:")
    print(f"   Bucket: {settings.S3_BUCKET_NAME}")
    print(f"   Región: {settings.AWS_REGION}")
    print(f"   Access Key ID: {settings.AWS_ACCESS_KEY_ID[:10]}...")

    # 1. Verificar credenciales
    credentials_ok, s3_client = test_s3_credentials()

    if not credentials_ok:
        print("\n❌ No se puede continuar sin credenciales válidas")
        sys.exit(1)

    # 2. Listar estructura de carpetas
    list_all_s3_folders()

    # 3. Verificar imágenes específicas
    check_images_in_s3(s3_client)

    # 4. Probar URLs pre-firmadas
    test_presigned_url()

    print("\n" + "=" * 100)
    print("✅ Diagnóstico completado")
    print("=" * 100)

if __name__ == "__main__":
    main()
