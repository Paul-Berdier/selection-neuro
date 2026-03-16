# Sélection neuro — Next.js Frontend

Premium e-commerce frontend for the Sélection neuro supplement store.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL to your FastAPI backend URL
npm run dev
```

## Structure

```
src/
├── app/
│   ├── page.tsx                  # Homepage
│   ├── login/                    # Auth pages
│   ├── register/
│   ├── products/                 # Product catalog & detail
│   │   └── [slug]/
│   ├── stacks/                   # Stack pages
│   │   └── [slug]/
│   ├── cart/                     # Shopping cart
│   ├── checkout/                 # Multi-step checkout
│   ├── account/
│   │   ├── orders/               # Order history
│   │   └── addresses/            # Address management
│   └── admin/                    # Admin panel (token-gated)
│       ├── orders/               # Order management
│       ├── products/             # Product CRUD
│       └── inventory/            # Stock management
├── components/
│   ├── layout/                   # Navbar, Footer
│   └── address/                  # AddressForm
├── hooks/
│   ├── useAuth.tsx               # Auth context
│   └── useCart.tsx               # Cart context
├── services/
│   └── api.ts                    # Full API client
└── types/
    └── index.ts                  # TypeScript types
```

## API Routes Covered

| Route | Description |
|---|---|
| `POST /auth/register` | Registration |
| `POST /auth/login` | Login |
| `GET /auth/me` | Current user |
| `GET/POST/PUT/DELETE /addresses` | Address CRUD |
| `GET /products` | Product listing |
| `GET /products/:slug` | Product detail |
| `GET/POST/PATCH/DELETE /cart/items` | Cart management |
| `GET/POST /orders` | Order management |
| `PUT /orders/:id/addresses` | Set shipping/billing |
| `PUT /orders/:id/shipping` | Set shipping method |
| `GET /shipping/rates` | Shipping rates |
| `GET/POST /stacks` | Stack listing & detail |
| `POST /payments/stripe/checkout-session` | Stripe checkout |
| `GET/PATCH /admin/orders` | Admin order management |
| `GET/POST/PUT/DELETE /admin/products` | Admin product CRUD |
| `PUT /admin/inventory/products/:id` | Stock management |

## Admin Panel

Access `/admin` — you'll be prompted for an admin token. The token is stored in `localStorage` as `admin_token` and sent as `X-Admin-Token` header.
