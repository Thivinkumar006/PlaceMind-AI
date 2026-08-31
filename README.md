# 🎓 PlaceMind — Placement Management Portal

A full-stack placement management system designed for colleges and institutions to streamline campus recruitment. PlaceMind provides a centralized platform for managing students, companies, placement drives, and recruitment analytics — all in one place.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| **Frontend** | [https://placemind-frontend.onrender.com](https://placemind-frontend.onrender.com) |
| **Backend API** | [https://placemind-ai-1.onrender.com](https://placemind-ai-1.onrender.com) |
| **API Docs (Swagger)** | [https://placemind-ai-1.onrender.com/api/v1/openapi.json](https://placemind-ai-1.onrender.com/api/v1/openapi.json) |

---

## ✨ Features

### 👨‍💼 Admin Portal
- **Dashboard** — Live statistics: total students, placed count, placement percentage, active drives
- **Students** — Full CRUD: add, edit, delete, filter & search students; bulk import via Excel (`.xlsx`)
- **Companies** — Manage recruiting company profiles and their visit history
- **Placement Drives** — Create and track recruitment drives with status and results
- **ATS & Matching** — Applicant Tracking System to match students with job openings
- **Reports** — Downloadable placement reports and summaries
- **Analytics** — Visual charts for placement trends, department-wise stats, and salary analysis
- **Placement Team** — Manage the placement cell team members and their roles
- **Settings** — Portal-level configuration

### 🔐 Authentication
- Role-based login: **Admin**, **Placement Manager**, **Placement Lead**
- JWT token-based authentication
- Protected routes on both frontend and backend

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | React framework with SSR |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling |
| **Recharts** | Analytics graphs |
| **SWR** | Data fetching & caching |
| **Lucide React** | Icons |
| **XLSX / openpyxl** | Excel import/export |
| **Vitest + Testing Library** | Unit testing |

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | Python REST API framework |
| **SQLAlchemy 2.0** | ORM for database models |
| **Alembic** | Database migrations |
| **Pydantic v2** | Data validation & settings |
| **Passlib + python-jose** | Password hashing & JWT |
| **Pandas + NumPy** | Excel processing & data analysis |
| **psycopg2** | PostgreSQL driver |
| **Pytest + httpx** | API testing |

### Infrastructure
| Technology | Purpose |
|---|---|
| **Render** | Cloud hosting (2 services) |
| **Neon PostgreSQL** | Serverless PostgreSQL database |
| **GitHub Actions** | CI/CD pipeline (auto-runs tests on push) |

---

## 📁 Project Structure

```
placement-portal/
├── .github/
│   └── workflows/
│       └── test.yml          # GitHub Actions CI pipeline
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/        # Admin portal pages
│   │   │   │   ├── analytics/
│   │   │   │   ├── ats/
│   │   │   │   ├── companies/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── drives/
│   │   │   │   ├── reports/
│   │   │   │   ├── settings/
│   │   │   │   ├── students/
│   │   │   │   └── team/
│   │   │   ├── dashboard/    # Student dashboard
│   │   │   └── login/        # Login pages (admin, manager, lead)
│   │   ├── components/       # Reusable UI components
│   │   └── lib/
│   │       └── api.ts        # API base URL config
│   ├── __tests__/            # Frontend unit tests
│   ├── vitest.config.ts
│   └── package.json
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── api/v1/endpoints/ # API route handlers
│   │   │   ├── auth.py
│   │   │   ├── companies.py
│   │   │   ├── dashboard.py
│   │   │   └── students.py
│   │   ├── core/
│   │   │   ├── config.py     # App settings (pydantic)
│   │   │   ├── database.py   # DB engine & session
│   │   │   └── security.py   # JWT & password hashing
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   └── crud/             # Database operations
│   ├── alembic/              # Database migrations
│   ├── tests/                # Backend API tests
│   ├── build.sh              # Render build script
│   ├── requirements.txt
│   └── Procfile
└── render.yaml               # Render Blueprint (IaC)
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- **Node.js** v20+
- **Python** 3.11+
- **PostgreSQL** (or use the Neon connection string in `.env`)

### 1. Clone the Repository
```bash
git clone https://github.com/Thivinkumar006/PlaceMind-AI.git
cd PlaceMind-AI/placement-portal
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database URL and secret key

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload
```

Backend will be running at: `http://localhost:8000`
API Docs available at: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install   # or: npm.cmd install (Windows PowerShell)

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Start the development server
npm run dev   # or: npm.cmd run dev (Windows PowerShell)
```

Frontend will be running at: `http://localhost:3000`

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|---|---|---|
| `SQLALCHEMY_DATABASE_URI` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `SECRET_KEY` | JWT signing secret (keep private!) | `a_long_random_string` |
| `BACKEND_CORS_ORIGINS` | Allowed frontend origins | `["http://localhost:3000"]` |

### Frontend (`frontend/.env.local`)
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://your-backend.onrender.com/api/v1` |

> ⚠️ **Never commit your `.env` files to Git.** They are listed in `.gitignore`.

---

## 🧪 Running Tests

### Backend Tests (Pytest)
```bash
cd backend
venv\Scripts\python.exe -m pytest tests/ -v
```

### Frontend Tests (Vitest)
```bash
cd frontend
npm run test
```

### CI Pipeline
Tests run automatically on every push to `main` via GitHub Actions.

---

## 🚢 Deployment on Render

This project uses Render's **Blueprint** feature for automated deployment.

### Quick Deploy
1. Fork this repository to your GitHub account.
2. Go to [Render Dashboard](https://dashboard.render.com) → **Blueprints** → **New Blueprint Instance**.
3. Connect your forked GitHub repository.
4. Render will automatically read `render.yaml` and create both services.
5. Add the required environment variables in the Render dashboard for each service (see above).

### Services Created
| Service Name | Type | Runtime |
|---|---|---|
| `placement-backend` | Web Service | Python 3.11 |
| `placement-frontend` | Web Service | Node 20 |

> **Important:** After deploying, copy the backend's live URL and set it as `NEXT_PUBLIC_API_URL` in the frontend service's environment variables. Then trigger a **"Clear build cache & deploy"** on the frontend.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login and get JWT token |
| `GET` | `/api/v1/students` | List all students |
| `POST` | `/api/v1/students` | Add a new student |
| `PUT` | `/api/v1/students/{id}` | Update a student |
| `DELETE` | `/api/v1/students/{id}` | Delete a student |
| `GET` | `/api/v1/companies` | List all companies |
| `POST` | `/api/v1/companies` | Add a new company |
| `GET` | `/api/v1/dashboard/stats` | Get dashboard statistics |

Full interactive documentation is available at `/docs` on your running backend.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📄 License

This project is for academic and demonstration purposes.

---

## 👨‍💻 Author

Built with ❤️ by **Thivinkumar** — [GitHub](https://github.com/Thivinkumar006/PlaceMind-AI)
