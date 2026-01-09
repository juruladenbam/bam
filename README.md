# Portal Digital Keluarga BAM (Monorepo)

Sistem informasi keluarga besar Bani Abdul Manan dengan silsilah digital berbasis Graph.

## 📁 Struktur Project

```
bam/
├── backend/          # Laravel API (api.bamseribuputu.my.id)
├── public-web/       # Public website (bamseribuputu.my.id)
├── portal/           # Member portal (portal.bamseribuputu.my.id)
├── admin/            # Admin dashboard (admin.bamseribuputu.my.id)
└── shared/           # Shared TypeScript types
```

## 🚀 Quick Start

### First Time Setup
```bash
# Backend
cd backend && cp .env.example .env && composer install
php artisan key:generate && php artisan migrate && cd ..

# Frontend (install all dependencies)
pnpm install && pnpm run install:all
```

### Development
```bash
pnpm run dev      # Run backend + all frontends
pnpm run dev:fe   # Run all frontends only (if backend already running)
```

### Production Build
```bash
pnpm run build              # Build all frontends
pnpm run build:public-web   # Build public-web only
pnpm run build:portal       # Build portal only
pnpm run build:admin        # Build admin only
```

### Individual Services (if needed)
```bash
pnpm run dev:backend     # Laravel only (port 8000)
pnpm run dev:public-web  # public-web only (port 5173)
pnpm run dev:portal      # portal only (port 5174)
pnpm run dev:admin       # admin only (port 5175)
```

## 🔗 Domain Architecture

| Domain | Folder | Port (Dev) |
|--------|--------|------------|
| `bamseribuputu.my.id` | public-web | 5173 |
| `portal.bamseribuputu.my.id` | portal | 5174 |
| `admin.bamseribuputu.my.id` | admin | 5175 |
| `api.bamseribuputu.my.id` | backend | 8000 |

## 📊 Database

Graph-based genealogy structure untuk menangani pernikahan sepupu (endogamy):

- **persons** - Data individu
- **marriages** - Relasi pernikahan (horizontal edge)
- **parent_child** - Relasi orang tua-anak (vertical edge)
- **branches** - 11 cabang keluarga

## 📖 Dokumentasi

Lihat [implementation_plan.md](./docs/implementation_plan.md) untuk detail lengkap arsitektur dan fitur.
