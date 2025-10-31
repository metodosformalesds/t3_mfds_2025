"""
Models package initialization
"""
from app.models.base import Base, BaseModel
from app.models.property import Property

__all__ = ["Base", "BaseModel", "Property"]
