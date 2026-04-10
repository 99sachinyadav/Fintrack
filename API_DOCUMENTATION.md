# Central Banking Management System API

## Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/profile`
- `PATCH /api/auth/profile`

## Investments

- `GET /api/investments/`
- `POST /api/investments/add`
- `PATCH /api/investments/{id}`
- `DELETE /api/investments/{id}`
- `GET /api/investments/summary`
- `GET /api/investments/suggestions`

## Transactions

- `GET /api/transactions/`
- `POST /api/transactions/manual`
- `GET /api/transactions/monthly-summary`
- `POST /api/webhooks/stripe`
- `POST /api/webhooks/razorpay`

## Analytics

- `GET /api/analytics/dashboard`
- `GET /api/analytics/networth`
- `GET /api/analytics/financial-health`

## Loans

- `GET /api/loans/providers`
- `GET /api/loans/recommendations`
- `POST /api/loans/emi-calculate`

## Notifications

- `GET /api/notifications/`
- `POST /api/notifications/send-monthly-summary`
- `POST /api/notifications/send-profit-loss`
- `POST /api/notifications/send-loan-warning`
