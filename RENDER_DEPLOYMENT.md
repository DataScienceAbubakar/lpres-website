# Render Deployment Guide — Kwara L-PRES Website & Marketplace

This guide outlines how to deploy both the **Backend Web Service** and **Frontend Static Site** on Render.

---

## 1. Web Service Deployment (Backend API)

- **Service Type**: Web Service
- **Name**: `lpres-website-backend`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment Variables for Web Service (Backend)

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.9` | Forces stable Python runtime on Render |
| `DATABASE_URL` | `postgresql://user:pass@rds-host:5432/lpres_db` | AWS RDS PostGIS / PostgreSQL connection string |
| `S3_BUCKET_NAME` | `lpres-intelligence-docs-dev` | AWS S3 Bucket Name |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | AWS IAM Access Key ID |
| `AWS_SECRET_ACCESS_KEY` | `wJalr...` | AWS IAM Secret Access Key |
| `AWS_REGION` | `us-east-1` | AWS S3 Bucket Region |
| `SECRET_KEY` | `super-secret-jwt-key` | Random secret key for JWT signing |
| `ADMIN_SEED_PASSWORD` | `SecureAdminPass123!` | Initial password for `admin` account |
| `PORT` | `10000` | Configured dynamically by Render |

---

## 2. Static Site Deployment (Frontend Application)

- **Service Type**: Static Site
- **Name**: `lpres-website-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Redirects / Rewrites**:
  - **Source**: `/*`
  - **Destination**: `/index.html`
  - **Action**: `Rewrite`

### Environment Variables for Static Site (Frontend)

| Key | Example Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://lpres-website-backend.onrender.com` | Live URL of your Render backend Web Service |

---

## 3. Blueprint Option (One-Click Render Setup)
If using Render Blueprints:
1. Connect your repository to Render.
2. Render will automatically detect `render.yaml`.
3. Fill in the prompted values (`DATABASE_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `ADMIN_SEED_PASSWORD`, `VITE_API_URL`).
