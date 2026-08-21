import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { handleCheckoutSessionPaid, handleChargeRefunded, handleDispute } = require("../../../../src/checkoutWebhookHandler");
const { recordWebhookEvent, releaseWebhookEvent } = require("../../../../src/supabaseService");

export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) return new Response("Payment configuration unavailable", { status: 503 });

  const stripe = new Stripe(secretKey, { apiVersion: "2026-07-29.dahlia" as any });
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Missing webhook signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
  } catch {
    return new Response("Invalid webhook signature", { status: 400 });
  }

  let acquired = false;
  try {
    acquired = await recordWebhookEvent(event);
    if (!acquired) return Response.json({ received: true, duplicate: true });

    let result: unknown = { ignored: true };
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      result = await handleCheckoutSessionPaid(event.data.object, stripe);
    } else if (event.type === "charge.refunded") {
      result = await handleChargeRefunded(event.data.object);
    } else if (event.type.startsWith("charge.dispute.")) {
      result = await handleDispute(event.data.object);
    }
    return Response.json({ received: true, event: event.type, result });
  } catch {
    if (acquired) await releaseWebhookEvent(event.id);
    return Response.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
