# Emotiv Product Worker

A simple Cloudflare Worker that serves product prices from Cloudflare KV instead of calling WooCommerce on every request.

## What changed

Old flow:
- request comes in
- Worker calls `shop.emotiv.com`
- Worker formats the response
- user waits for WooCommerce every time

New flow:
- request comes in
- Worker reads product data from KV immediately
- a scheduled sync fetches fresh product data from WooCommerce every 6 hours
- KV gets updated in the background

This makes the API faster and more stable.

## What it does

This Worker has two jobs:

### 1. Serve cached product data

#### Get all products

```txt
https://your-worker-url.workers.dev
```

Example response:

```json
{
  "count": 40,
  "lastUpdated": "2026-05-20T10:00:00.000Z",
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

#### Get one product by slug

```txt
https://your-worker-url.workers.dev?slug=product-slug
```

Example response:

```json
{
  "name": "Product name",
  "slug": "product-slug",
  "price": 299,
  "priceText": "$299",
  "currency": "USD",
  "permalink": "https://shop.emotiv.com/product/...",
  "inStock": true,
  "image": "https://...",
  "lastUpdated": "2026-05-20T10:00:00.000Z"
}
```

If the product does not exist:

```json
{
  "error": "product not found",
  "slug": "product-slug",
  "lastUpdated": "2026-05-20T10:00:00.000Z"
}
```

### 2. Sync fresh prices in the background

The Worker also has a scheduled job.

Every 6 hours it:
- fetches products from WooCommerce
- formats the data
- stores the full product list in KV
- stores each product by slug in KV
- stores a `lastUpdated` timestamp

## Files

```txt
emotiv-product-worker/
├── worker.js
├── wrangler.toml
└── README.md
```

- `worker.js` contains the Worker code
- `wrangler.toml` contains Cloudflare Worker config
- `README.md` explains setup and usage

## Cloudflare setup

### 1. Create a KV namespace

Create a KV namespace in Cloudflare, then copy the namespace ID.

Example binding name used by this project:

- `PRODUCTS_KV`

### 2. Update `wrangler.toml`

Replace the placeholder KV namespace IDs with your real ones.

### 3. Deploy

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

### 4. Seed the KV once

Important: KV will be empty on first deploy.

You need the scheduled sync to run once, or trigger a manual sync if you add one later.

Until KV is filled, the Worker will return empty results.

## How it works in simple words

- users hit your Worker URL
- the Worker reads saved product data from KV
- that response is fast because it does not wait for WooCommerce
- separately, Cloudflare runs a cron job every 6 hours
- the cron job fetches fresh prices and updates KV

So the Worker acts like a fast cached API in front of WooCommerce.

## Notes for developers

- supports `GET` and `OPTIONS`
- CORS is open with `access-control-allow-origin: *`
- prices are converted from WooCommerce minor units into normal values
- `lastUpdated` shows when the cached data was last refreshed
- this version is better for frontend use because requests are immediate and stable
