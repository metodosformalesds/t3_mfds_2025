from fastapi import FastAPI
from app.api.v1.endpoints import example

app = FastAPI(
    title="EasyHome Backend API",
    description="API for managing EasyHome smart home devices and services.",
    version="1.0.0"
)

app.include_router(example.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to the EasyHome Backend API!"}