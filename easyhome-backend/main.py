from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import example, auth, categories, solicitud, perfil_proveedor, perfil_usuario, publicacion

app = FastAPI(
    title="EasyHome Backend API",
    description="API for managing EasyHome smart home devices and services.",
    version="1.0.0",
    redirect_slashes=False,
    root_path="/prod"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# LOGGING MIDDLEWARE (opcional, para debug)
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"🔍 Request path: {request.url.path}")
    response = await call_next(request)
    return response

# Routers
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