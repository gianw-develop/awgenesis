const { getPreorderByCheckoutSessionId, getPreorderByChargeId, markPreorderPaid, updatePreorderStatus, upsertDispute } = require("./supabaseService");
const { fulfillPaidPaymentLinkSession } = require("./postPaymentFulfillment");

async function handleCheckoutSessionPaid(session, stripe) {
  if (session.payment_status !== "paid") return null;
  if (session.payment_link) {
    const allowedPaymentLinkIds = String(process.env.STRIPE_PAYMENT_LINK_IDS || "").split(",").map((value) => value.trim()).filter(Boolean);
    return fulfillPaidPaymentLinkSession(session, stripe, { allowedPaymentLinkIds });
  }
  const preorder = await getPreorderByCheckoutSessionId(session.id);
  if (!preorder) throw new Error(`Preorder for Checkout Session ${session.id} not found`);
  if (session.amount_total !== preorder.amount_cents || session.currency !== preorder.currency) throw new Error(`Stripe Checkout Session ${session.id} does not match preorder ${preorder.id}`);
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id || null;
  let chargeId = null;
  if (paymentIntentId) {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
    chargeId = typeof intent.latest_charge === "string" ? intent.latest_charge : intent.latest_charge?.id || null;
  }
  const invoiceId = typeof session.invoice === "string" ? session.invoice : session.invoice?.id || null;
  let invoicePdf = null;
  if (invoiceId) {
    const invoice = typeof session.invoice === "object" ? session.invoice : await stripe.invoices.retrieve(invoiceId);
    if (invoice.status !== "paid") throw new Error(`Stripe Invoice ${invoiceId} is not paid`);
    invoicePdf = invoice.invoice_pdf || null;
  }
  return markPreorderPaid(preorder.id, { paymentIntentId, chargeId, invoiceId, invoicePdf, paidAt: new Date().toISOString() });
}

async function handleCheckoutSessionExpired(session) {
  const preorder = await getPreorderByCheckoutSessionId(session.id);
  if (!preorder || ["delivery_pending", "completed", "refunded"].includes(preorder.status)) return preorder;
  return updatePreorderStatus(preorder.id, "abandoned", { expired_at: new Date().toISOString() });
}

async function handlePaymentIntentProcessing(intent) {
  return intent.metadata?.preorder_id ? updatePreorderStatus(intent.metadata.preorder_id, "payment_processing") : null;
}

async function handleChargeRefunded(charge) {
  const preorderId = charge.metadata?.preorder_id || (await getPreorderByChargeId(charge.id))?.id;
  return preorderId ? updatePreorderStatus(preorderId, "refunded", { refunded_at: new Date().toISOString() }) : null;
}

async function handleDispute(dispute) { await upsertDispute(dispute); return { disputeId: dispute.id, status: dispute.status }; }

module.exports = { handleCheckoutSessionPaid, handleCheckoutSessionExpired, handlePaymentIntentProcessing, handleChargeRefunded, handleDispute };
