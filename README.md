# Financial Planning Report Generator

Multi-step financial planning wizard with React frontend and Django REST API. Collects client profile, income, expenses, assets, liabilities, goals, investments, insurance, and assumptions — then generates a Word report via `python-docx`.

## Project structure

```
Report-gen/
├── frontend/          # React 19 + Vite + MUI + React Router + Chart.js
│   └── src/
│       ├── context/   # ClientFormContext (wizard form state)
│       ├── components/
│       ├── pages/     # 11 wizard steps
│       ├── hooks/
│       └── utils/
└── backend/           # Django + DRF (no DB persistence)
    ├── client/        # API + report generation
    │   └── calculations/
    └── config/
```

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173/client](http://localhost:5173/client).

### Wizard routes

| Step | Route              | Description                          |
|------|--------------------|--------------------------------------|
| 1    | `/client`          | Personal + Family details            |
| 2    | `/income`          | Income sources (annual/monthly)      |
| 3    | `/expenses`        | Expenses & savings                   |
| 4    | `/assets`          | Asset values                         |
| 5    | `/liabilities`     | Liabilities & net worth              |
| 6    | `/goals`           | Financial goals with templates       |
| 7    | `/investments`     | Mutual funds & stocks                |
| 8    | `/insurance`       | Insurance coverage & recommendations |
| 9    | `/emergency-fund`  | Emergency fund analysis              |
| 10   | `/assumptions`     | Planning assumptions                 |
| 11   | `/review`          | Summary, charts, generate report     |

`/` redirects to `/client`.

### Form state

All wizard data lives in `ClientFormContext` (`frontend/src/context/ClientFormContext.jsx`). Sections: `personal`, `familyMembers`, `income`, `expenses`, `assets`, `liabilities`, `goals`, `investments`, `insurance`, `emergencyFund`, `assumptions`.

## Backend

```bash
cd backend

# Windows
.\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate    # Django internals only; no app models
python manage.py runserver
```

API base: [http://127.0.0.1:8000](http://127.0.0.1:8000)

### `POST /api/client/`

Accepts JSON, validates, and echoes the payload (no database write). Supports the full client payload including all wizard sections.

### `POST /api/generate-report/`

Accepts the full client JSON (same shape as `buildClientPayload` in `frontend/src/utils/validation.js`), generates a Word document, and returns it as a file download.

Example using curl (minimal payload):

```bash
curl -X POST http://127.0.0.1:8000/api/generate-report/ \
  -H "Content-Type: application/json" \
  -d "{\"personal\":{\"full_name\":\"Jane Doe\",\"age\":35,\"marital_status\":\"Married\",\"retirement_age\":60,\"occupation\":\"Engineer\"},\"family_members\":[]}" \
  --output report.docx
```

From the UI: complete all wizard steps, go to **Review**, and click **Generate Report**.

The Vite dev server proxies `/api/*` to Django on port 8000.

## Running both together

1. Terminal 1: `cd backend && .\.venv\Scripts\activate && python manage.py runserver`
2. Terminal 2: `cd frontend && npm run dev`

Walk through all 11 steps, then generate the report from `/review`.

## Validation

Each step validates required fields before **Next**. The review step runs full-form validation before report generation.

## Notes

- No database persistence — all state is in-memory (React Context) for the session.
- Currency displayed in Indian locale (₹).
- Date of birth uses an external label pattern to avoid native date placeholder overlap.
