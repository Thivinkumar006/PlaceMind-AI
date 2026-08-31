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
    logger.info(f"-> {request.method} {request.url.path}")
    response = await call_next(request)
    if response.status_code >= 400:
        logger.warning(f"<- {response.status_code} {request.method} {request.url.path}")
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
# Registered BEFORE static files so API routes always take priority.
# ---------------------------------------------------------------------------
app.include_router(api_router, prefix=settings.API_V1_STR)

# ---------------------------------------------------------------------------
# Serve Next.js static export
# Built into frontend/out/ by `next build` with output:'export' in next.config.ts
# Path computed relative to this file so it works regardless of CWD.
#
# Layout on Render (after build.sh runs):
#   /opt/render/project/src/
#     backend/app/main.py   ← __file__
#     frontend/out/         ← static build
# ---------------------------------------------------------------------------
_HERE = Path(__file__).resolve().parent            # .../backend/app/
_FRONTEND_OUT = (_HERE / ".." / ".." / "frontend" / "out").resolve()

logger.info(f"[STARTUP] Frontend build path: {_FRONTEND_OUT}")

if _FRONTEND_OUT.exists():
    logger.info(f"[STARTUP] Frontend build FOUND - serving static files")
    _INDEX_HTML = _FRONTEND_OUT / "index.html"

    # Mount Next.js static assets (_next/static/...) first
    # These are exact-prefix matches so they take priority over the catch-all below
    _next_dir = _FRONTEND_OUT / "_next"
    if _next_dir.exists():
        app.mount("/_next", StaticFiles(directory=str(_next_dir)), name="nextjs_assets")

    # Mount public/ assets (favicon, images, etc.)
    # Serve them from root so /favicon.ico etc. work
    app.mount("/public", StaticFiles(directory=str(_FRONTEND_OUT)), name="public_assets")

    # SPA catch-all: any path not matched by API routes or asset mounts above
    # serves the appropriate Next.js page's index.html.
    # With trailingSlash:true in next.config.ts each route has its own index.html:
    #   /admin/dashboard/ -> frontend/out/admin/dashboard/index.html
    #   /login/           -> frontend/out/login/index.html
    #   /                 -> frontend/out/index.html
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Try the exact page directory first (e.g., admin/dashboard/index.html)
        page_index = _FRONTEND_OUT / full_path / "index.html"
        if page_index.exists():
            return FileResponse(str(page_index))

        # Try exact file (e.g., favicon.ico)
        exact_file = _FRONTEND_OUT / full_path
        if exact_file.exists() and exact_file.is_file():
            return FileResponse(str(exact_file))

        # Fallback to root index.html (Next.js handles the route client-side)
        if _INDEX_HTML.exists():
            return FileResponse(str(_INDEX_HTML))

        return JSONResponse({"error": "Not found"}, status_code=404)

else:
    logger.warning(
        f"[STARTUP] Frontend build NOT FOUND at {_FRONTEND_OUT}. "
        "The build.sh script should have run `npm run build` in the frontend directory. "
        "Check Render build logs. Only API routes will be served."
    )
