# Lunexbd Deployment Guide

## Frontend

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and update WordPress/WooCommerce values.
3. Run `npm run build`.
4. Deploy the Next.js app to Vercel, VPS, or another Node hosting provider.

Vercel CLI is not installed on this machine. Installing it with `npm i -g vercel` is recommended for `vercel env pull`, `vercel deploy`, and `vercel logs`.

## WordPress/WooCommerce

1. Install WordPress, WooCommerce, and licensed production plugins only.
2. Configure products, categories, attributes, variations, coupons, shipping, tax, COD, and payment gateways.
3. Add the Lunex custom REST endpoints listed in `docs/WORDPRESS_ENDPOINTS.md`.
4. Keep WooCommerce consumer keys server-side only.
5. Enable CORS only for the approved storefront domain.

## Handover

- Provide WordPress admin credentials through a secure channel.
- Provide hosting access, DNS access, and database export instructions.
- Confirm backup and restore procedure before production launch.
