const test = require("node:test");
const assert = require("node:assert/strict");
process.env.STRIPE_SECRET_KEY ||= "sk_test_placeholder";
process.env.SUPABASE_URL ||= "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY ||= "placeholder";
const { fulfillPaidPaymentLinkSession, validatePostPaymentAmount } = require("../src/postPaymentFulfillment");

test("new five-dollar tariff invoices the existing basic service without refunding", async () => {
  const lines = [];
  const attachments = [];
  const stripe = {
    refunds: { create: async () => { throw new Error("Unexpected refund"); } },
    invoices: {
      create: async () => ({ id: "in_mock" }),
      finalizeInvoice: async () => ({ id: "in_mock" }),
      attachPayment: async (...args) => attachments.push(args),
      retrieve: async () => ({ id: "in_mock", status: "paid", amount_remaining: 0 }),
    },
    invoiceItems: { create: async (line) => { lines.push(line); return { id: "ii_mock" }; } },
  };
  const result = await fulfillPaidPaymentLinkSession({
    id: "cs_mock", payment_link: "plink_mock", payment_status: "paid",
    currency: "usd", amount_total: 500, customer: "cus_mock", payment_intent: "pi_mock",
  }, stripe, { allowedPaymentLinkIds: ["plink_mock"], persist: async () => {} });
  assert.equal(result.selected.items.reduce((sum, i) => sum + i.unitAmountCents * i.quantity, 0), 500);
  assert.equal(lines.length, 1);
  assert.equal(attachments[0][1].payment_intent, "pi_mock");
  assert.equal(result.status, "delivery_pending");
  assert.equal(validatePostPaymentAmount(499), false);
  assert.equal(validatePostPaymentAmount(500), true);
  assert.equal(validatePostPaymentAmount(20000), true);
  assert.equal(validatePostPaymentAmount(20001), false);
});
