const PRODUCTS_ALL_KEY = "products:all"
const PRODUCTS_UPDATED_AT_KEY = "products:updated_at"
const WOO_PRODUCTS_URL =
  "https://shop.emotiv.com/wp-json/wc/store/v1/products?per_page=40&page=1"

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      })
    }

    if (request.method !== "GET") {
      return json({ error: "method not allowed" }, 405)
    }

    const url = new URL(request.url)
    const slug = (url.searchParams.get("slug") || "").trim()

    if (url.pathname === "/sync") {
      return handleManualSync(url, env)
    }

    if (slug) {
      return handleSingleProduct(env, slug)
    }

    return handleAllProducts(env)
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(syncProducts(env))
  }
}

async function handleManualSync(url, env) {
  if (!env.SYNC_SECRET) {
    return json({ error: "sync secret is not configured" }, 500)
  }

  const secret = (url.searchParams.get("secret") || "").trim()

  if (!secret || secret !== env.SYNC_SECRET) {
    return json({ error: "unauthorized" }, 401)
  }

  const result = await syncProducts(env)

  return json({
    ok: true,
    message: "products synced",
    ...result
  })
}

async function handleSingleProduct(env, slug) {
  const product = await env.PRODUCTS_KV.get(productKey(slug), "json")
  const lastUpdated = await env.PRODUCTS_KV.get(PRODUCTS_UPDATED_AT_KEY)

  if (!product) {
    return json({ error: "product not found", slug: slug, lastUpdated }, 404)
  }

  return json({ ...product, lastUpdated })
}

async function handleAllProducts(env) {
  const products = await env.PRODUCTS_KV.get(PRODUCTS_ALL_KEY, "json")
  const lastUpdated = await env.PRODUCTS_KV.get(PRODUCTS_UPDATED_AT_KEY)

  return json({
    count: Array.isArray(products) ? products.length : 0,
    lastUpdated,
    products: Array.isArray(products) ? products : []
  })
}

async function syncProducts(env) {
  const res = await fetch(WOO_PRODUCTS_URL, {
    headers: {
      accept: "application/json"
    }
  })

  if (!res.ok) {
    throw new Error(`WooCommerce request failed: ${res.status}`)
  }

  const data = await res.json()
  const products = Array.isArray(data) ? data.map(formatProduct) : []
  const lastUpdated = new Date().toISOString()

  await env.PRODUCTS_KV.put(PRODUCTS_ALL_KEY, JSON.stringify(products))
  await env.PRODUCTS_KV.put(PRODUCTS_UPDATED_AT_KEY, lastUpdated)

  await Promise.all(
    products.map((product) =>
      env.PRODUCTS_KV.put(productKey(product.slug), JSON.stringify(product))
    )
  )

  return {
    count: products.length,
    lastUpdated
  }
}

function productKey(slug) {
  return `product:${slug}`
}

function formatProduct(product) {
  const prices = product.prices || {}
  const raw = Number(prices.price || 0)
  const minor = Number(prices.currency_minor_unit || 2)
  const value = raw / Math.pow(10, minor)

  const priceText =
    (prices.currency_prefix || "") +
    value.toLocaleString("en-US", {
      minimumFractionDigits: minor,
      maximumFractionDigits: minor
    }) +
    (prices.currency_suffix || "")

  return {
    name: product.name,
    slug: product.slug,
    price: value,
    priceText: priceText,
    currency: prices.currency_code,
    permalink: product.permalink,
    inStock: product.is_in_stock,
    image: product.images && product.images[0] ? product.images[0].src : null
  }
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: {
      ...corsHeaders(),
      "content-type": "application/json; charset=utf-8"
    }
  })
}

function corsHeaders() {
  return {
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET, OPTIONS",
    "access-control-allow-headers": "Content-Type"
  }
}
