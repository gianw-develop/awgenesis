const { chooseExactCombination } = require("./preorderAlgorithm");
const { FIXED_PRODUCTS } = require("./catalog");
const { upsertPaymentLinkOrder } = require("./supabaseService");

const MIN_AMOUNT_CENTS = 600;
const MAX_AMOUNT_CENTS = 20000;
const SYSTEM_MODEL = "payment-link-postpay-v1";

function assertEligiblePaymentLinkSession(session, allowedPaymentLinkIds = []) {
  const paymentLinkId = typeof session.payment_link === "string" ? session.payment_link : session.payment_link?.id;
  if (!paymentLinkId || !allowedPaymentLinkIds.includes(paymentLinkId)) {
    const error = new Error("Checkout Session does not belong to an approved permanent Payment Link");
    error.code = "UNAPPROVED_PAYMENT_LINK";
    throw error;
  }
  if (session.payment_status !== "paid") return false;
  if (session.currency !== "usd") throw new Error("Only USD Payment Link sessions are supported");
  return true;
}

function validatePostPaymentAmount(amountCents) {
  return Number.isInteger(amountCents) &&
    amountCents >= MIN_AMOUNT_CENTS &&
    amountCents <= MAX_AMOUNT_CENTS &&
    amountCents % 100 === 0;
}

async function refundInvalidAmount(session, stripe) {
  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!paymentIntent) throw new Error("Paid Payment Link session is missing its PaymentIntent");
  return stripe.refunds.create(
    { payment_intent: paymentIntent, reason: "requested_by_customer", metadata: { system_model: SYSTEM_MODEL, invalid_amount: String(session.amount_total) } },
    { idempotencyKey: `postpay-invalid-refund-${session.id}` }
  );
}

async function createAndAttachDetailedInvoice({ session, selected, stripe }) {
  const customer = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const paymentIntent = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  if (!customer || !paymentIntent) throw new Error("Paid session requires Customer and PaymentIntent");

  const metadata = {
    system_model: SYSTEM_MODEL,
    checkout_session_id: session.id,
    payment_intent_id: paymentIntent,
    combination_hash: selected.hash,
  };
  const invoice = await stripe.invoices.create({
    customer,
    collection_method: "charge_automatically",
    auto_advance: false,
    metadata,
  }, { idempotencyKey: `postpay-invoice-${session.id}` });

  for (const item of selected.items) {
    await stripe.invoiceItems.create({
      customer,
      invoice: invoice.id,
      pricing: { price: item.stripePriceId },
      quantity: 1,
      metadata,
    }, { idempotencyKey: `postpay-item-${session.id}-${item.stripePriceId}` });
  }

  const finalized = await stripe.invoices.finalizeInvoice(invoice.id, {}, { idempotencyKey: `postpay-finalize-${session.id}` });
  await stripe.invoices.attachPayment(finalized.id, { payment_intent: paymentIntent }, { idempotencyKey: `postpay-attach-${session.id}` });
  const paidInvoice = await stripe.invoices.retrieve(finalized.id);
  if (paidInvoice.status !== "paid" || paidInvoice.amount_remaining !== 0) {
    throw new Error(`Detailed Invoice ${paidInvoice.id} was not fully credited by the original payment`);
  }
  return paidInvoice;
}

async function fulfillPaidPaymentLinkSession(session, stripe, options = {}) {
  const persist = options.persist || upsertPaymentLinkOrder;
  const allowedPaymentLinkIds = options.allowedPaymentLinkIds || [];
  if (!assertEligiblePaymentLinkSession(session, allowedPaymentLinkIds)) return { ignored: true };
  if (!validatePostPaymentAmount(session.amount_total)) {
    const refund = await refundInvalidAmount(session, stripe);
    await persist(session, { status: "refunded_invalid_amount", failure_reason: "Amount must be a whole USD value from 6 through 200" });
    return { status: "refunded_invalid_amount", refundId: refund.id };
  }
  const selected = chooseExactCombination(session.amount_total, options.usedHashes || [], 5, options.products || FIXED_PRODUCTS);
  if (!selected) throw new Error(`Approved catalog cannot represent ${session.amount_total} cents`);
  await persist(session, { status: "allocating", line_items: selected.items, combination_hash: selected.hash });
  const invoice = await createAndAttachDetailedInvoice({ session, selected, stripe });
  await persist(session, { status: "delivery_pending", line_items: selected.items, combination_hash: selected.hash, stripe_invoice_id: invoice.id });
  return { status: "delivery_pending", invoice, selected };
}

module.exports = {
  MIN_AMOUNT_CENTS,
  MAX_AMOUNT_CENTS,
  SYSTEM_MODEL,
  assertEligiblePaymentLinkSession,
  validatePostPaymentAmount,
  refundInvalidAmount,
  createAndAttachDetailedInvoice,
  fulfillPaidPaymentLinkSession,
};
