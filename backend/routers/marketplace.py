from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from database import get_db
import models
import schemas
from auth import get_password_hash, verify_password, create_access_token, get_current_marketplace_admin
from utils.email import (
    send_welcome_email,
    send_new_trade_request_email,
    send_request_approved_email,
    send_request_shipped_email
)

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

        # Trigger Resend Welcome Auto-Email
        try:
            send_welcome_email(user_email=new_user.email, user_name=new_user.name)
        except Exception as email_err:
            print(f"[REGISTER EMAIL ERROR] {email_err}")

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
        
        # Trigger Resend Trade Request Auto-Email
        try:
            est_total_dict = req_data.estimated_total or {}
            amt = est_total_dict.get("amount", 0)
            curr = est_total_dict.get("currency", "NGN")
            formatted_amt = f"{curr} {amt:,.2f}" if isinstance(amt, (int, float)) else f"{curr} {amt}"
            send_new_trade_request_email(
                buyer_email=new_request.buyer_email,
                buyer_name=new_request.buyer_name,
                request_code=new_request.request_code,
                product_name=new_request.product_name,
                total_amount=formatted_amt
            )
        except Exception as email_err:
            print(f"[TRADE REQUEST EMAIL ERROR] {email_err}")

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


# ── MARKETPLACE ADMIN ENDPOINTS ───────────────────────────────────────

@router.post("/admin/login")
def login_marketplace_admin(credentials: schemas.MarketplaceAdminLogin, db: Session = Depends(get_db)):
    admin = db.query(models.MarketplaceAdmin).filter(models.MarketplaceAdmin.username == credentials.username).first()
    if not admin or not verify_password(credentials.password, admin.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid marketplace admin username or password")
    
    token = create_access_token(data={"sub": admin.username, "role": "marketplace_admin", "admin_id": str(admin.id)})
    return {
        "success": True,
        "token": token,
        "admin": {
            "id": admin.id,
            "username": admin.username,
            "email": admin.email
        }
    }


@router.get("/admin/analytics")
def get_marketplace_analytics(
    m_admin: models.MarketplaceAdmin = Depends(get_current_marketplace_admin),
    db: Session = Depends(get_db)
):
    requests = db.query(models.MarketplaceRequest).all()
    total_requests = len(requests)
    
    total_amount = 0.0
    status_counts = {
        "pending_review": 0,
        "approved": 0,
        "shipped": 0,
        "completed": 0,
        "cancelled": 0
    }
    
    for r in requests:
        try:
            amt = float(r.estimated_total.get("amount", 0) if isinstance(r.estimated_total, dict) else 0)
            total_amount += amt
        except Exception:
            pass
            
        st = (r.status or "pending_review").lower()
        if st in ["under_facilitation", "inspection_scheduled", "inspection_passed"]:
            st = "approved"
        elif st in ["logistics_dispatched"]:
            st = "shipped"
            
        status_counts[st] = status_counts.get(st, 0) + 1
        
    total_users = db.query(models.MarketplaceUser).count()
    products = db.query(models.MarketplaceProduct).all()
    total_products = len(products)
    active_products = sum(1 for p in products if p.status == "active")
    
    return {
        "success": True,
        "data": {
            "total_requests": total_requests,
            "total_amount": round(total_amount, 2),
            "total_users": total_users,
            "total_products": total_products,
            "active_products": active_products,
            "status_counts": status_counts
        }
    }


@router.get("/admin/requests")
def get_all_marketplace_requests(
    status: Optional[str] = None,
    m_admin: models.MarketplaceAdmin = Depends(get_current_marketplace_admin),
    db: Session = Depends(get_db)
):
    query = db.query(models.MarketplaceRequest)
    if status and status != "All":
        query = query.filter(models.MarketplaceRequest.status == status)
    
    requests = query.order_by(models.MarketplaceRequest.created_at.desc()).all()
    
    result = []
    for r in requests:
        result.append({
            "id": r.id,
            "requestCode": r.request_code,
            "productId": r.product_id,
            "productName": r.product_name,
            "productCategory": r.product_category,
            "unitPrice": r.unit_price,
            "requestedQty": r.requested_qty,
            "estimatedTotal": r.estimated_total,
            "includeInspection": r.include_inspection,
            "inspectionFee": r.inspection_fee,
            "requestSupplyChain": r.request_supply_chain,
            "buyerName": r.buyer_name,
            "buyerEmail": r.buyer_email,
            "buyerPhone": r.buyer_phone,
            "buyerLga": r.buyer_lga,
            "deliveryLocation": r.delivery_location,
            "additionalNotes": r.additional_notes,
            "sellerName": r.seller_name,
            "sellerId": r.seller_id,
            "sellerContact": r.seller_contact,
            "status": r.status,
            "adminNotes": r.admin_notes,
            "createdAt": r.created_at.isoformat() if r.created_at else ""
        })
    return {"success": True, "data": result}


@router.patch("/admin/requests/{request_id}/status")
def update_marketplace_request_status(
    request_id: int,
    status_update: schemas.MarketplaceRequestStatusUpdate,
    m_admin: models.MarketplaceAdmin = Depends(get_current_marketplace_admin),
    db: Session = Depends(get_db)
):
    req = db.query(models.MarketplaceRequest).filter(models.MarketplaceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Trade request not found")
        
    old_status = req.status
    new_status = status_update.status
    req.status = new_status
    if status_update.admin_notes is not None:
        req.admin_notes = status_update.admin_notes
        
    db.commit()
    db.refresh(req)
    
    # Trigger Resend Auto-Emails on Status Changes (Approved / Shipped)!
    try:
        if new_status in ["approved", "under_facilitation"] and old_status not in ["approved", "under_facilitation"]:
            send_request_approved_email(
                buyer_email=req.buyer_email,
                buyer_name=req.buyer_name,
                request_code=req.request_code,
                product_name=req.product_name
            )
        elif new_status in ["shipped", "logistics_dispatched"] and old_status not in ["shipped", "logistics_dispatched"]:
            send_request_shipped_email(
                buyer_email=req.buyer_email,
                buyer_name=req.buyer_name,
                request_code=req.request_code,
                product_name=req.product_name,
                admin_notes=req.admin_notes or ""
            )
    except Exception as email_err:
        print(f"[STATUS CHANGE EMAIL ERROR] ({new_status}): {email_err}")
        
    return {
        "success": True,
        "message": f"Request status updated to {new_status}",
        "data": {
            "id": req.id,
            "requestCode": req.request_code,
            "status": req.status,
            "adminNotes": req.admin_notes
        }
    }


@router.get("/admin/users")
def get_marketplace_users(
    m_admin: models.MarketplaceAdmin = Depends(get_current_marketplace_admin),
    db: Session = Depends(get_db)
):
    users = db.query(models.MarketplaceUser).order_by(models.MarketplaceUser.created_at.desc()).all()
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "whatsapp": u.whatsapp,
            "lga": u.lga,
            "isVerified": u.is_verified,
            "verificationStatus": u.verification_status,
            "verificationDetails": u.verification_details,
            "createdAt": u.created_at.isoformat() if u.created_at else ""
        })
    return {"success": True, "data": result}


@router.patch("/admin/users/{user_id}/verify")
def verify_marketplace_user(
    user_id: int,
    status: str = Query(...),
    m_admin: models.MarketplaceAdmin = Depends(get_current_marketplace_admin),
    db: Session = Depends(get_db)
):
    user = db.query(models.MarketplaceUser).filter(models.MarketplaceUser.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.verification_status = status
    user.is_verified = (status == "verified")
    db.commit()
    return {"success": True, "message": f"User verification status updated to {status}"}



