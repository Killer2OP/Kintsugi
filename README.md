# 🔮 Kintsugi

> **AI-Powered CI/CD Failure Intelligence Platform**

[![Live Demo](https://img.shields.io/badge/Live-Demo-blueviolet?style=for-the-badge)](https://kintsugi-mu.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/Killer2OP/Kintsugi)

**Kintsugi** transforms broken CI/CD pipelines into learning opportunities. Just like the Japanese art of repairing pottery with gold, we make your workflows stronger by intelligently analyzing and fixing failures with AI-powered insights.

---

## ✨ Features

- **🔥 Real-time Failure Detection** — Live monitoring of GitHub Actions failures across all repositories
- **🤖 AI-Powered Analysis** — Google Gemini 2.5 Pro generates intelligent fix suggestions with confidence scoring
- **👥 Human-in-the-Loop** — Review, approve, or reject AI-generated fixes with full audit trail
- **📊 Advanced Analytics** — ML-driven pattern recognition and cross-repository insights
- **🌐 Multi-Language Support** — JavaScript, TypeScript, Python, Go, and more
- **📈 Predictive Intelligence** — Learn from historical patterns to prevent future failures

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- PostgreSQL database (Supabase recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/Killer2OP/Kintsugi.git
cd Kintsugi

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the dashboard.

### Environment Variables

```bash
DATABASE_URL=postgresql://...
GITHUB_TOKEN=github_pat_...
GEMINI_API_KEY=AIza...
```

---

## 🛠️ Tech Stack

| Layer          | Technology                          |
| -------------- | ----------------------------------- |
| **Framework**  | Next.js 15 (App Router + Turbopack) |
| **Language**   | TypeScript                          |
| **Styling**    | Tailwind CSS + shadcn/ui            |
| **Database**   | PostgreSQL (Supabase)               |
| **AI Engine**  | Google Gemini 2.5 Pro               |
| **Charts**     | Recharts                            |
| **Deployment** | Vercel                              |

---

## 📱 Dashboard Pages

| Page              | Description                                     |
| ----------------- | ----------------------------------------------- |
| **`/`**           | Landing page with feature overview              |
| **`/dashboard`**  | Real-time monitoring and system status          |
| **`/failures`**   | Comprehensive failure management with filtering |
| **`/fixes`**      | Human approval workflow for AI fixes            |
| **`/analytics`**  | ML insights and pattern recognition             |
| **`/repository`** | Per-repository analysis and trends              |
| **`/settings`**   | Configuration and preferences                   |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Frontend                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐│
│  │  Dashboard  │ │  Analytics  │ │    Fix Management       ││
│  └──────┬──────┘ └──────┬──────┘ └───────────┬─────────────┘│
│         │               │                     │              │
│         └───────────────┴──────────┬──────────┘              │
│                                    ▼                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Next.js API Routes (/api)                  ││
│  └─────────────────────────┬───────────────────────────────┘│
└────────────────────────────┼────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   PostgreSQL  │   │ GitHub API    │   │ Gemini AI     │
│   (Supabase)  │   │ (Webhooks)    │   │ (Analysis)    │
└───────────────┘   └───────────────┘   └───────────────┘
```

---

## 📜 Scripts

```bash
npm run dev       # Start development server with Turbopack
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**[Live Demo](https://kintsugi-mu.vercel.app/)** • **[GitHub Repository](https://github.com/Killer2OP/Kintsugi)**

Built with ❤️ using Next.js, TypeScript, and AI

</div>
