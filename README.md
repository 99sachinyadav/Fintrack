# Central Banking Management System

Production-oriented fintech web application built with Django, DRF, React, Tailwind CSS, Recharts, Neon PostgreSQL, JWT auth, Stripe, Razorpay, and Resend.

## Architecture

- Backend: Django + Django REST Framework + SimpleJWT
- Frontend: React + Vite + Tailwind CSS + Recharts
- Database: Neon PostgreSQL via `DATABASE_URL`
- Integrations: CoinGecko, Alpha Vantage, Gold API, Stripe, Razorpay, Resend

## Backend apps

- `users`
- `investments`
- `transactions`
- `analytics`
- `loans`
- `notifications`
- shared services in `services/`

## Key features

- JWT register/login and user financial profile
- Investment CRUD for gold, stocks, and crypto
- Price fetch adapters and moving-average BUY/SELL/HOLD suggestions
- Expense tracking with webhook ingestion for Stripe and Razorpay
- Analytics dashboard endpoints for portfolio growth, monthly spending, category spend, and net worth
- Financial health scoring and loan recommendation engine with trust scoring
- EMI calculator API and frontend tools
- Resend-powered monthly summary, profit/loss, and loan warning emails

## Setup

### Backend

1. Create and activate a virtual environment.
2. Install dependencies with `pip install -r req.txt`.
3. Copy `.env.example` to `.env` and fill in your secrets.
4. Run `python manage.py makemigrations`.
5. Run `python manage.py migrate`.
6. Optionally create an admin user with `python manage.py createsuperuser`.
7. Start Django with `python manage.py runserver`.

### Frontend

1. In `frontend/`, install dependencies with `npm install`.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. Start the app with `npm run dev`.

## Docker

- `docker compose up --build`

## Notes

- Live market APIs require provider keys and symbols in the formats expected by those services.
- Stripe and Razorpay webhook handlers are signature-aware and idempotent by event ID.
- Loan recommendations depend on seeded `LoanProvider` rows.
- Resend email endpoints require `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.

## API reference

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md).
