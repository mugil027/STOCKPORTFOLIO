# Portfolio Dashboard

A dynamic, real-time stock portfolio dashboard built with **Next.js**, **Node.js**, **TypeScript**, and **Tailwind CSS**. Displays live CMP, P/E Ratio, and EPS for Indian equity holdings fetched from Yahoo Finance, Google Finance, and Finnhub — with automatic fallback tiers when any source fails.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | Next.js 14, React 18, TypeScript        |
| Backend   | Node.js, Express, TypeScript            |
| Styling   | Tailwind CSS                            |
| Charts    | Recharts                                |
| HTTP      | Axios                                   |
| Caching   | node-cache                              |

---

## Features

- **Portfolio table** with 12 columns: Particulars, Purchase Price, Qty, Investment, Portfolio %, NSE/BSE, CMP, Present Value, Gain/Loss, Gain/Loss %, P/E Ratio, EPS
- **Sector grouping** with expandable sections and sector-level summaries (Investment, Present Value, Gain/Loss)
- **Color-coded Gain/Loss** — green for gains, red for losses
- **Auto-refresh** every 5 minutes with a manual refresh button
- **Live data indicators** — green blinking dot on values fetched from real APIs
- **4-tier data fallback**: Yahoo Finance → Google Finance → Finnhub → Mock data

---

## Project Structure

```
PortfolioTask/
├── Frontend/          # Next.js app
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # usePortfolio hook
│   │   ├── services/     # API client
│   │   ├── types/        # TypeScript interfaces
│   │   └── utils/        # Formatters
│   └── .env.local        # Frontend env vars
└── Backend/           # Express API server
    ├── src/
    │   ├── data/         # Holdings data + symbol maps
    │   ├── routes/       # Express routes
    │   ├── services/     # Yahoo, Google, Finnhub, cache services
    │   └── types/        # TypeScript interfaces
    └── .env              # Backend env vars
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd PortfolioTask
```

### 2. Backend setup

```bash
cd Backend
npm install
```

Create a `.env` file in `Backend/`:

```env
PORT=4000
NODE_ENV=development
CACHE_TTL=60
FINNHUB_API_KEY=your_finnhub_key_here   # Get free key at finnhub.io
FRONTEND_URL=http://localhost:3000
```

Start the backend:

```bash
npm run dev
```

The API will be available at `http://localhost:4000/api`

### 3. Frontend setup

```bash
cd Frontend
npm install
```

Create a `.env.local` file in `Frontend/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

Start the frontend:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints

| Method | Endpoint           | Description                     |
|--------|--------------------|---------------------------------|
| GET    | `/api/portfolio`   | Full enriched portfolio data    |
| GET    | `/api/holdings`    | Static holdings list            |
| POST   | `/api/refresh`     | Force-refresh (bypass cache)    |
| GET    | `/api/health`      | Server health check             |

---

## Data Flow — 4-Tier Fallback

```
Browser opens → Backend /api/portfolio called
       │
       ├── Tier 1: Yahoo Finance (CMP) + Google Finance (P/E, EPS)
       │          ↓ if blocked or null
       ├── Tier 2: Yahoo quoteSummary (P/E & EPS fallback)
       │          ↓ if blocked or null
       ├── Tier 3: Finnhub API (CMP + P/E + EPS — works on cloud servers)
       │          ↓ if also unavailable
       └── Tier 4: Mock data (hardcoded fallback, always succeeds)
```

Yahoo and Google Finance block requests from cloud datacenter IPs (AWS, GCP, etc.). Finnhub is a proper stock data API designed to be called from servers, making it the reliable tier when deployed.

---

## Deployment

### Frontend → Vercel
1. Push repo to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `Frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api`

### Backend → Railway
1. Create a new project on [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Set **Root Directory** to `Backend`
4. Add environment variables:
   ```
   NODE_ENV=production
   CACHE_TTL=60
   FINNHUB_API_KEY=your_key
   FRONTEND_URL=https://your-app.vercel.app
   ```

---

## Environment Variables Reference

### Backend
| Variable          | Default       | Description                         |
|-------------------|---------------|-------------------------------------|
| `PORT`            | `4000`        | Server port                         |
| `NODE_ENV`        | `development` | Environment                         |
| `CACHE_TTL`       | `60`          | Cache duration in seconds           |
| `FINNHUB_API_KEY` | —             | Finnhub API key (free at finnhub.io)|
| `FRONTEND_URL`    | —             | Allowed CORS origin                 |

### Frontend
| Variable               | Description               |
|------------------------|---------------------------|
| `NEXT_PUBLIC_API_URL`  | Backend API base URL      |
