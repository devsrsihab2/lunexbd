# WordPress REST Endpoint Contract

All endpoints should return:

```ts
{
  success: boolean;
  data: unknown;
  message?: string;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
}
```

Required custom namespace: `/wp-json/lunex/v1`.

- `GET /home`
- `GET /settings`
- `GET /menus`
- `GET /products`
- `GET /products/{slug}`
- `GET /products/{id}/related`
- `GET /categories`
- `GET /categories/{slug}`
- `GET /categories/{slug}/products`
- `GET /cart`
- `POST /cart/items`
- `PUT /cart/items/{key}`
- `DELETE /cart/items/{key}`
- `POST /coupon`
- `DELETE /coupon/{code}`
- `GET /checkout/options`
- `POST /checkout`
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `GET /me`
- `PUT /me`
- `GET /orders`
- `GET /orders/{id}`
- `GET /order-tracking`
- `GET /wishlist`
- `POST /wishlist`
- `DELETE /wishlist/{productId}`
- `GET /pages/{slug}`
- `GET /posts`
- `GET /posts/{slug}`
- `POST /contact`

Sensitive WooCommerce requests must run in WordPress or through the Next.js server proxy. Never expose `WC_CONSUMER_KEY` or `WC_CONSUMER_SECRET` to browser JavaScript.
