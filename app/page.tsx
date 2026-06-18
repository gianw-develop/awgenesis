const services = [
  { name: "Favicon Setup", price: "$10", category: "Brand Assets", description: "A clean favicon for your website and browser tabs." },
  { name: "Email Signature Setup", price: "$12", category: "Brand Assets", description: "A polished HTML signature for business email." },
  { name: "Brand Color Palette", price: "$15", category: "Brand Assets", description: "A simple color direction for your brand." },
  { name: "Business Card Design", price: "$15", category: "Brand Assets", description: "A minimal, professional business card layout." },
  { name: "Contact Form Setup", price: "$35", category: "Website Setup", description: "A working contact form configured for your site." },
  { name: "Policy Page Setup", price: "$39", category: "Website Setup", description: "Terms, privacy, and refund page formatting support." },
  { name: "Homepage Copy Cleanup", price: "$49", category: "Website Setup", description: "Rewrite and polish your homepage copy." },
  { name: "Simple Landing Page", price: "$79", category: "Website Setup", description: "A focused landing page for one service or offer." },
  { name: "Brand Kit Mini", price: "$99", category: "Brand Kit", description: "Colors, typography, and visual basics." },
  { name: "Starter Website", price: "$149", category: "Website Setup", description: "A clean one-page website for a small business." }
];

const categories = ["Brand Assets", "Website Setup", "Brand Kit"];

const trustItems = [
  "Secure checkout powered by Stripe",
  "Clear pricing before purchase",
  "Business information displayed",
  "SSL encrypted site",
  "Fixed-scope deliverables",
  "Refund policy available"
];

const steps = [
  "Choose a fixed-price service.",
  "Complete secure checkout with Stripe.",
  "Share your business details.",
  "We deliver your order on time."
];

const faqs = [
  {
    q: "What does AWGenesis do?",
    a: "We provide fixed-price website and brand setup services for small businesses, including landing pages, brand assets, and website components."
  },
  {
    q: "How fast is delivery?",
    a: "Most small digital deliverables are completed within a few business days, depending on the service."
  },
  {
    q: "Do you offer custom quotes?",
    a: "No. Every service has a fixed price and a clear scope."
  },
  {
    q: "Is checkout secure?",
    a: "Yes. Payments are processed through Stripe."
  }
];

export default function Home() {
  return (
    <main className="page">
      <header className="topbar">
        <a className="brandLogo" href="#">
          <img src="/logo-transparent.png" alt="AWGenesis" width="240" height="40" />
        </a>
        <nav className="nav">
          <a href="#services">Services</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
          <a href="#faq">FAQ</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <section className="hero">
        <p className="eyebrow">Website & brand setup services</p>
        <h1>Get your small business online with fixed-price website and brand setup.</h1>
        <p className="subcopy">
          AWGenesis builds the basic digital presence your business needs: landing pages, brand assets, contact forms,
          policy pages, and more. Clear pricing, secure Stripe checkout, and fast delivery.
        </p>
        <div className="ctaRow">
          <a className="button primary" href="#services">Browse Services</a>
          <a className="button secondary" href="#contact">Contact Us</a>
        </div>
        <div className="badges">
          {trustItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="section" id="services">
        <div className="sectionHeading">
          <p className="eyebrow">Services</p>
          <h2>Fixed-price website and brand services.</h2>
          <p>Choose a focused service with clear scope and no surprises at checkout.</p>
        </div>

        {categories.map((category) => (
          <div className="categoryBlock" key={category}>
            <h3 className="categoryTitle">{category}</h3>
            <div className="serviceGrid">
              {services
                .filter((service) => service.category === category)
                .map((service) => (
                  <article className="serviceCard" key={service.name}>
                    <div className="serviceHeader">
                      <h3>{service.name}</h3>
                      <span className="price">{service.price}</span>
                    </div>
                    <p>{service.description}</p>
                    <div className="checkboxRow">
                      <input type="checkbox" id={`terms-${service.name}`} />
                      <label htmlFor={`terms-${service.name}`}>
                        I agree to the Terms of Service, Privacy Policy, and Refund Policy.
                      </label>
                    </div>
                    <button className="button primary full" type="button">
                      Pay {service.price} with Stripe
                    </button>
                  </article>
                ))}
            </div>
          </div>
        ))}
      </section>

      <section className="section" id="how-it-works">
        <div className="sectionHeading">
          <p className="eyebrow">How it works</p>
          <h2>Fast, clear, and easy to buy.</h2>
        </div>
        <div className="steps">
          {steps.map((step, index) => (
            <div className="step" key={step}>
              <span className="stepNumber">{String(index + 1).padStart(2, "0")}</span>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section split" id="about">
        <div>
          <p className="eyebrow">About</p>
          <h2>Built for small businesses that need a simple online presence.</h2>
          <p>
            AWGenesis focuses on practical website and brand setup services. We help founders and small business owners
            launch faster with clear deliverables and straightforward pricing.
          </p>
        </div>
        <div className="infoCard">
          <h3>Verified business</h3>
          <ul className="businessList">
            <li>Legal name: AWGenesis LLC</li>
            <li>Business address: 48 Columbia Ave Apt 2B, Kearny, NJ 07032 USA</li>
            <li>Email: info@awgenesis.com</li>
            <li>Services: Website and brand setup</li>
          </ul>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="sectionHeading">
          <p className="eyebrow">FAQ</p>
          <h2>Frequently asked questions.</h2>
        </div>
        <div className="faqGrid">
          {faqs.map((faq) => (
            <article className="faqCard" key={faq.q}>
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section contact" id="contact">
        <div className="sectionHeading">
          <p className="eyebrow">Contact</p>
          <h2>Business details.</h2>
          <p>Verified company information and legal policies.</p>
        </div>
        <div className="contactCard compact">
          <div className="contactLine">
            <span className="contactLabel">Legal name</span>
            <span className="contactValue">AWGenesis LLC</span>
          </div>
          <div className="contactLine">
            <span className="contactLabel">Email</span>
            <span className="contactValue">info@awgenesis.com</span>
          </div>
          <div className="contactLine">
            <span className="contactLabel">Phone</span>
            <span className="contactValue">+1 (000) 000-0000</span>
          </div>
          <div className="contactLine">
            <span className="contactLabel">Address</span>
            <span className="contactValue">48 Columbia Ave Apt 2B, Kearny, NJ 07032 USA</span>
          </div>
          <div className="legalLinks">
            <a href="/terms-of-service">Terms of Service</a>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/refund-policy">Refund Policy</a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© 2026 AWGenesis LLC. All rights reserved.</p>
        <p className="footerLegal">
          <a href="/terms-of-service">Terms</a> · <a href="/privacy-policy">Privacy</a> · <a href="/refund-policy">Refunds</a>
        </p>
      </footer>

      <a className="scrollTop" href="#" aria-label="Back to top">↑</a>
    </main>
  );
}
