#!/usr/bin/env node
require("dotenv").config();
const Stripe = require("stripe");

if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is required");
if (!process.env.PUBLIC_BASE_URL) throw new Error("PUBLIC_BASE_URL is required");
if (process.env.STRIPE_SECRET_KEY.startsWith("sk_live_") && process.env.ALLOW_LIVE_PAYMENT_LINK_CREATION !== "true") {
  throw new Error("Live Payment Link creation requires final approval and ALLOW_LIVE_PAYMENT_LINK_CREATION=true");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: process.env.STRIPE_API_VERSION || "2026-07-29.dahlia" });
const count = Math.min(Math.max(Number(process.env.PAYMENT_LINK_COUNT || 1), 1), 2);

async function createLink(index) {
  const role = count === 1 ? "primary" : `payment-context-${index + 1}`;
  const product = await stripe.products.create({
    name: process.env.PAYMENT_LINK_PRODUCT_NAME || "Professional services payment",
    description: "Payment for an agreed professional service scope.",
    metadata: { system_model: "payment-link-postpay-v1", link_role: role },
  }, { idempotencyKey: `postpay-link-product-${role}` });
  const price = await stripe.prices.create({
    product: product.id,
    currency: "usd",
    custom_unit_amount: { enabled: true, minimum: 600, maximum: 20000 },
    metadata: { system_model: "payment-link-postpay-v1", link_role: role },
  }, { idempotencyKey: `postpay-link-price-${role}` });
  return stripe.paymentLinks.create({
    line_items: [{ price: price.id, quantity: 1 }],
    customer_creation: "always",
    managed_payments: { enabled: false },
    payment_method_types: ["cashapp"],
    invoice_creation: { enabled: false },
    after_completion: { type: "redirect", redirect: { url: `${process.env.PUBLIC_BASE_URL.replace(/\/$/, "")}/pay/success?session_id={CHECKOUT_SESSION_ID}` } },
    metadata: { system_model: "payment-link-postpay-v1", link_role: role, whole_usd_only: "true" },
  }, { idempotencyKey: `postpay-payment-link-${role}-managed-payments-off` });
}

(async () => {
  const links = [];
  for (let index = 0; index < count; index += 1) links.push(await createLink(index));
  console.log(JSON.stringify(links.map(({ id, url }) => ({ id, url })), null, 2));
})().catch((error) => { console.error(error.message); process.exit(1); });
