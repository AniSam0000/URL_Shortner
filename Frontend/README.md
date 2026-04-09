# Frontend

React + Vite frontend for the URL shortener backend.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

By default, `/api/*` requests are proxied to `http://localhost:5000`.

## Environment

Copy `.env.example` to `.env` if you need custom values:

- `VITE_BACKEND_URL`: backend origin for local Vite proxy.
- `VITE_API_BASE_URL`: optional absolute API base path for non-proxy deployments.
