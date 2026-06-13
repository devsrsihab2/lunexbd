# Need Confirmation

Safe defaults have been implemented while these items wait for final client/backend confirmation.

- Hosting target is still open. The frontend is ready for Vercel, VPS, or another Node-capable host.
- Exact WordPress custom endpoint payloads need to be finalized with the backend implementer.
- Payment gateway behavior will follow active WooCommerce gateways. No gateway-specific frontend flow is hardcoded.
- Guest wishlist is expected from `/wp-json/lunex/v1/settings` or `/wishlist` settings.
- SEO fields are expected from WordPress/custom fields and can be mapped once the CMS schema is confirmed.
