export default function PaymentSuccess() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Payment received</p>
        <h1>Thank you for your payment.</h1>
        <p className="subcopy">Stripe will email your receipt. Your detailed service invoice is prepared automatically after the payment is confirmed.</p>
        <div className="ctaRow"><a className="button primary" href="/">Return to AWGenesis</a></div>
      </section>
    </main>
  );
}
