#!/usr/bin/env bash
# LPRES-WEBSITE — start both backend and frontend

echo "🌿 Starting LPRES Website..."

# Backend
cd "$(dirname "$0")/backend"
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "✅  Backend running at http://localhost:8000 (PID $BACKEND_PID)"

# Frontend
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!
echo "✅  Frontend running at http://localhost:5173 (PID $FRONTEND_PID)"

echo ""
echo "📰  Admin CMS:   http://localhost:5173/admin/login"
echo "    Username:    admin"
echo "    Password:    lpres@admin2024"
echo ""
echo "📚  API Docs:    http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Services stopped.'" INT TERM
wait
