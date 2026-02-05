"""
Routes d'authentification.
Spec: docs/07-api-spec.md
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, generate_csrf_token
from app.models.user import User
from app.schemas.auth import UserCreate, UserLogin, UserResponse
from app.api.deps import get_current_user
from app.core.csrf import verify_csrf

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, response: Response, db: Session = Depends(get_db)):
    """
    Inscription d'un nouvel utilisateur.
    Retourne l'utilisateur créé et pose les cookies (access_token, csrf_token).
    """
    # Vérifie si l'email existe déjà
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Crée l'utilisateur
    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Crée le token JWT
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )

    # Pose les cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # True en production avec HTTPS
        samesite="lax",
        path="/",
        max_age=60 * 60 * 24,  # 24 heures
    )
    response.set_cookie(
        key="csrf_token",
        value=generate_csrf_token(),
        httponly=False,  # Accessible au JS (Double Submit Cookie)
        secure=False,
        samesite="lax",
        path="/",
        max_age=60 * 60 * 24,
    )

    return UserResponse(id=user.id, email=user.email, role=user.role.value)


@router.post("/login", response_model=UserResponse)
def login(user_data: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    Connexion utilisateur.
    Retourne les infos utilisateur et pose les cookies (access_token, csrf_token).
    """
    # Recherche l'utilisateur
    user = db.query(User).filter(User.email == user_data.email).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Crée le token JWT
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role.value}
    )

    # Pose les cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        path="/",
        max_age=60 * 60 * 24,
    )
    response.set_cookie(
        key="csrf_token",
        value=generate_csrf_token(),
        httponly=False,
        secure=False,
        samesite="lax",
        path="/",
        max_age=60 * 60 * 24,
    )

    return UserResponse(id=user.id, email=user.email, role=user.role.value)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    _: None = Depends(verify_csrf),
):
    """
    Déconnexion utilisateur.
    Supprime les cookies access_token et csrf_token.
    """
    response.delete_cookie(
        key="access_token",
        path="/",
        secure=False,
        samesite="lax",
    )
    response.delete_cookie(
        key="csrf_token",
        path="/",
        secure=False,
        samesite="lax",
    )
    return None


@router.post("/_csrf-check", status_code=status.HTTP_204_NO_CONTENT)
def csrf_check(
    current_user: User = Depends(get_current_user),
    _: None = Depends(verify_csrf),
):
    """
    Route de test CSRF (Lot 2 uniquement).
    Vérifie que le mécanisme Double Submit Cookie fonctionne.
    Retourne 204 si CSRF OK, 403 sinon.
    """
    return None

# Auth.py ROUTES