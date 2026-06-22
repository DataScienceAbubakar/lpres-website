import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine
import models
from routers import admin, news
from auth import get_password_hash
from database import SessionLocal

os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="LPRES Website API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(admin.router)
app.include_router(news.router)


def seed_default_admin():
    db = SessionLocal()
    try:
        existing = db.query(models.Admin).filter(models.Admin.username == "admin").first()
        if not existing:
            admin_user = models.Admin(
                username="admin",
                email="admin@lpres.gov.ng",
                hashed_password=get_password_hash("lpres@admin2024"),
            )
            db.add(admin_user)
            db.commit()
            print("Default admin created: username=admin password=lpres@admin2024")
    finally:
        db.close()


seed_default_admin()


@app.get("/")
def root():
    return {"message": "LPRES Website API", "version": "1.0.0", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
