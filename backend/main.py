import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine
import models
from routers import admin, news, gallery, projects
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
        for item in sample_projects + sample_gallery:
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
