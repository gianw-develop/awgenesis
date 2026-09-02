const test = require("node:test");
const assert = require("node:assert/strict");
const { validatePostPaymentAmount, fulfillPaidPaymentLinkSession } = require("../src/postPaymentFulfillment");

const ladder = [...Array.from({ length: 30 }, (_, index) => index + 6), 43, 44, 45, 46, 47, 48, 49]
  .map((price) => ({ name: `Service ${price}`, price, stripePriceId: `price_${price}` }));

test("approved 37-service ladder represents every whole USD amount from $6-$200", async () => {
  const { chooseExactCombination } = require("../src/preorderAlgorithm");
  for (let dollars = 6; dollars <= 200; dollars += 1) {
    const result = chooseExactCombination(dollars * 100, [], 5, ladder);
    assert.ok(result, `$${dollars} must be representable`);
    assert.equal(result.items.reduce((sum, item) => sum + item.unitAmountCents, 0), dollars * 100);
    assert.equal(new Set(result.items.map((item) => item.stripePriceId)).size, result.items.length);
  }
});

test("post-payment amount gate rejects cents and out-of-range totals", () => {
  assert.equal(validatePostPaymentAmount(600), true);
  assert.equal(validatePostPaymentAmount(20000), true);
  assert.equal(validatePostPaymentAmount(599), false);
  assert.equal(validatePostPaymentAmount(601), false);
  assert.equal(validatePostPaymentAmount(20100), false);
});

test("paid approved Payment Link creates itemized invoice and attaches original payment once", async () => {
  const calls = [];
  const stripe = {
    invoices: {
      create: async (payload, opts) => (calls.push(["invoice", payload, opts]), { id: "in_1" }),
      finalizeInvoice: async (id, payload, opts) => (calls.push(["finalize", id, payload, opts]), { id }),
      attachPayment: async (id, payload, opts) => (calls.push(["attach", id, payload, opts]), {}),
      retrieve: async () => ({ id: "in_1", status: "paid", amount_remaining: 0, invoice_pdf: "https://invoice.test/pdf" }),
    },
    invoiceItems: { create: async (payload, opts) => (calls.push(["item", payload, opts]), {}) },
    refunds: { create: async () => { throw new Error("must not refund"); } },
  };
  const persisted = [];
  const result = await fulfillPaidPaymentLinkSession({ id: "cs_1", payment_link: "plink_1", payment_status: "paid", currency: "usd", amount_total: 8000, customer: "cus_1", payment_intent: "pi_1" }, stripe, { allowedPaymentLinkIds: ["plink_1"], products: ladder, persist: async (_session, fields) => persisted.push(fields) });
  assert.equal(result.status, "delivery_pending");
  assert.equal(calls.filter(([type]) => type === "attach").length, 1);
  assert.deepEqual(calls.find(([type]) => type === "attach")[2], { payment_intent: "pi_1" });
  assert.equal(calls.filter(([type]) => type === "item").length, result.selected.items.length);
  const firstItemPayload = calls.find(([type]) => type === "item")[1];
  assert.match(firstItemPayload.pricing.price, /^price_/);
  assert.equal("price" in firstItemPayload, false);
  assert.deepEqual(persisted.map((entry) => entry.status), ["allocating", "delivery_pending"]);
});

test("invalid cents are refunded idempotently and never invoiced", async () => {
  let invoiceCalls = 0;
  const stripe = {
    invoices: { create: async () => { invoiceCalls += 1; } },
    refunds: { create: async (_payload, options) => ({ id: "re_1", key: options.idempotencyKey }) },
  };
  const persisted = [];
  const result = await fulfillPaidPaymentLinkSession({ id: "cs_bad", payment_link: "plink_1", payment_status: "paid", currency: "usd", amount_total: 8055, payment_intent: "pi_bad" }, stripe, { allowedPaymentLinkIds: ["plink_1"], products: ladder, persist: async (_session, fields) => persisted.push(fields) });
  assert.equal(result.status, "refunded_invalid_amount");
  assert.equal(invoiceCalls, 0);
  assert.equal(persisted[0].status, "refunded_invalid_amount");
});

test("unapproved Payment Links are rejected", async () => {
  await assert.rejects(() => fulfillPaidPaymentLinkSession({ id: "cs_x", payment_link: "plink_other", payment_status: "paid", currency: "usd", amount_total: 8000 }, {}, { allowedPaymentLinkIds: ["plink_1"], products: ladder, persist: async () => {} }), /approved permanent Payment Link/);
});
