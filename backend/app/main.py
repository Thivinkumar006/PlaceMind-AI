import os
import logging
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from app.api.v1.api import api_router
from app.core.config import settings

# Basic logging setup — logs endpoint, method, and errors but never secrets
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("placement_portal")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# ---------------------------------------------------------------------------
# CORS — only needed for local development (localhost:3000 hitting localhost:8000)
# In production, frontend and backend are on the same origin, so CORS is a no-op.
# ---------------------------------------------------------------------------
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# ---------------------------------------------------------------------------
# Request logging middleware
# ---------------------------------------------------------------------------
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"→ {request.method} {request.url.path}")
    response = await call_next(request)
    if response.status_code >= 400:
        logger.warning(f"← {response.status_code} {request.method} {request.url.path}")
    return response

# ---------------------------------------------------------------------------
# Health check — always available, used by Render and for manual testing
# ---------------------------------------------------------------------------
@app.get("/api/health", tags=["health"])
def health_check():
    return JSONResponse({
        "status": "ok",
        "message": "Placement Portal backend is running"
    })

# ---------------------------------------------------------------------------
# API routes  (/api/v1/*)
# These must be registered BEFORE the static file mount so they take priority.
# ---------------------------------------------------------------------------
@app.get("/", include_in_schema=False)
def root():
    return {"message": "Welcome to Placement Management Portal API"}

app.include_router(api_router, prefix=settings.API_V1_STR)

# ---------------------------------------------------------------------------
# Serve Next.js static export
# The frontend is built into frontend/out/ by `next build` with output:'export'.
# Path is computed relative to this file so it works regardless of CWD.
# ---------------------------------------------------------------------------
_HERE = Path(__file__).resolve().parent          # backend/app/
_FRONTEND_OUT = _HERE / ".." / ".." / "frontend" / "out"

if _FRONTEND_OUT.exists():
    logger.info(f"Serving Next.js static build from: {_FRONTEND_OUT.resolve()}")
    # Mount static assets (JS/CSS/_next/) at root
    app.mount("/", StaticFiles(directory=str(_FRONTEND_OUT.resolve()), html=True), name="frontend")
else:
    logger.warning(
        f"Frontend build not found at {_FRONTEND_OUT.resolve()}. "
        "Run `cd frontend && npm run build` to generate it. "
        "Only the API will be served."
    )

