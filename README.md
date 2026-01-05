# Personal Expense Tracker Dashboard

A premium-feeling personal expense tracker dashboard.

- Frontend: **Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Recharts + Framer Motion**
- Backend: **PHP (clean REST endpoints) + MySQL**
- Single user, **no auth** (by design)

---

## Demo

![Project Demo](frontend/public/ProjectDemo.png)

---

## Project Structure

```
expense/
  frontend/                 # Next.js App Router UI
  backend/
    api/                    # PHP REST endpoints
    database/schema.sql     # MySQL schema + seeded categories
```

---

## Features

- Add / edit / delete expenses
- Fixed categories (seeded)
- Monthly total + month selector
- Category breakdown (pie chart on Expenses page)
- Over-time trend line (daily totals)
- Modern dark UI, responsive sidebar, mobile drawer

---

## Requirements

- Node.js 18+ (recommended)
- XAMPP (Apache + MySQL)

---

## Backend Setup (XAMPP)

### 1) Serve the backend with Apache

XAMPP serves projects from:

- `C:\xampp\htdocs\`

This repo is on your Desktop, so you have two options:

#### Option A (recommended): junction/symlink (keeps repo on Desktop)

Create a junction so Apache can access the backend:

- `C:\xampp\htdocs\expense-api` → `C:\Users\Admin\Desktop\expense\backend`

After that the API base is:

- `http://localhost/expense-api/api`

#### Option B: copy the backend folder into htdocs

Copy:

- `backend/` → `C:\xampp\htdocs\expense-api\`

API base will be the same:

- `http://localhost/expense-api/api`

### 2) Start services

Open **XAMPP Control Panel**:

- Start **Apache**
- Start **MySQL**

### 3) Import database schema

Open phpMyAdmin:

- `http://localhost/phpmyadmin`

Import:

- `backend/database/schema.sql`

This creates:

- Database: `expense_tracker`
- Tables: `categories`, `expenses`
- Seed categories

### 4) Configure DB env

Create `backend/.env` (or edit it) with your XAMPP MySQL settings:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=expense_tracker
DB_USER=root
DB_PASS=
```

---

## Frontend Setup (Next.js)

### 1) Configure API base

Create or edit:

- `frontend/.env.local`

Example (XAMPP Apache):

```
NEXT_PUBLIC_API_BASE=http://localhost/expense-api/api
```

### 2) Install and run

```bash
cd frontend
npm install
npm run dev
```

Open:

- `http://localhost:3000`

---

## REST API

Base:

- `http://localhost/expense-api/api`

### Categories

- `GET /categories.php`

### Expenses

- `GET /expenses.php?month=YYYY-MM&limit=100`
- `POST /expenses.php`
  - body: `{ amount, category_id, date, note? }`
- `PUT /expenses.php?id=123`
  - body: `{ amount, category_id, date, note? }`
- `DELETE /expenses.php?id=123`

### Dashboard

- `GET /dashboard.php?month=YYYY-MM`

Returns:

- totals (this month, last month, delta)
- `by_category` totals
- `over_time` daily totals (frontend fills missing days)

---

## Notes

- Amounts are stored as integer cents (`amount_cents`) to keep logic simple and avoid float issues.
- Categories are fixed/seeded (no category CRUD in UI).

---

## Troubleshooting

### Frontend shows `ERR_CONNECTION_REFUSED`

- Make sure Apache is running in XAMPP.
- Make sure this URL works in the browser:
  - `http://localhost/expense-api/api/categories.php`
- Verify `frontend/.env.local` points to the correct API base.
- Restart `npm run dev` after changing `.env.local`.

### Dashboard is empty

- Ensure the database schema is imported.
- Add a few expenses in the current month.

---

## License

Personal project / educational use.
