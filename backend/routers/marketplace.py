from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from database import get_db
import models
import schemas
from auth import get_password_hash, verify_password, create_access_token

router = APIRouter(prefix="/api/marketplace", tags=["marketplace"])


@router.post("/auth/register")
def register_user(user_data: schemas.MarketplaceUserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.MarketplaceUser).filter(models.MarketplaceUser.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(user_data.password)
    new_user = models.MarketplaceUser(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        whatsapp=user_data.whatsapp or user_data.phone,
        lga=user_data.lga or "Ilorin East",
        hashed_password=hashed_pwd
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.email, "user_id": str(new_user.id), "name": new_user.name})
    return {
        "success": True,
        "token": token,
        "user": {
            "_id": str(new_user.id),
            "name": new_user.name,
            "email": new_user.email,
            "phone": new_user.phone,
            "whatsapp": new_user.whatsapp,
            "lga": new_user.lga
        }
    }


@router.post("/auth/login")
def login_user(credentials: schemas.MarketplaceUserLogin, db: Session = Depends(get_db)):
    user = db.query(models.MarketplaceUser).filter(models.MarketplaceUser.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token(data={"sub": user.email, "user_id": str(user.id), "name": user.name})
    return {
        "success": True,
        "token": token,
        "user": {
            "_id": str(user.id),
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "whatsapp": user.whatsapp,
            "lga": user.lga
        }
    }


@router.get("/products")
def get_products(
    category: Optional[str] = None,
    region: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.MarketplaceProduct)
    
    if category and category != "All":
        query = query.filter(models.MarketplaceProduct.category == category)
        
    products = query.order_by(models.MarketplaceProduct.created_at.desc()).all()
    
    result_list = []
    for p in products:
        p_dict = {
            "_id": str(p.id),
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "category": p.category,
            "price": p.price if isinstance(p.price, dict) else json.loads(p.price or "{}"),
            "quantity": p.quantity if isinstance(p.quantity, dict) else json.loads(p.quantity or "{}"),
            "location": p.location if isinstance(p.location, dict) else json.loads(p.location or "{}"),
            "images": p.images if isinstance(p.images, list) else json.loads(p.images or "[]"),
            "specifications": p.specifications if isinstance(p.specifications, dict) else json.loads(p.specifications or "{}"),
            "seller": p.seller if isinstance(p.seller, dict) else json.loads(p.seller or "{}"),
            "status": p.status,
            "views": p.views or 0,
            "averageRating": 5.0,
            "ratings": [],
            "inquiries": [],
            "createdAt": p.created_at.isoformat() if p.created_at else ""
        }

        # Filter by region/LGA if search or region is specified
        if region and region != "All":
            prod_region = p_dict["location"].get("region", "")
            if prod_region.lower() != region.lower():
                continue
                
        if search:
            s = search.lower()
            if s not in p.name.lower() and s not in p.description.lower():
                continue
                
        result_list.append(p_dict)
        
    return {"success": True, "data": {"products": result_list}}


@router.post("/products")
def create_product(product_data: schemas.MarketplaceProductCreate, db: Session = Depends(get_db)):
    new_prod = models.MarketplaceProduct(
        name=product_data.name,
        description=product_data.description,
        category=product_data.category,
        price=product_data.price,
        quantity=product_data.quantity,
        location=product_data.location,
        images=product_data.images,
        specifications=product_data.specifications,
        seller=product_data.seller,
        status="active"
    )
    db.add(new_prod)
    db.commit()
    db.refresh(new_prod)
    
    p_dict = {
        "_id": str(new_prod.id),
        "id": new_prod.id,
        "name": new_prod.name,
        "description": new_prod.description,
        "category": new_prod.category,
        "price": new_prod.price,
        "quantity": new_prod.quantity,
        "location": new_prod.location,
        "images": new_prod.images,
        "specifications": new_prod.specifications,
        "seller": new_prod.seller,
        "status": new_prod.status,
        "views": 0,
        "averageRating": 5.0,
        "ratings": [],
        "inquiries": [],
        "createdAt": new_prod.created_at.isoformat() if new_prod.created_at else ""
    }
    return {"success": True, "data": {"product": p_dict}}


@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    prod = db.query(models.MarketplaceProduct).filter(models.MarketplaceProduct.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(prod)
    db.commit()
    return {"success": True, "message": "Product deleted"}
