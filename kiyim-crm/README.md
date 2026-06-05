# LIBOS CRM 👕

Chakana **kiyim do'koni** uchun zamonaviy boshqaruv tizimi (POS + CRM).
Frontend (React + Vite + Tailwind) · Backend (Express + MongoDB + JWT) · Docker.

> ModaFlow (ulgurji B2B) dan farqli — bu **chakana do'kon** uchun: kassa (POS),
> sodiqlik ballari, mahsulot variantlari (o'lcham/rang), kassirlar reytingi.

## Arxitektura

```
kiyim-crm/
├── src/               ← Frontend (React, yengil oq dizayn, yuqori navbar)
├── backend/           ← Express + MongoDB + JWT
│   └── src/
│       ├── models/    ← Staff, Customer, Product, Sale, Supplier, Activity
│       ├── routes/    ← /api/auth, /staff, /customers, /products, /sales, ...
│       └── seed.js    ← Demo data (avto-seed agar baza bo'sh bo'lsa)
├── Dockerfile         ← Frontend (nginx + multi-stage)
├── nginx.conf         ← /api → backend proxy
└── docker-compose.yml ← mongo + backend + frontend
```

## Ishga tushirish (Docker)

```bash
docker compose up -d --build
```

- Frontend: **http://localhost** (80-port)
- Backend health: **http://localhost/api/health**

Boshqa portda ishlatish: `WEB_PORT=8080 docker compose up -d --build`

Birinchi ishga tushganda baza avtomatik to'ladi: 5 xodim, ~48 mahsulot, 40 mijoz, 120 savdo.

## Lokal (Docker'siz)

```bash
# 1) Mongo
docker run -d --name mongo -p 27017:27017 mongo:7
# 2) Backend
cd backend && npm install && npm run dev      # :3001
# 3) Frontend (yangi terminal)
npm install && npm run dev                    # :5174
```

## 🔑 Demo akkauntlar

| Rol | Email | Parol |
|---|---|---|
| **Egasi** | `admin@libos.uz` | `admin123` |
| **Menejer** | `manager@libos.uz` | `manager123` |
| **Kassir** | `kassir@libos.uz` | `kassir123` |

## Sahifalar va ruxsatlar

| Sahifa | Egasi | Menejer | Kassir |
|---|---|---|---|
| Boshqaruv | ✓ | ✓ | ✓ |
| Kassa (POS) | ✓ | ✓ | ✓ |
| Savdolar | ✓ | ✓ | ✓ (o'ziniki) |
| Mahsulotlar | ✓ | ✓ (CRUD) | ✓ (ko'rish) |
| Mijozlar | ✓ | ✓ | ✓ |
| Yetkazib beruvchilar | ✓ | ✓ | — |
| Hisobotlar | ✓ | ✓ | — |
| Xodimlar | ✓ (CRUD) | ✓ (ko'rish) | — |
| Faollik | ✓ | ✓ | — |
| Sozlamalar | ✓ | — | — |

## API

```
POST   /api/auth/login            { email, password }
GET    /api/auth/me
POST   /api/auth/change-password

GET    /api/staff      POST/PATCH/DELETE
GET    /api/customers  POST/PATCH/DELETE
GET    /api/products   POST/PATCH/DELETE
GET    /api/sales      POST           POST /api/sales/:id/refund
GET    /api/suppliers  POST/PATCH/DELETE
GET    /api/activities
GET    /api/stats/overview | daily | top-products | by-category | by-payment | top-cashiers | tiers
```

## Texnologiyalar

React 18 · Vite · Tailwind · react-router · recharts · lucide-react
Express 4 · Mongoose 8 · bcryptjs · jsonwebtoken · MongoDB 7 · Docker · nginx
