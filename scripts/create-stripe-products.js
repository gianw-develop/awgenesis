#!/usr/bin/env node
/**
 * Bulk-create the FIXED_PRODUCTS from src/catalog.js as Stripe Products + Prices.
 *
 * Usage:
 *   node scripts/create-stripe-products.js            # create in the account tied to STRIPE_SECRET_KEY
 *   node scripts/create-stripe-products.js --dry-run  # print what would be created, no API calls
 *   node scripts/create-stripe-products.js --write    # also rewrite src/catalog.js with the new price IDs
 *
 * The script is idempotent: if a product with the same `metadata.catalog_name`
 * already exists, it reuses it instead of creating a duplicate. Same for the
 * Price (matched by unit_amount + currency on that product).
 *
 * Requires: STRIPE_SECRET_KEY in .env (live or test — it uses whatever is set).
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Stripe = require("stripe");
const { FIXED_PRODUCTS } = require("../src/catalog");

const DRY_RUN = process.argv.includes("--dry-run");
const WRITE   = process.argv.includes("--write");

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("ERROR: STRIPE_SECRET_KEY is not set (.env).");
  process.exit(1);
}
if (process.env.STRIPE_SECRET_KEY.startsWith("sk_live_") && process.env.ALLOW_LIVE_PRODUCT_CREATION !== "true") {
  console.error("ERROR: Live product creation is blocked. Use Test Mode or explicitly set ALLOW_LIVE_PRODUCT_CREATION=true after final approval.");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: process.env.STRIPE_API_VERSION || "2026-07-29.dahlia",
});

const PRICE_IDS_PATH = path.join(__dirname, "..", "src", "catalogPriceIds.json");

// Tax code hints: digital goods vs services.
// These are safe defaults for consulting/digital templates in the US.
// See https://stripe.com/docs/tax/tax-codes for the full list.
const TAX_CODE_DIGITAL = "txcd_10000000"; // Digital goods — general
const TAX_CODE_SERVICE = "txcd_20030000"; // Consulting services
const CATALOG_VERSION = "payment-link-postpay-37-v1";

function productMetadata(item) {
  return {
    catalog_name: item.name,
    catalog_kind: item.kind,
    source: "stripe-checkout-v2-kit",
    system_model: "checkout-v2",
    model_version: "2",
    catalog_version: CATALOG_VERSION,
  };
}

function describe(product) {
  return product.description;
}

function validateApprovedCatalog(items) {
  const errors = [];
  if (items.length !== 37) errors.push(`expected 37 entries, found ${items.length}`);
  for (const [index, item] of items.entries()) {
    const label = `entry ${index + 1}`;
    if (!item.name || /^SERVICE_/i.test(item.name)) errors.push(`${label}: replace the placeholder name`);
    if (!String(item.description || "").trim()) errors.push(`${label}: description is required`);
    if (!String(item.deliverable || "").trim()) errors.push(`${label}: deliverable is required`);
    if (!String(item.deliveryMethod || "").trim()) errors.push(`${label}: delivery method is required`);
    if (!String(item.deliveryTimeframe || "").trim()) errors.push(`${label}: delivery timeframe is required`);
    if (!String(item.evidenceType || "").trim()) errors.push(`${label}: evidence type is required`);
    if (!String(item.refundTreatment || "").trim()) errors.push(`${label}: refund treatment is required`);
    if (!String(item.websiteSection || "").trim()) errors.push(`${label}: website disclosure section is required`);
  }
  if (new Set(items.map((item) => item.name)).size !== items.length) errors.push("service names must be unique");
  const expectedPrices = [...Array.from({ length: 30 }, (_, index) => index + 6), 43, 44, 45, 46, 47, 48, 49];
  const actualPrices = items.map((item) => item.price).sort((a, b) => a - b);
  if (JSON.stringify(actualPrices) !== JSON.stringify(expectedPrices)) {
    errors.push("prices must match the approved 37-service post-payment ladder ($6-$35 and $43-$49)");
  }
  if (errors.length) throw new Error(`Catalog approval validation failed:\n- ${errors.join("\n- ")}`);
}

async function findExistingProduct(catalogName) {
  // Reuse only resources already owned by this exact v2 catalog. A legacy
  // product with the same name must remain legacy and be swept later.
  // Uses the Search API (requires "products.search" — available on all live accounts).
  try {
    const res = await stripe.products.search({
      query: `metadata["catalog_name"]:"${catalogName.replace(/"/g, '\\"')}" AND metadata["system_model"]:"checkout-v2" AND metadata["catalog_version"]:"${CATALOG_VERSION}"`,
      limit: 1,
    });
    return res.data[0] || null;
  } catch (err) {
    // Fallback: list + match by name (less reliable but works on any account).
    const list = await stripe.products.list({ limit: 100, active: true });
    return list.data.find((p) =>
      p.metadata?.catalog_name === catalogName &&
      p.metadata?.system_model === "checkout-v2" &&
      p.metadata?.catalog_version === CATALOG_VERSION
    ) || null;
  }
}

async function findExistingPrice(productId, unitAmount) {
  const prices = await stripe.prices.list({ product: productId, limit: 100, active: true });
  return prices.data.find(
    (p) => p.unit_amount === unitAmount &&
      p.currency === "usd" &&
      p.type === "one_time" &&
      p.metadata?.system_model === "checkout-v2" &&
      p.metadata?.catalog_version === CATALOG_VERSION
  ) || null;
}

async function ensureProductAndPrice(item) {
  const unitAmount = Math.round(item.price * 100);
  const taxCode    = item.kind === "digital" ? TAX_CODE_DIGITAL : TAX_CODE_SERVICE;

  if (DRY_RUN) {
    return { priceId: "price_DRYRUN_" + item.price, created: false, reused: false };
  }

  // 1) Product
  let product = await findExistingProduct(item.name);
  let productCreated = false;
  if (!product) {
    product = await stripe.products.create({
      name: item.name,
      description: describe(item),
      tax_code: taxCode,
      metadata: productMetadata(item),
    });
    productCreated = true;
  } else if (product.metadata?.catalog_version !== CATALOG_VERSION || product.metadata?.system_model !== "checkout-v2") {
    product = await stripe.products.update(product.id, {
      description: describe(item),
      tax_code: taxCode,
      metadata: productMetadata(item),
    });
  }

  // 2) Price
  let price = await findExistingPrice(product.id, unitAmount);
  let priceCreated = false;
  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      unit_amount: unitAmount,
      currency: "usd",
      // one_time is the default when no recurring is specified.
      metadata: {
        catalog_name: item.name,
        system_model: "checkout-v2",
        model_version: "2",
        catalog_version: CATALOG_VERSION,
      },
    });
    priceCreated = true;
  } else if (price.metadata?.catalog_version !== CATALOG_VERSION || price.metadata?.system_model !== "checkout-v2") {
    price = await stripe.prices.update(price.id, {
      metadata: {
        catalog_name: item.name,
        system_model: "checkout-v2",
        model_version: "2",
        catalog_version: CATALOG_VERSION,
      },
    });
  }

  return {
    priceId: price.id,
    productId: product.id,
    created: productCreated || priceCreated,
    reused: !productCreated && !priceCreated,
  };
}

function rewriteCatalog(results) {
  const ids = Object.fromEntries(results
    .filter(({ item, priceId }) => item.key && priceId?.startsWith("price_"))
    .map(({ item, priceId }) => [item.key, priceId]));
  fs.writeFileSync(PRICE_IDS_PATH, `${JSON.stringify(ids, null, 2)}\n`, "utf8");
  console.log(`\n[write] Updated ${PRICE_IDS_PATH}`);
}

(async () => {
  validateApprovedCatalog(FIXED_PRODUCTS);
  console.log(
    `\nBulk Stripe product creation — ${FIXED_PRODUCTS.length} items${DRY_RUN ? " (DRY RUN)" : ""}\n`
  );

  const results = [];
  for (const item of FIXED_PRODUCTS) {
    try {
      const r = await ensureProductAndPrice(item);
      const tag = r.reused ? "reused " : r.created ? "created" : "        ";
      console.log(
        `  [${tag}] $${String(item.price).padStart(4)}  ${r.priceId}  ${item.name}`
      );
      results.push({ item, ...r });
    } catch (err) {
      console.error(`  [FAIL  ] ${item.name}: ${err.message}`);
      results.push({ item, priceId: null });
    }
  }

  if (WRITE && !DRY_RUN) {
    rewriteCatalog(results);
  } else {
    console.log(
      "\nCopy these into src/catalog.js (or re-run with --write to auto-patch):\n"
    );
    for (const { item, priceId } of results) {
      console.log(`  ${item.name}  →  ${priceId}`);
    }
  }

  console.log("\nDone.\n");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
