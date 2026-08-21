const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL || "https://unconfigured.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "unconfigured-service-role-key"
);

async function createPreorder({
  customerEmail,
  customerName,
  stripeCustomerId,
  amountCents,
  currency,
  lineItems,
  combinationHash,
  policyVersion,
  acceptanceVersion,
  acceptanceText,
  acceptedAt,
  customerIp,
  userAgent,
}) {
  const { data, error } = await supabase
    .from("preorders")
    .insert({
      customer_email: customerEmail,
      customer_name: customerName,
      stripe_customer_id: stripeCustomerId,
      amount_cents: amountCents,
      currency,
      line_items: lineItems,
      combination_hash: combinationHash,
      policy_version: policyVersion,
      acceptance_version: acceptanceVersion,
      acceptance_text: acceptanceText,
      accepted_at: acceptedAt,
      customer_ip: customerIp,
      user_agent: userAgent,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw new Error(`Supabase createPreorder: ${error.message}`);
  return data;
}

async function updatePreorderPayment(preorderId, { stripeCheckoutSessionId, paymentUrl, expiresAt }) {
  const { data, error } = await supabase
    .from("preorders")
    .update({
      stripe_checkout_session_id: stripeCheckoutSessionId,
      checkout_url: paymentUrl,
      expires_at: expiresAt,
      status: "payment_open",
      updated_at: new Date().toISOString(),
    })
    .eq("id", preorderId)
    .select()
    .single();
  if (error) throw new Error(`Supabase updatePreorderPayment: ${error.message}`);
  return data;
}

async function updatePreorderCustomer(preorderId, stripeCustomerId) {
  const { data, error } = await supabase
    .from("preorders")
    .update({
      stripe_customer_id: stripeCustomerId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", preorderId)
    .select()
    .single();
  if (error) throw new Error(`Supabase updatePreorderCustomer: ${error.message}`);
  return data;
}

async function getPreorder(preorderId) {
  const { data, error } = await supabase.from("preorders").select("*").eq("id", preorderId).maybeSingle();
  if (error) throw new Error(`Supabase getPreorder: ${error.message}`);
  return data;
}

async function getPreorderByInvoiceId(invoiceId) {
  const { data, error } = await supabase
    .from("preorders")
    .select("*")
    .eq("stripe_invoice_id", invoiceId)
    .maybeSingle();
  if (error) throw new Error(`Supabase getPreorderByInvoiceId: ${error.message}`);
  return data;
}

async function getPreorderByCheckoutSessionId(sessionId) {
  const { data, error } = await supabase.from("preorders").select("*").eq("stripe_checkout_session_id", sessionId).maybeSingle();
  if (error) throw new Error(`Supabase getPreorderByCheckoutSessionId: ${error.message}`);
  return data;
}

async function getPreorderByChargeId(chargeId) {
  const { data, error } = await supabase
    .from("preorders")
    .select("*")
    .eq("stripe_charge_id", chargeId)
    .maybeSingle();
  if (error) throw new Error(`Supabase getPreorderByChargeId: ${error.message}`);
  return data;
}

async function getUsedPreorderHashes(amountCents) {
  const { data, error } = await supabase
    .from("preorders")
    .select("combination_hash")
    .eq("amount_cents", amountCents)
    .in("status", ["payment_open", "payment_processing", "paid", "delivery_pending", "completed"]);
  if (error) throw new Error(`Supabase getUsedPreorderHashes: ${error.message}`);
  return (data || []).map((row) => row.combination_hash);
}

async function markPreorderPaid(preorderId, { paymentIntentId, chargeId, invoiceId, invoicePdf, paidAt }) {
  const preorder = await getPreorder(preorderId);
  if (!preorder) throw new Error(`Preorder ${preorderId} not found`);
  if (["delivery_pending", "completed"].includes(preorder.status)) return preorder;

  const { data, error } = await supabase
    .from("preorders")
    .update({
      stripe_payment_intent_id: paymentIntentId || null,
      stripe_charge_id: chargeId || null,
      stripe_invoice_id: invoiceId || null,
      invoice_pdf: invoicePdf || null,
      paid_at: paidAt || new Date().toISOString(),
      status: "delivery_pending",
      updated_at: new Date().toISOString(),
    })
    .eq("id", preorderId)
    .select()
    .single();
  if (error) throw new Error(`Supabase markPreorderPaid: ${error.message}`);
  return data;
}

async function updatePreorderStatus(preorderId, status, fields = {}) {
  const { data, error } = await supabase
    .from("preorders")
    .update({ ...fields, status, updated_at: new Date().toISOString() })
    .eq("id", preorderId)
    .select()
    .single();
  if (error) throw new Error(`Supabase updatePreorderStatus: ${error.message}`);
  return data;
}

async function listPreorders(limit = 100) {
  const { data, error } = await supabase
    .from("preorders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 200));
  if (error) throw new Error(`Supabase listPreorders: ${error.message}`);
  return data || [];
}

async function listExpiredPaymentPreorders(nowIso = new Date().toISOString(), limit = 100) {
  const { data, error } = await supabase
    .from("preorders")
    .select("*")
    .in("status", ["payment_open", "payment_failed"])
    .lte("expires_at", nowIso)
    .limit(Math.min(Math.max(limit, 1), 200));
  if (error) throw new Error(`Supabase listExpiredPaymentPreorders: ${error.message}`);
  return data || [];
}

async function markDelivered(preorderId, { method, evidenceReference, note, deliveredBy }) {
  const preorder = await getPreorder(preorderId);
  if (!preorder) throw new Error(`Preorder ${preorderId} not found`);
  if (preorder.status === "completed") return preorder;
  if (preorder.status !== "delivery_pending") {
    const error = new Error("Only paid orders awaiting delivery can be completed");
    error.code = "INVALID_ORDER_STATE";
    throw error;
  }
  const deliveredAt = new Date().toISOString();
  const { error: evidenceError } = await supabase.from("order_evidence").insert({
    preorder_id: preorderId,
    evidence_type: "manual_delivery",
    delivery_method: method,
    evidence_reference: evidenceReference,
    note: note || null,
    recorded_by: deliveredBy,
    occurred_at: deliveredAt,
  });
  if (evidenceError) throw new Error(`Supabase markDelivered evidence: ${evidenceError.message}`);
  return updatePreorderStatus(preorderId, "completed", { delivered_at: deliveredAt });
}

async function recordWebhookEvent(event) {
  const { error } = await supabase.from("webhook_events").insert({
    stripe_event_id: event.id,
    event_type: event.type,
    livemode: !!event.livemode,
  });
  if (error) {
    if (error.code === "23505") return false;
    throw new Error(`Supabase recordWebhookEvent: ${error.message}`);
  }
  return true;
}

async function releaseWebhookEvent(eventId) {
  const { error } = await supabase.from("webhook_events").delete().eq("stripe_event_id", eventId);
  if (error) console.error(`[releaseWebhookEvent] ${error.message}`);
}

async function upsertPaymentLinkOrder(session, fields = {}) {
  const paymentLinkId = typeof session.payment_link === "string" ? session.payment_link : session.payment_link?.id;
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  const customName = session.custom_fields?.find((field) => field.key === "customer_name")?.text?.value;
  const { data: existing, error: lookupError } = await supabase
    .from("preorders")
    .select("id")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (lookupError) throw new Error(`Supabase upsertPaymentLinkOrder lookup: ${lookupError.message}`);

  const payload = {
    customer_email: session.customer_details?.email || session.customer_email || "unknown@stripe-payment-link.invalid",
    customer_name: session.customer_details?.name || customName || "Stripe Payment Link customer",
    stripe_checkout_session_id: session.id,
    stripe_payment_intent_id: paymentIntentId,
    stripe_customer_id: customerId || null,
    amount_cents: session.amount_total,
    currency: session.currency,
    line_items: fields.line_items || [],
    combination_hash: fields.combination_hash || `pending:${session.id}`,
    policy_version: "payment-link-postpay-v1",
    acceptance_version: "stripe-payment-link-terms-v1",
    acceptance_text: `Terms accepted in approved Stripe Payment Link ${paymentLinkId}`,
    accepted_at: new Date((session.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    status: fields.status || "paid",
    stripe_invoice_id: fields.stripe_invoice_id || null,
    failure_reason: fields.failure_reason || null,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const query = existing
    ? supabase.from("preorders").update(payload).eq("id", existing.id)
    : supabase.from("preorders").insert(payload);
  const { data, error } = await query.select().single();
  if (error) throw new Error(`Supabase upsertPaymentLinkOrder: ${error.message}`);
  return data;
}

async function upsertDispute(dispute) {
  const chargeId = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;
  let preorderId = dispute.metadata?.preorder_id || null;
  if (!preorderId && chargeId) {
    const { data } = await supabase
      .from("preorders")
      .select("id")
      .eq("stripe_charge_id", chargeId)
      .maybeSingle();
    preorderId = data?.id || null;
  }
  const { error } = await supabase.from("disputes").upsert({
    stripe_dispute_id: dispute.id,
    preorder_id: preorderId,
    stripe_charge_id: chargeId || null,
    amount_cents: dispute.amount,
    currency: dispute.currency,
    reason: dispute.reason,
    status: dispute.status,
    evidence_due_by: dispute.evidence_details?.due_by
      ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "stripe_dispute_id" });
  if (error) throw new Error(`Supabase upsertDispute: ${error.message}`);
}

module.exports = {
  supabase,
  createPreorder,
  updatePreorderCustomer,
  updatePreorderPayment,
  getPreorder,
  getPreorderByInvoiceId,
  getPreorderByCheckoutSessionId,
  getPreorderByChargeId,
  getUsedPreorderHashes,
  markPreorderPaid,
  updatePreorderStatus,
  listPreorders,
  listExpiredPaymentPreorders,
  markDelivered,
  recordWebhookEvent,
  releaseWebhookEvent,
  upsertPaymentLinkOrder,
  upsertDispute,
};
