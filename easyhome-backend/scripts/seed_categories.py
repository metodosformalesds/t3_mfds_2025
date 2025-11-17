"""
Script para insertar categorías iniciales en la base de datos
"""
import sys
import os

# Agregar el directorio padre al path para importar los módulos
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Categoria_Servicio
from app.core.config import settings

def seed_categories():
    """Inserta categorías iniciales en la base de datos"""
    
    # Crear engine con la URL sincrónica
    db_url = settings.database_url
    engine = create_engine(db_url, echo=True)
    
    # Crear sesión
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()
    
    try:
        # Verificar si ya hay categorías
        existing_count = db.query(Categoria_Servicio).count()
        if existing_count > 0:
            print(f"⚠️  Ya existen {existing_count} categorías en la base de datos.")
            response = input("¿Deseas agregar más categorías de todos modos? (s/n): ")
            if response.lower() != 's':
                print("❌ Operación cancelada.")
                return
        
        # Categorías iniciales
        categorias = [
            {
                "nombre_categoria": "Carpintería",
                "descripcion": "Servicios profesionales de carpintería para la creación, reparación y restauración de muebles y estructuras de madera.",
                "icono_url": None,
                "orden_visualizacion": 1
            },
            {
                "nombre_categoria": "Electricidad",
                "descripcion": "Servicios profesionales de instalación, reparación y mantenimiento eléctrico residencial y comercial.",
                "icono_url": None,
                "orden_visualizacion": 2
            },
            {
                "nombre_categoria": "Plomería",
                "descripcion": "Servicios profesionales de instalación, reparación y mantenimiento de sistemas hidráulicos y sanitarios.",
                "icono_url": None,
                "orden_visualizacion": 3
            },
            {
                "nombre_categoria": "Limpieza",
                "descripcion": "Servicios profesionales de limpieza residencial y comercial.",
                "icono_url": None,
                "orden_visualizacion": 4
            },
            {
                "nombre_categoria": "Pintura",
                "descripcion": "Servicios profesionales de pintura interior y exterior para hogares y negocios.",
                "icono_url": None,
                "orden_visualizacion": 5
            },
            {
                "nombre_categoria": "Construcción",
                "descripcion": "Servicios profesionales de construcción, remodelación y ampliación de espacios.",
                "icono_url": None,
                "orden_visualizacion": 6
            }
        ]
        
        # Insertar categorías
        categorias_insertadas = 0
        for cat_data in categorias:
            # Verificar si ya existe
            existing = db.query(Categoria_Servicio).filter(
                Categoria_Servicio.nombre_categoria == cat_data["nombre_categoria"]
            ).first()
            
            if existing:
                print(f"⏭️  Categoría '{cat_data['nombre_categoria']}' ya existe, saltando...")
                continue
            
            categoria = Categoria_Servicio(**cat_data)
            db.add(categoria)
            categorias_insertadas += 1
            print(f"✅ Agregada: {cat_data['nombre_categoria']}")
        
        # Guardar cambios
        db.commit()
        print(f"\n🎉 ¡Listo! Se insertaron {categorias_insertadas} categorías nuevas.")
        
        # Mostrar total
        total = db.query(Categoria_Servicio).count()
        print(f"📊 Total de categorías en la base de datos: {total}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Iniciando seed de categorías...")
    seed_categories()
