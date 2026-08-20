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
