# Lunexbd E-Commerce Frontend

Production-ready Next.js App Router storefront for a headless WordPress + WooCommerce build.

## Stack

- Next.js with TypeScript
- Custom SCSS/SASS only
- WordPress Headless CMS
- WooCommerce products, cart, checkout, orders, payments, coupons, shipping, and tax

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Environment

Use `.env.example` as the source template. WooCommerce keys must stay server-side and must not use a `NEXT_PUBLIC_` prefix.

## Architecture

- `app/`: required storefront routes and API proxy
- `components/`: typed reusable UI, layout, product, cart, checkout, auth, account, wishlist, blog, forms, SEO, common components
- `services/api/`: typed API service layer
- `services/wordpress/`: WordPress endpoint references
- `styles/`: global SCSS architecture
- `types/`: shared TypeScript contracts
- `utils/`: formatting, validation, SEO, schema, storage helpers
- `docs/`: deployment, endpoint, and testing documentation
