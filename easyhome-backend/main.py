from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import example, auth, categories, solicitud, perfil_proveedor, perfil_usuario, publicacion

app = FastAPI(
    title="EasyHome Backend API",
    description="API for managing EasyHome smart home devices and services.",
    version="1.0.0",
    redirect_slashes=False,
)

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permitir todos los orígenes
    allow_credentials=False,  # ← Cambia a False cuando uses "*"
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],  # ← Agrega esto
)

app.include_router(example.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["Categories"])
app.include_router(publicacion.router, prefix="/api/v1", tags=["Publicaciones"])
app.include_router(solicitud.router, prefix="/api/v1") 
app.include_router(perfil_proveedor.router, prefix="/api/v1")
app.include_router(perfil_usuario.router, prefix="/api/v1")



@app.get("/")
def root():
    return {"message": "Welcome to the EasyHome Backend API!"}