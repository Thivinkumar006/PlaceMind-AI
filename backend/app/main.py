import os
import logging
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from app.api.v1.api import api_router
from app.core.config import settings

# Basic logging setup
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
# CORS — for local dev (localhost:3000 → localhost:8000). Same-origin in prod.
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
# Health check
# ---------------------------------------------------------------------------
@app.get("/api/health", tags=["health"])
def health_check():
    return JSONResponse({
        "status": "ok",
        "message": "Placement Portal backend is running"
    })

# ---------------------------------------------------------------------------
# All backend API routes  (/api/v1/*)
# ---------------------------------------------------------------------------
app.include_router(api_router, prefix=settings.API_V1_STR)

# ---------------------------------------------------------------------------
# Serve Next.js static frontend
# Built into frontend/out/ by `next build` with output:'export'
# ---------------------------------------------------------------------------
_HERE = Path(__file__).resolve().parent            # .../backend/app/
_FRONTEND_OUT = (_HERE / ".." / ".." / "frontend" / "out").resolve()

logger.info(f"[STARTUP] Frontend build path: {_FRONTEND_OUT}")

if _FRONTEND_OUT.exists():
    logger.info(f"[STARTUP] Frontend build FOUND")
    _INDEX_HTML = _FRONTEND_OUT / "index.html"

    # Mount Next.js _next/ static assets (JS bundles, CSS, fonts)
    _next_dir = _FRONTEND_OUT / "_next"
    if _next_dir.exists():
        app.mount("/_next", StaticFiles(directory=str(_next_dir)), name="nextjs_assets")

    # SPA catch-all: serves the correct Next.js page HTML for every frontend route.
    # CRITICAL: Must return 404 for /api/* so API routes are not swallowed.
    # FastAPI routes registered above (/api/v1/*, /api/health) take priority in
    # route matching since they were registered first, but the path converter
    # /{full_path:path} can still intercept them in edge cases — so we guard explicitly.
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Never intercept API requests — return 404 so the error is clear
        if full_path.startswith("api/") or full_path == "api":
            return JSONResponse(
                {"detail": f"API route /{full_path} not found"},
                status_code=404
            )

        # Try the exact page directory (trailingSlash:true creates page/index.html)
        # e.g. "admin/dashboard" -> frontend/out/admin/dashboard/index.html
        page_index = _FRONTEND_OUT / full_path / "index.html"
        if page_index.exists():
            return FileResponse(str(page_index))

        # Try exact file (favicon.ico, robots.txt, etc.)
        exact_file = _FRONTEND_OUT / full_path
        if exact_file.exists() and exact_file.is_file():
            return FileResponse(str(exact_file))

        # Fallback: root index.html — Next.js handles routing client-side
        if _INDEX_HTML.exists():
            return FileResponse(str(_INDEX_HTML))

        return JSONResponse({"error": "Not found"}, status_code=404)

else:
    logger.warning(
        f"[STARTUP] Frontend build NOT FOUND at {_FRONTEND_OUT}. "
        "Check that build.sh ran `npm run build` in the frontend directory. "
        "Only API routes will be served."
    )
