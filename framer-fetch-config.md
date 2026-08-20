# Framer Fetch config — emotiv.com/accessories (12 cards + 12 detail pages)

Endpoint: `https://emotiv-product-worker.dicky-996.workers.dev/?slug=<SLUG>`
Path: `displayText`
Fallback (optional): if fetch fails, Framer shows empty — set a fallback text "Data not available" if desired.

Worker always returns a string: `priceText` when product exists, `"Data not available"` when removed/not-yet-synced. No conditional needed.

## Cards (accessories page)

| # | Framer page slug (href) | Fetch URL | Correct price |
|---|---|---|---|
| 1 | flex-saline-sensors | `https://emotiv-product-worker.dicky-996.workers.dev/?slug=emotiv-flex-sensors` | $1,249 |
| 2 | epoc-hydrator-pack | `https://emotiv-product-worker.dicky-996.workers.dev/?slug=epoc-hydrator-pack` | $49.95 |
| 3 | epoc-x-usb-receiver-universal | `https://emotiv-product-worker.dicky-996.workers.dev/?slug=usb-receiver-universal-model` | $59.95 |
| 4 | insight-charging-cable | `https://emotiv-product-worker.dicky-996.workers.dev/?slug=insight-charging-cable` | $19.99 |
| 5 | epoc-x-rubber-comfort-pads | `https://emotiv-product-worker.dicky-996.workers.dev/?slug=epocx-rubber-comfort-pads` | $15.99 |
| 6 | flex-control-box | `https://emotiv-product-worker.dicky-996.workers.dev/?slug=flex-control-box-2-0` | $1,899 |
| 7 | flex-cap | `https://emotiv-product-worker.dicky-996.workers.dev/?slug=flex-cap` | $249 |
| 8 | felt-sensors | `https://emotiv-product-worker.dicky-996.workers.dev/?slug=epoc-felt-sensors` | $79.95 |
| 9 | flex-gel-sensors | `https://emotiv-product-worker.dicky-996.workers.dev/?slug=emotiv-flex-sensors` | $1,249 |
| 10 | insight-sensor-tips | `https://emotiv-product-worker.dicky-996.workers.dev/?slug=insight-sensor-tips` | $89 |
| 11 | mn8-sensor-pack | `https://emotiv-product-worker.dicky-996.workers.dev/?slug=mn8-sensor-pack` | $79 |
| 12 | flex-silicone-skirt-pack | `https://emotiv-product-worker.dicky-996.workers.dev/?slug=flex-silicone-skirt-pack` | $79.95 |

## Detail pages (same mapping)

| Page | Fetch URL |
|---|---|
| /flex-saline-sensors | `?slug=emotiv-flex-sensors` |
| /epoc-hydrator-pack | `?slug=epoc-hydrator-pack` |
| /epoc-x-usb-receiver-universal | `?slug=usb-receiver-universal-model` |
| /insight-charging-cable | `?slug=insight-charging-cable` |
| /epoc-x-rubber-comfort-pads | `?slug=epocx-rubber-comfort-pads` |
| /flex-control-box | `?slug=flex-control-box-2-0` |
| /flex-cap | `?slug=flex-cap` |
| /felt-sensors | `?slug=epoc-felt-sensors` |
| /flex-gel-sensors | `?slug=emotiv-flex-sensors` |
| /insight-sensor-tips | `?slug=insight-sensor-tips` |
| /mn8-sensor-pack | `?slug=mn8-sensor-pack` |
| /flex-silicone-skirt-pack | `?slug=flex-silicone-skirt-pack` |

## Notes
- flex-saline-sensors + flex-gel-sensors both fetch `emotiv-flex-sensors` (one Woo product, 2 variants, same $1,249 price).
- Worker syncs every 6h (cron) + manual `/sync?secret=...`. Price change in Woo → visible on page within 6h, zero Framer edits.
- Removed product → card shows "Data not available" (200, no error state).
