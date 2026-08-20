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

If the product does not exist (always HTTP 200):

```json
{
  "slug": "product-slug",
  "displayText": "Data not available",
  "available": false,
  "priceText": null,
  "lastUpdated": "2026-05-20T10:00:00.000Z"
}
```

When the product exists, the response also includes `displayText` (same as `priceText`) and `available: true` — designed for Framer Fetch (see below).

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
- `syncProducts()` deletes stale per-slug KV keys for products removed from WooCommerce

---

# Framer Fetch config — emotiv.com/accessories (12 cards + 12 detail pages)

Endpoint: `https://emotiv-product-worker.dicky-996.workers.dev/?id=<WOO_ID>`
Path: `displayText`
Fallback (optional): if fetch fails, Framer shows empty — set a fallback text "Data not available" if desired.

Worker always returns a string: `priceText` when product exists, `"Data not available"` when removed/not-yet-synced. No conditional needed.

**Why `?id=` instead of `?slug=`:** WooCommerce product IDs never change. If a product slug is renamed in the shop admin, `?slug=` lookups break (card shows "Data not available") — `?id=` keeps working with zero Framer edits. `?slug=` still supported for back-compat.

## Cards (accessories page)

| # | Framer page slug (href) | Fetch URL | Correct price |
|---|---|---|---|
| 1 | flex-saline-sensors | `https://emotiv-product-worker.dicky-996.workers.dev/?id=3628` | $1,249 |
| 2 | epoc-hydrator-pack | `https://emotiv-product-worker.dicky-996.workers.dev/?id=79` | $49.95 |
| 3 | epoc-x-usb-receiver-universal | `https://emotiv-product-worker.dicky-996.workers.dev/?id=71` | $59.95 |
| 4 | insight-charging-cable | `https://emotiv-product-worker.dicky-996.workers.dev/?id=86` | $19.99 |
| 5 | epoc-x-rubber-comfort-pads | `https://emotiv-product-worker.dicky-996.workers.dev/?id=78` | $15.99 |
| 6 | flex-control-box | `https://emotiv-product-worker.dicky-996.workers.dev/?id=72` | $1,899 |
| 7 | flex-cap | `https://emotiv-product-worker.dicky-996.workers.dev/?id=82` | $249 |
| 8 | felt-sensors | `https://emotiv-product-worker.dicky-996.workers.dev/?id=75` | $79.95 |
| 9 | flex-gel-sensors | `https://emotiv-product-worker.dicky-996.workers.dev/?id=3628` | $1,249 |
| 10 | insight-sensor-tips | `https://emotiv-product-worker.dicky-996.workers.dev/?id=81` | $89 |
| 11 | mn8-sensor-pack | `https://emotiv-product-worker.dicky-996.workers.dev/?id=73` | $79 |
| 12 | flex-silicone-skirt-pack | `https://emotiv-product-worker.dicky-996.workers.dev/?id=74` | $79.95 |

## Detail pages (same mapping)

| Page | Fetch URL |
|---|---|
| /flex-saline-sensors | `?id=3628` |
| /epoc-hydrator-pack | `?id=79` |
| /epoc-x-usb-receiver-universal | `?id=71` |
| /insight-charging-cable | `?id=86` |
| /epoc-x-rubber-comfort-pads | `?id=78` |
| /flex-control-box | `?id=72` |
| /flex-cap | `?id=82` |
| /felt-sensors | `?id=75` |
| /flex-gel-sensors | `?id=3628` |
| /insight-sensor-tips | `?id=81` |
| /mn8-sensor-pack | `?id=73` |
| /flex-silicone-skirt-pack | `?id=74` |

## Notes

- flex-saline-sensors + flex-gel-sensors both fetch `?id=3628` (one Woo product, 2 variants, same $1,249 price).
- Worker syncs every 6h (cron) + manual `/sync?secret=...`. Price change in Woo → visible on page within 6h, zero Framer edits.
- Removed product → card shows "Data not available" (200, no error state).
- Slug rename in Woo → card unaffected (id lookup).
