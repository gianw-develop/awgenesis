const services = [
  {
    name: "Favicon Setup",
    price: "$10",
    amount: 10,
    category: "Brand Assets",
    type: "Digital file",
    description: "A clean favicon delivered as PNG/ICO for your website and browser tabs.",
    url: "https://buy.stripe.com/cNi6oI5AW77qeLC2zabII00"
  },
  {
    name: "Email Signature Setup",
    price: "$12",
    amount: 12,
    category: "Brand Assets",
    type: "1-on-1 + digital file",
    description: "A polished HTML email signature configured and tested for your business email.",
    url: "https://buy.stripe.com/eVq9AUbZkezS9riddObII01"
  },
  {
    name: "Brand Color Palette",
    price: "$15",
    amount: 15,
    category: "Brand Assets",
    type: "Digital file",
    description: "A simple color direction with hex codes and usage guide for your brand.",
    url: "https://buy.stripe.com/bJe3cw6F063m8neflWbII02"
  },
  {
    name: "Business Card Design",
    price: "$15",
    amount: 15,
    category: "Brand Assets",
    type: "Digital file",
    description: "A minimal, professional business card layout delivered as a print-ready file.",
    url: "https://buy.stripe.com/cNi4gAd3o77qgTKgq0bII03"
  },
  {
    name: "Contact Form Setup",
    price: "$35",
    amount: 35,
    category: "Website Setup",
    type: "1-on-1 service",
    description: "A working contact form installed and configured on your website.",
    url: "https://buy.stripe.com/fZu6oI7J4dvOavm3DebII04"
  },
  {
    name: "Policy Page Setup",
    price: "$39",
    amount: 39,
    category: "Website Setup",
    type: "1-on-1 service",
    description: "Terms, privacy, and refund page formatting and publishing support for your site.",
    url: "https://buy.stripe.com/eVqeVebZk77qbzq2zabII05"
  },
  {
    name: "Homepage Copy Cleanup",
    price: "$49",
    amount: 49,
    category: "Website Setup",
    type: "1-on-1 service",
    description: "Rewrite and polish your homepage copy for clarity and conversion.",
    url: "https://buy.stripe.com/bJe7sM8N8fDW46YehSbII06"
  },
  {
    name: "Simple Landing Page",
    price: "$79",
    amount: 79,
    category: "Website Setup",
    type: "1-on-1 service",
    description: "A focused landing page for one service, offer, or campaign.",
    url: "https://buy.stripe.com/4gMfZi7J4ezSavmgq0bII07"
  },
  {
    name: "Brand Kit Mini",
    price: "$99",
    amount: 99,
    category: "Brand Kit",
    type: "Digital download",
    description: "Colors, typography direction, and visual basics in a downloadable brand guide.",
    url: "https://buy.stripe.com/6oU28sbZk2RafPG1v6bII08"
  },
  {
    name: "Starter Website",
    price: "$149",
    amount: 149,
    category: "Website Setup",
    type: "1-on-1 service",
    description: "A clean one-page website built for a small business.",
    url: "https://buy.stripe.com/7sYeVed3odvO32U7TubII09"
  }
];

const categories = ["Brand Assets", "Website Setup", "Brand Kit"];

const trustItems = [
  "Clear pricing before purchase",
  "Business information displayed",
  "SSL encrypted site",
  "Fixed-scope deliverables",
  "Refund policy available",
  "Secure card checkout"
];

const steps = [
  "Choose a fixed-price service.",
  "Complete checkout and agree to terms.",
  "Share your business details.",
  "We deliver your order on time."
];

const faqs = [
  {
    q: "What does AWGenesis do?",
    a: "We provide fixed-price website and brand setup services for small businesses, including landing pages, brand assets, contact forms, and policy pages."
  },
  {
    q: "What types of products do you offer?",
    a: "We offer three types: 1-on-1 services where we work directly with you, digital files sent after purchase, and downloadable brand kits."
  },
  {
    q: "How fast is delivery?",
    a: "Most small digital deliverables are completed within 3–7 business days. 1-on-1 services depend on how quickly you provide your business details."
  },
  {
    q: "Do you offer custom quotes?",
    a: "No. Every service has a fixed price and a clear scope."
  },
  {
    q: "Is checkout secure?",
    a: "Yes. Payments are processed through a secure card checkout provider."
  },
  {
    q: "What happens after I purchase?",
    a: "You will receive an order confirmation and instructions to share your business details. We then deliver the service or file according to the product description."
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
          policy pages, and more. Clear pricing, fast checkout, and reliable delivery.
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
                      <div>
                        <h3>{service.name}</h3>
                        <span className="serviceType">{service.type}</span>
                      </div>
                      <span className="price">{service.price}</span>
                    </div>
                    <p>{service.description}</p>
                    <div className="checkboxRow">
                      <input type="checkbox" id={`terms-${service.name}`} />
                      <label htmlFor={`terms-${service.name}`}>
                        I agree to the Terms of Service, Privacy Policy, and Refund Policy.
                      </label>
                    </div>
                    <a
                      className="button primary full"
                      href={service.url || "#contact"}
                      target={service.url ? "_blank" : undefined}
                      rel={service.url ? "noopener noreferrer" : undefined}
                    >
                      Order now — {service.price}
                    </a>
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
            <li>Phone: +1 (201) 409-2403</li>
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
          <h2>Get in touch.</h2>
          <p>Questions before ordering? Reach out and we will respond with service details.</p>
        </div>

        <div className="contactWrapper">
          <form className="contactForm" action="mailto:info@awgenesis.com" method="post" encType="text/plain">
            <div className="formRow">
              <input type="text" name="name" placeholder="Your name" required />
              <input type="email" name="email" placeholder="Your email" required />
            </div>
            <input type="text" name="subject" placeholder="Subject" required />
            <textarea name="message" rows={5} placeholder="How can we help?" required></textarea>
            <button className="button primary" type="submit">Send message</button>
          </form>

          <div className="contactCard compact">
            <div className="contactLine">
              <span className="contactLabel">Legal name</span>
              <span className="contactValue">AWGenesis LLC</span>
            </div>
            <div className="contactLine">
              <span className="contactLabel">Email</span>
              <a className="contactValue" href="mailto:info@awgenesis.com">info@awgenesis.com</a>
            </div>
            <div className="contactLine">
              <span className="contactLabel">Phone</span>
              <a className="contactValue" href="tel:+12014092403">+1 (201) 409-2403</a>
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
