// In development: set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 in frontend/.env.local
// In production: leave NEXT_PUBLIC_API_URL unset — the relative /api/v1 hits the same Render domain
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

