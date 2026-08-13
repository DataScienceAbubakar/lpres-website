from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


class AdminCreate(BaseModel):
    username: str
    email: str
    password: str


class AdminLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class NewsArticleCreate(BaseModel):
    title: str
    body: str
    event_date: Optional[str] = None
    published_by: str
    template: int = 1
    is_published: bool = False
    excerpt: Optional[str] = None
    category: str = "News"
    featured_image: Optional[str] = None   # base64 data URL or http URL
    images: Optional[List[str]] = []


class NewsArticleUpdate(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    event_date: Optional[str] = None
    published_by: Optional[str] = None
    template: Optional[int] = None
    is_published: Optional[bool] = None
    excerpt: Optional[str] = None
    category: Optional[str] = None
    featured_image: Optional[str] = None   # base64 data URL or http URL
    images: Optional[List[str]] = None


class NewsArticleOut(BaseModel):
    id: int
    title: str
    body: str
    featured_image: Optional[str]
    images: List[str]
    event_date: Optional[str]
    published_by: str
    template: int
    is_published: bool
    slug: str
    excerpt: Optional[str]
    category: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Gallery ───────────────────────────────────────────────────

class GalleryItemOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    file_url: str
    thumbnail_url: Optional[str]
    media_type: str
    category: str
    is_published: bool
    sort_order: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Projects ──────────────────────────────────────────────────

class ProjectOut(BaseModel):
    id: int
    name: str
    lga: str
    cluster: Optional[str]
    description: Optional[str]
    status: str
    cover_image: Optional[str]
    images: List[str]
    highlights: List[str]
    is_published: bool
    sort_order: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ── Marketplace ───────────────────────────────────────────────

class MarketplaceUserCreate(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    whatsapp: Optional[str] = None
    lga: Optional[str] = "Ilorin East"


class MarketplaceUserLogin(BaseModel):
    email: str
    password: str


class MarketplaceVerificationRequest(BaseModel):
    farm_name: Optional[str] = None
    cooperative_name: Optional[str] = None
    nin_or_reg_no: Optional[str] = None
    id_document_url: Optional[str] = None
    notes: Optional[str] = None


class MarketplaceProductCreate(BaseModel):
    name: str
    description: str
    category: str
    price: dict
    quantity: dict
    location: dict
    images: List[dict] = []
    specifications: dict = {}
    seller: dict


class MarketplaceProductOut(BaseModel):
    id: int
    name: str
    description: str
    category: str
    price: dict
    quantity: dict
    location: dict
    images: List[dict]
    specifications: dict
    seller: dict
    status: str
    views: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class MarketplaceRequestCreate(BaseModel):
    product_id: str
    product_name: str
    product_category: Optional[str] = "General"
    unit_price: dict
    requested_qty: str = "1"
    estimated_total: dict
    
    # Intermediary Facilitation Options
    include_inspection: bool = False
    inspection_fee: Optional[dict] = None
    request_supply_chain: bool = False
    
    # Buyer Details
    buyer_name: str
    buyer_email: str
    buyer_phone: str
    buyer_lga: Optional[str] = "Ilorin East"
    delivery_location: Optional[str] = None
    additional_notes: Optional[str] = None
    
    # Seller Details (Captured internally for Admin intermediary contact)
    seller_name: str
    seller_id: Optional[str] = None
    seller_contact: Optional[dict] = None


class MarketplaceRequestStatusUpdate(BaseModel):
    status: str
    admin_notes: Optional[str] = None


class MarketplaceRequestOut(BaseModel):
    id: int
    request_code: str
    product_id: str
    product_name: str
    product_category: Optional[str]
    unit_price: dict
    requested_qty: str
    estimated_total: dict
    include_inspection: bool
    inspection_fee: Optional[dict]
    request_supply_chain: bool
    buyer_name: str
    buyer_email: str
    buyer_phone: str
    buyer_lga: str
    delivery_location: Optional[str]
    additional_notes: Optional[str]
    seller_name: str
    seller_id: Optional[str]
    seller_contact: Optional[dict]
    status: str
    admin_notes: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


