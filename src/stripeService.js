const Stripe = require("stripe");

// Allow a freshly cloned template to load, run tests and execute preflight
// before credentials exist. Runtime requests remain blocked by preflight and
// Stripe rejects the non-secret placeholder if a caller bypasses configuration.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_unconfigured", {
  apiVersion: process.env.STRIPE_API_VERSION || "2026-07-29.dahlia",
});

/**
 * Find or create a Stripe Customer by email.
 */
async function findOrCreateStripeCustomer({ email, name, phone }) {
  const existing = await stripe.customers.list({ email, limit: 1 });

  if (existing.data.length > 0) {
    return existing.data[0];
  }

  return stripe.customers.create({
    email,
    name: name || undefined,
    phone: phone || undefined,
  });
}

module.exports = { stripe, findOrCreateStripeCustomer };
