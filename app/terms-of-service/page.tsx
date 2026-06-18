export default function TermsOfServicePage() {
  return (
    <div className="page">
      <header className="legalNav">
        <a className="brandLogo" href="/">
          <img src="/logo-transparent.png" alt="AWGenesis" width="180" height="30" />
        </a>
        <nav className="legalNavLinks">
          <a href="/">Home</a>
          <a href="/privacy-policy">Privacy</a>
          <a href="/refund-policy">Refunds</a>
        </nav>
      </header>

      <main className="legalPage">
        <h1>Terms of Service</h1>
        <p><strong>Effective date:</strong> June 18, 2026</p>

        <h2>1. Overview</h2>
        <p>
          These Terms of Service govern your use of the AWGenesis website and any fixed-price service or digital product
          you purchase from us. By placing an order, you confirm that you have read, understood, and agree to these terms,
          our Privacy Policy, and our Refund Policy.
        </p>

        <h2>2. Services and Products</h2>
        <p>
          AWGenesis provides fixed-price website and brand setup services for small businesses. Services are divided into:
        </p>
        <ul>
          <li><strong>1-on-1 services:</strong> We work directly with you to deliver a configured website or brand asset.</li>
          <li><strong>Digital files:</strong> Custom files delivered after purchase, such as favicons or business card designs.</li>
          <li><strong>Digital downloads:</strong> Pre-built kits or guides available for immediate download after purchase.</li>
        </ul>

        <h2>3. Orders and Payment</h2>
        <p>
          All prices are listed in US dollars and must be paid before work begins. By completing checkout, you confirm that
          you are authorized to use the payment method provided and that all information submitted is accurate.
        </p>

        <h2>4. Scope and Revisions</h2>
        <p>
          Each service has a fixed scope as described on its product page. Custom work, additional revisions, or work
          outside the described scope are not included unless agreed in writing.
        </p>

        <h2>5. Delivery</h2>
        <p>
          Delivery timelines are estimates and depend on the service type and how quickly you provide required information.
          Most 1-on-1 services are delivered within 3–7 business days after receiving your details.
        </p>

        <h2>6. Intellectual Property</h2>
        <p>
          Upon full payment, you receive the right to use the delivered files or service output for your business. We
          retain the right to use general methods, techniques, and know-how developed during delivery.
        </p>

        <h2>7. Refunds</h2>
        <p>
          Refunds are handled according to our Refund Policy. Please review it before purchasing.
        </p>

        <h2>8. Contact</h2>
        <p>
          For questions about these terms, contact us at <a href="mailto:info@awgenesis.com">info@awgenesis.com</a> or by phone at
          <a href="tel:+12014092403">+1 (201) 409-2403</a>.
        </p>
      </main>
    </div>
  );
}
