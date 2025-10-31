"""
Property model for real estate management
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, Text
from app.models.base import BaseModel


class Property(BaseModel):
    """
    Model representing a real estate property
    """
    __tablename__ = "properties"
    
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    address = Column(String(300), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    state = Column(String(100), nullable=False)
    zip_code = Column(String(20), nullable=True)
    
    price = Column(Float, nullable=False)
    bedrooms = Column(Integer, nullable=False, default=0)
    bathrooms = Column(Integer, nullable=False, default=0)
    area = Column(Float, nullable=False)  # in square meters
    
    property_type = Column(String(50), nullable=False)  # house, apartment, land, etc.
    status = Column(String(20), nullable=False, default="available")  # available, sold, rented
    is_active = Column(Boolean, default=True, nullable=False)
    
    def __repr__(self):
        return f"<Property(id={self.id}, title='{self.title}', price={self.price})>"
