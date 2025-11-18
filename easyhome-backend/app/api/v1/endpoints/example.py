from fastapi import APIRouter

router = APIRouter()

@router.get("/ping")
def ping():
    """
    Autor: Equipo EasyHome

    Descripción: Endpoint simple de verificación (health check) que devuelve
    un objeto con mensaje 'pong'.
    """
    return {"message": "pong"}
