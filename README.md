# Emotiv Product Worker

A simple Cloudflare Worker that fetches product data from the Emotiv WooCommerce Store API and returns clean JSON.

## What it does

This worker has two modes:

### 1. Get all products

Open the worker URL without any query:

```txt
https://your-worker-url.workers.dev
```

It returns up to 40 products from:

```txt
https://shop.emotiv.com/wp-json/wc/store/v1/products?per_page=40&page=1
```

Example response shape:

```json
{
  "count": 40,
  "products": [
    {
      "name": "Product name",
      "slug": "product-slug",
      "price": 299,
      "priceText": "$299",
      "currency": "USD",
      "permalink": "https://shop.emotiv.com/product/...",
      "inStock": true,
      "image": "https://..."
    }
  ]
}
```

### 2. Get one product by slug

Add a `slug` query parameter:

```txt
https://your-worker-url.workers.dev?slug=product-slug
```

The worker fetches the matching product and returns only one clean product object.

If the product does not exist, it returns:

```json
{
  "error": "product not found",
  "slug": "product-slug"
}
```

## Files

```txt
emotiv-product-worker/
├── worker.js
└── README.md
```

- `worker.js` contains the Cloudflare Worker code.
- `README.md` explains how the worker works.

## How to use

1. Create a new Cloudflare Worker.
2. Copy the code from `worker.js`.
3. Paste it into the Worker editor.
4. Deploy it.
5. Test the Worker URL in your browser.

## Notes for developers

- This worker only supports `GET` and `OPTIONS` requests.
- CORS is open with `access-control-allow-origin: *`, so websites and apps can call it from the browser.
- Product prices are converted from WooCommerce minor units into normal values.
  - Example: `29900` with `currency_minor_unit: 2` becomes `299`.
- The response is simplified so frontend developers do not need to handle the full WooCommerce API response.
