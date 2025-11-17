from fastapi import Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import Usuario
from starlette.status import HTTP_401_UNAUTHORIZED


def get_current_user(request: Request, db: Session = Depends(get_db)) -> Usuario:
    """
    Dependency to obtain the current user from headers for now.
    It looks for `X-User-Id` (preferred) or `X-User-Email` headers and
    returns the corresponding `Usuario` from the database.

    NOTE: This is a lightweight placeholder for proper token-based
    authentication (Cognito JWT validation). Replace with a full
    implementation when integrating auth tokens.
    """
    user_id = request.headers.get("x-user-id")
    email = request.headers.get("x-user-email")

    if user_id:
        try:
            uid = int(user_id)
        except ValueError:
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Invalid X-User-Id header")

        user = db.query(Usuario).filter(Usuario.id_usuario == uid).first()
        if not user:
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="User not found")
        return user

    if email:
        user = db.query(Usuario).filter(Usuario.correo_electronico == email).first()
        if not user:
            raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="User not found")
        return user

    raise HTTPException(status_code=HTTP_401_UNAUTHORIZED, detail="Authentication required (provide X-User-Id or X-User-Email header)")
