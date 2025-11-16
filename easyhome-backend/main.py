from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import example, auth, categories, solicitud, perfil_proveedor, perfil_usuario, publicacion

app = FastAPI(
    title="EasyHome Backend API",
    description="API for managing EasyHome smart home devices and services.",
    version="1.0.0"
)

# Configurar CORS para permitir peticiones desde el frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Desarrollo local
        "https://d84l1y8p4kdic.cloudfront.net",  # CloudFront
        "https://main.d30cfshgj52c8r.amplifyapp.com",  # Amplify App
        "*",  # Permitir todos los orígenes (ajustar según sea necesario)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origins=["*"],
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