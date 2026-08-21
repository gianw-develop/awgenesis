export function GET() {
  const configuration = {
    stripe: Boolean(process.env.STRIPE_SECRET_KEY),
    webhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
    paymentLink: Boolean(process.env.STRIPE_PAYMENT_LINK_IDS),
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
  const ready = Object.values(configuration).every(Boolean);
  return Response.json(
    { status: ready ? "ok" : "degraded", version: "payment-link-postpay-v1", configuration },
    { status: ready ? 200 : 503 }
  );
}
