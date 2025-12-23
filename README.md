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

### Backend (Laravel)
```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve
```

### Frontend (React)
```bash
# Install dependencies
cd public-web && npm install && cd ..
cd portal && npm install && cd ..
cd admin && npm install && cd ..

# Run dev servers
cd public-web && npm run dev  # Port 5173
cd portal && npm run dev      # Port 5174
cd admin && npm run dev       # Port 5175
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
