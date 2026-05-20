export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders()
      })
    }

    const url = new URL(request.url)
    const slug = (url.searchParams.get("slug") || "").trim()

    if (slug) {
      return handleSingleProduct(slug)
    }

    return handleAllProducts()
  }
}

async function handleSingleProduct(slug) {
  const wooUrl =
    "https://shop.emotiv.com/wp-json/wc/store/v1/products?slug=" +
    encodeURIComponent(slug)

  const res = await fetch(wooUrl)
  const data = await res.json()
  const product = data && data[0]

  if (!product) {
    return json({ error: "product not found", slug: slug }, 404)
  }

  return json(formatProduct(product))
}

async function handleAllProducts() {
  const wooUrl =
    "https://shop.emotiv.com/wp-json/wc/store/v1/products?per_page=40&page=1"

  const res = await fetch(wooUrl)
  const data = await res.json()

  return json({
    count: Array.isArray(data) ? data.length : 0,
    products: Array.isArray(data) ? data.map(formatProduct) : []
  })
}

function formatProduct(product) {
  const prices = product.prices || {}
  const raw = Number(prices.price || 0)
  const minor = Number(prices.currency_minor_unit || 2)
  const value = raw / Math.pow(10, minor)

  const priceText =
    (prices.currency_prefix || "") +
    value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type"
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
