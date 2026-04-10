# Smart Finance Advisor

Production-oriented fintech web application built with Django, DRF, React, Tailwind CSS, Recharts, Neon PostgreSQL, JWT auth, Stripe webhooks, and SMTP email.

## Architecture

- Backend: Django + Django REST Framework + SimpleJWT
- Frontend: React + Vite + Tailwind CSS + Recharts
- Database: Neon PostgreSQL via `DATABASE_URL`
- Integrations: CoinGecko, Alpha Vantage, Gold API, Stripe, SMTP (Gmail/SendGrid)

## Backend apps

- `users`
- `investments`
- `transactions`
- `market_data`
- `recommendations`
- `payments`
- `analytics`
- `loans`
- `notifications`
- shared services in `services/`

## Key features

- JWT register/login and user financial profile
- Investment CRUD for gold, stocks, and crypto
- Price fetch adapters and moving-average BUY/SELL/HOLD suggestions
- Automated transaction tracking from Stripe events only (`payment_intent.succeeded`, `charge.succeeded`, `invoice.paid`, `checkout.session.completed`)
- Stripe Checkout session API, payment link API, and verified webhook endpoint at `/api/payments/webhook/`
- Auto categorization (metadata/merchant/description) and automatic balance update
- Analytics dashboard endpoints for portfolio growth, monthly spending, category spend, and net worth
- Financial health scoring and loan recommendation engine with trust scoring
- EMI calculator API and frontend tools
- SMTP-powered payment receipts, monthly summary, profit/loss, and loan warning emails
- Role-aware flows: `user`, `loan_provider`, and `admin`; provider dashboard + loan applications

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
- Stripe webhook handler is signature-verified and idempotent by event ID.
- Loan recommendations depend on seeded `LoanProvider` rows.
- SMTP email endpoints require `EMAIL_HOST`, `EMAIL_HOST_USER`, and `EMAIL_HOST_PASSWORD`.

## API reference

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md).
