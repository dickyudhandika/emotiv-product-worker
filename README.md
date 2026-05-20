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

This Worker has three jobs:

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

### 2. Sync fresh prices automatically

The Worker has a scheduled job.

Every 6 hours it:
- fetches products from WooCommerce
- formats the data
- stores the full product list in KV
- stores each product by slug in KV
- stores a `lastUpdated` timestamp

### 3. Sync fresh prices manually

This is useful right after first deploy so you do not have to wait for cron.

Endpoint:

```txt
https://your-worker-url.workers.dev/sync?secret=YOUR_SYNC_SECRET
```

Example response:

```json
{
  "ok": true,
  "message": "products synced",
  "count": 40,
  "lastUpdated": "2026-05-20T10:00:00.000Z"
}
```

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

### 1. KV namespace

This repo already uses your KV namespace ID:

- `38315c95f3044ad4b71bb677d51904e1`

Binding name:

- `PRODUCTS_KV`

### 2. Add a Worker secret

You need to create a Worker secret named:

- `SYNC_SECRET`

In Cloudflare dashboard:
- open your Worker project
- go to **Settings**
- go to **Variables**
- add a **Secret** named `SYNC_SECRET`
- set any strong value you want

Example:

```txt
SYNC_SECRET = my-super-secret-sync-key
```

### 3. Deploy from GitHub

On your setup screen:
- project name: `emotiv-product-worker`
- build command: leave empty
- deploy command: `npx wrangler deploy`

Then press **Deploy**.

### 4. Seed the KV immediately

After deploy, call:

```txt
https://your-worker-url.workers.dev/sync?secret=YOUR_SYNC_SECRET
```

That will fetch products from WooCommerce and fill KV right away.

## How it works in simple words

- users hit your Worker URL
- the Worker reads saved product data from KV
- that response is fast because it does not wait for WooCommerce
- separately, Cloudflare runs a cron job every 6 hours
- the cron job fetches fresh prices and updates KV
- if you need instant setup, call `/sync` once manually

So the Worker acts like a fast cached API in front of WooCommerce.

## Notes for developers

- supports `GET` and `OPTIONS`
- CORS is open with `access-control-allow-origin: *`
- prices are converted from WooCommerce minor units into normal values
- `lastUpdated` shows when the cached data was last refreshed
- `/sync` is protected by `SYNC_SECRET`
- this version is better for frontend use because requests are immediate and stable
