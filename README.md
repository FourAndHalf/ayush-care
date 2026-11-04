# Ayush Care

- `frontend/` – React (Vite)
- `backend/` – Go HTTP API

## Run

```bash
cd backend && go run .          # http://localhost:8080
cd frontend && npm install && npm run dev   # http://localhost:5173, proxies /api to the backend
```

Backend env: `PORT` (default 8080), `CORS_ORIGIN` (default http://localhost:5173).
