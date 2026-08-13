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
    try:
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
            hashed_password=hashed_pwd,
            is_verified=False,
            verification_status="unverified"
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
                "lga": new_user.lga,
                "isVerified": False,
                "verificationStatus": "unverified"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/auth/login")
def login_user(credentials: schemas.MarketplaceUserLogin, db: Session = Depends(get_db)):
    try:
        user = db.query(models.MarketplaceUser).filter(models.MarketplaceUser.email == credentials.email).first()
        if not user or not getattr(user, 'hashed_password', None):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        try:
            is_valid = verify_password(credentials.password, user.hashed_password)
        except Exception:
            is_valid = False

        if not is_valid:
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
                "lga": user.lga,
                "isVerified": bool(getattr(user, "is_verified", False)),
                "verificationStatus": getattr(user, "verification_status", "unverified") or "unverified"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
        if "bunaji bulls" in p.name.lower():
            continue
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


@router.patch("/products/{product_id}/status")
def update_product_status(product_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    prod = db.query(models.MarketplaceProduct).filter(models.MarketplaceProduct.id == product_id).first()
    if not prod:
        raise HTTPException(status_code=404, detail="Product not found")
    prod.status = status
    db.commit()
    return {"success": True, "message": f"Product status updated to {status}", "status": status}


@router.post("/verification/request")
def request_verification(req_data: schemas.MarketplaceVerificationRequest, db: Session = Depends(get_db)):
    try:
        user = db.query(models.MarketplaceUser).filter(models.MarketplaceUser.email == req_data.email).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        details = {
            "farm_name": req_data.farm_name,
            "coop_name": req_data.coop_name,
            "nin_reg": req_data.nin_reg,
            "notes": req_data.notes
        }
        user.verification_status = "pending"
        user.verification_details = json.dumps(details)
        db.commit()
        db.refresh(user)
        
        return {
            "success": True,
            "message": "Verification request submitted successfully",
            "verificationStatus": user.verification_status
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/requests")
def submit_trade_request(req_data: schemas.MarketplaceRequestCreate, db: Session = Depends(get_db)):
    try:
        import time, random
        req_code = f"LPRES-REQ-{int(time.time())}-{random.randint(100, 999)}"
        
        # Calculate inspection fee if requested
        inspection_fee = None
        if req_data.include_inspection:
            try:
                est_total = float(req_data.estimated_total.get("amount", 0))
            except Exception:
                est_total = 0.0
            fee_amount = round(est_total * 0.01, 2)
            inspection_fee = {
                "amount": fee_amount,
                "currency": req_data.estimated_total.get("currency", "NGN"),
                "percentage": 1.0
            }
            
        new_request = models.MarketplaceRequest(
            request_code=req_code,
            product_id=str(req_data.product_id),
            product_name=req_data.product_name,
            product_category=req_data.product_category or "General",
            unit_price=req_data.unit_price,
            requested_qty=str(req_data.requested_qty),
            estimated_total=req_data.estimated_total,
            include_inspection=req_data.include_inspection,
            inspection_fee=inspection_fee or req_data.inspection_fee,
            request_supply_chain=req_data.request_supply_chain,
            buyer_name=req_data.buyer_name,
            buyer_email=req_data.buyer_email,
            buyer_phone=req_data.buyer_phone,
            buyer_lga=req_data.buyer_lga or "Ilorin East",
            delivery_location=req_data.delivery_location,
            additional_notes=req_data.additional_notes,
            seller_name=req_data.seller_name,
            seller_id=str(req_data.seller_id or ""),
            seller_contact=req_data.seller_contact or {},
            status="pending_review"
        )
        
        db.add(new_request)
        db.commit()
        db.refresh(new_request)
        
        return {
            "success": True,
            "message": "Enterprise trade request submitted successfully. L-PRES State Project Office will contact both parties.",
            "requestCode": req_code,
            "data": {
                "id": new_request.id,
                "requestCode": new_request.request_code,
                "productName": new_request.product_name,
                "status": new_request.status,
                "includeInspection": new_request.include_inspection,
                "inspectionFee": new_request.inspection_fee,
                "requestSupplyChain": new_request.request_supply_chain,
                "createdAt": new_request.created_at.isoformat() if new_request.created_at else ""
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/requests/my")
def get_my_trade_requests(email: str = Query(...), db: Session = Depends(get_db)):
    requests = db.query(models.MarketplaceRequest).filter(
        models.MarketplaceRequest.buyer_email == email
    ).order_by(models.MarketplaceRequest.created_at.desc()).all()
    
    items = []
    for r in requests:
        items.append({
            "id": r.id,
            "requestCode": r.request_code,
            "productName": r.product_name,
            "unitPrice": r.unit_price,
            "requestedQty": r.requested_qty,
            "estimatedTotal": r.estimated_total,
            "includeInspection": r.include_inspection,
            "inspectionFee": r.inspection_fee,
            "requestSupplyChain": r.request_supply_chain,
            "status": r.status,
            "buyerLga": r.buyer_lga,
            "deliveryLocation": r.delivery_location,
            "createdAt": r.created_at.isoformat() if r.created_at else ""
        })
    return {"success": True, "data": items}


