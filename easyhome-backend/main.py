from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import (
    example,
    auth,
    categories,
    solicitud,
    perfil_proveedor,
    perfil_usuario,
    publicacion,
    reseña,
    status_servicio,
)

app = FastAPI(
    title="EasyHome Backend API",
    description="API for managing EasyHome smart home devices and services.",
    version="1.0.0",
    redirect_slashes=False
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Routers CON /api prefix (para API Gateway stage "api")
app.include_router(example.router, prefix="/api/api/v1")
app.include_router(auth.router, prefix="/api/api/v1/auth", tags=["Authentication"])
app.include_router(categories.router, prefix="/api/api/v1/categories", tags=["Categories"])
app.include_router(publicacion.router, prefix="/api/api/v1", tags=["Publicaciones"])
app.include_router(solicitud.router, prefix="/api/api/v1")
app.include_router(perfil_proveedor.router, prefix="/api/api/v1")
app.include_router(perfil_usuario.router, prefix="/api/api/v1")

# Routers SIN prefix (para localhost/testing)
app.include_router(example.router, prefix="/api/v1")
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(categories.router, prefix="/api/v1/categories", tags=["Categories"])
app.include_router(publicacion.router, prefix="/api/v1", tags=["Publicaciones"])
app.include_router(solicitud.router, prefix="/api/v1")
app.include_router(perfil_proveedor.router, prefix="/api/v1")
app.include_router(perfil_usuario.router, prefix="/api/v1")
app.include_router(reseña.router, prefix="/api/v1")
app.include_router(status_servicio.router, prefix="/api/v1")


@app.get("/api/")
@app.get("/api")
@app.get("/")
def root():
    return {"message": "Welcome to the EasyHome Backend API!"}
