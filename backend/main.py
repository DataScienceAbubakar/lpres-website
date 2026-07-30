import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine
import models
from routers import admin, news, gallery, projects, marketplace, upload
from auth import get_password_hash
from database import SessionLocal

os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="LPRES Website API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)


def run_migrations():
    from sqlalchemy import text
    db = SessionLocal()
    try:
        result = db.execute(text("PRAGMA table_info(projects)"))
        col_names = [row[1] for row in result.fetchall()]
        if "images" not in col_names:
            db.execute(text("ALTER TABLE projects ADD COLUMN images TEXT DEFAULT '[]'"))
            db.commit()
    except Exception:
        pass
    finally:
        db.close()


run_migrations()

app.include_router(admin.router)
app.include_router(news.router)
app.include_router(gallery.router)
app.include_router(projects.router)
app.include_router(marketplace.router)
app.include_router(upload.router)


def seed_default_admin():
    seed_password = os.environ.get("ADMIN_SEED_PASSWORD")
    if not seed_password:
        print("ADMIN_SEED_PASSWORD not set — skipping default admin seed")
        return
    db = SessionLocal()
    try:
        existing = db.query(models.Admin).filter(models.Admin.username == "admin").first()
        if not existing:
            admin_user = models.Admin(
                username="admin",
                email="admin@lpres.gov.ng",
                hashed_password=get_password_hash(seed_password),
            )
            db.add(admin_user)
            db.commit()
            print("Default admin created: username=admin")
    finally:
        db.close()


seed_default_admin()


def seed_sample_data():
    db = SessionLocal()
    try:
        if db.query(models.Project).count() > 0 or db.query(models.GalleryItem).count() > 0:
            return
        sample_projects = [
            models.Project(name="Kwara Cattle Development Centre", lga="Ilorin East", cluster="Kwara Central",
                description="A modern facility upgrading commercial cattle breeding and fattening for over 2,400 registered farmers across Kwara State, providing quality breeds, veterinary services, and technical extension support for improved productivity.",
                status="Active", cover_image="/api/projects/uploads/seed_hero.jpg",
                images=["/api/projects/uploads/seed_spc.png"],
                highlights=["2,400+ farmers registered","Quality breed distribution","24/7 veterinary support","Annual capacity: 5,000 head"],
                is_published=True, sort_order=1),
            models.Project(name="Modern Abattoir & Processing Plant", lga="Ilorin West", cluster="Kwara Central",
                description="A N250M state-of-the-art facility providing hygienic meat processing and cold storage for local beef producers, connecting smallholder farmers to formal markets across Nigeria.",
                status="Completed", cover_image="/api/projects/uploads/seed_spc.png",
                images=[],
                highlights=["N250M investment","ISO-certified processing","Cold chain capacity: 50 tonnes","Links 600+ farmers to markets"],
                is_published=True, sort_order=2),
            models.Project(name="Pastoral Cooperative Grazing Centre", lga="Baruten", cluster="Kwara North",
                description="Organised cooperative grazing and veterinary centre serving 1,200 beneficiaries across the northern corridor, reducing farmer-herder resource conflicts.",
                status="Active", cover_image=None, images=[],
                highlights=["1,200 beneficiaries served","Conflict reduction programme","3 boreholes constructed","Monthly vet outreach days"],
                is_published=True, sort_order=3),
            models.Project(name="Dairy Cold Chain Hub", lga="Offa", cluster="Kwara South",
                description="A modern cold-chain logistics and milk collection centre empowering 400 dairy-producing families with reliable market access, quality control systems, and value addition capacity.",
                status="Active", cover_image=None, images=[],
                highlights=["400 dairy families empowered","3,000L daily processing capacity","Direct supermarket linkages","30% income increase recorded"],
                is_published=True, sort_order=4),
            models.Project(name="Kwara Regional Livestock Market", lga="Pategi", cluster="Kwara North",
                description="A revitalised regional trading centre with modern holding pens, water infrastructure, and direct buyer linkages — improving price discovery for over 800 producers weekly.",
                status="Planned", cover_image=None, images=[],
                highlights=["800+ producers weekly","Digital price discovery system","Modern holding pens: 2,000 head","Water infrastructure included"],
                is_published=True, sort_order=5),
        ]
        sample_gallery = [
            models.GalleryItem(title="L-PRES Field Survey — Kwara North", file_url="/api/projects/uploads/seed_hero.jpg", thumbnail_url="/api/projects/uploads/seed_hero.jpg", media_type="photo", category="Field Work", is_published=True, sort_order=1, description="Field teams conducting livestock health assessment across the northern corridor communities in Baruten LGA."),
            models.GalleryItem(title="State Project Coordination Meeting", file_url="/api/projects/uploads/seed_spc.png", thumbnail_url="/api/projects/uploads/seed_spc.png", media_type="photo", category="Outreach", is_published=True, sort_order=2, description="Senior L-PRES officials and LGA coordinators reviewing Q2 implementation targets at the State Project Office."),
            models.GalleryItem(title="Kwara State Livestock Map Infographic", file_url="/api/projects/uploads/seed_video.mp4", thumbnail_url="/api/projects/uploads/seed_spc.png", media_type="video", category="Field Work", is_published=True, sort_order=4, description="L-PRES project area coverage and key infrastructure sites mapped across all 16 LGAs of Kwara State."),
        ]
        sample_marketplace = [
            models.MarketplaceProduct(
                name="Premium Bunaji Bulls (Kwara Central)",
                description="Healthy, fully vaccinated 3-year-old White Fulani (Bunaji) fattened bulls raised under L-PRES veterinary supervision in Ilorin East. Average live weight 380kg - 420kg.",
                category="Livestock",
                price={"amount": 650000, "currency": "NGN", "unit": "per bull"},
                quantity={"available": 15, "unit": "bulls"},
                location={"region": "Ilorin East", "country": "Nigeria"},
                images=[{"url": "https://images.unsplash.com/photo-1546445317-29f4545f9d52?w=800&q=80", "alt": "Bunaji Bulls", "isPrimary": True}],
                specifications={"isOrganic": True, "variety": "White Fulani (Bunaji)", "grade": "Grade A Fattened"},
                seller={"userId": "seed-1", "name": "Alhaji Ibrahim Danladi", "contact": {"phone": "+234 803 123 4567", "email": "ibrahim.danladi@lpres-farmers.ng", "whatsapp": "+234 803 123 4567"}},
                status="active"
            ),
            models.MarketplaceProduct(
                name="Fresh Pasteurised Dairy Milk",
                description="Daily harvested fresh raw and pasteurised cow milk produced at Offa Dairy Cold Chain Hub under strict L-PRES hygiene protocols.",
                category="Livestock",
                price={"amount": 1200, "currency": "NGN", "unit": "per Litre"},
                quantity={"available": 250, "unit": "Litres"},
                location={"region": "Offa", "country": "Nigeria"},
                images=[{"url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80", "alt": "Fresh Dairy Milk", "isPrimary": True}],
                specifications={"isOrganic": True, "variety": "Fresh Holstein-Bunaji Cross", "grade": "Premium Grade"},
                seller={"userId": "seed-2", "name": "Offa Women Dairy Cooperative", "contact": {"phone": "+234 805 987 6543", "email": "offa.dairy@lpres-coop.ng", "whatsapp": "+234 805 987 6543"}},
                status="active"
            ),
            models.MarketplaceProduct(
                name="High-Nutrient Stylosanthes Hay Bales",
                description="Nutritious cultivated leguminous forage pasture hay bales harvested from Baruten Grazing Reserve plots. High protein content suitable for dairy & beef cattle.",
                category="Feed & Fodder",
                price={"amount": 4500, "currency": "NGN", "unit": "per bale"},
                quantity={"available": 400, "unit": "bales"},
                location={"region": "Baruten", "country": "Nigeria"},
                images=[{"url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80", "alt": "Hay Bales", "isPrimary": True}],
                specifications={"isOrganic": True, "variety": "Stylosanthes hamata", "grade": "Class 1 Feed"},
                seller={"userId": "seed-3", "name": "Baruten Pastoralist Support Union", "contact": {"phone": "+234 812 345 6789", "email": "baruten.pasture@lpres-coop.ng", "whatsapp": "+234 812 345 6789"}},
                status="active"
            ),
            models.MarketplaceProduct(
                name="Hybrid Yellow Maize (Dried Grain)",
                description="Clean, well-dried 50kg bags of yellow grain maize harvested in Edu LGA. Moisture content < 12%, perfect for livestock feed formulation.",
                category="Cereals",
                price={"amount": 48000, "currency": "NGN", "unit": "per 50kg bag"},
                quantity={"available": 120, "unit": "bags"},
                location={"region": "Edu", "country": "Nigeria"},
                images=[{"url": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&q=80", "alt": "Yellow Maize", "isPrimary": True}],
                specifications={"isOrganic": False, "variety": "SAMMAZ 15 Hybrid", "grade": "Grade A"},
                seller={"userId": "seed-4", "name": "Mallam Usman Pategi", "contact": {"phone": "+234 814 555 7788", "email": "usman.pategi@lpres-farmers.ng", "whatsapp": "+234 814 555 7788"}},
                status="active"
            )
        ]
        for item in sample_projects + sample_gallery + sample_marketplace:
            db.add(item)
        db.commit()
        print("Sample data seeded")
    except Exception as e:
        print(f"Seed skipped: {e}")
        db.rollback()
    finally:
        db.close()


seed_sample_data()


@app.get("/")
def root():
    return {"message": "LPRES Website API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
