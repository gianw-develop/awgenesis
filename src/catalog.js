const priceIds = require("./catalogPriceIds.json");
const REFUND_TREATMENT = "Refunds follow the published Refund Policy: cancellation before work begins is refundable; after work begins, eligibility depends on the undelivered scope.";
const TAX_CATEGORY = "txcd_20030000 - General website and brand setup services";
const WEBSITE_SECTION = "/#services";

const definitions = [
  ["favicon-format-check", "Favicon Format Check", 6, "Review one favicon file for web-ready size and format.", "A concise favicon readiness note."],
  ["brand-color-note", "Single Brand Color Note", 7, "Document one customer-selected brand color with web-ready values.", "One color specification note."],
  ["image-alt-text", "Single Image Alt Text", 8, "Write accessible alt text for one customer-supplied website image.", "One polished alt-text line."],
  ["button-label-polish", "Website Button Label Polish", 9, "Improve one customer-supplied call-to-action label for clarity.", "Original and revised button wording."],
  ["favicon-setup", "Favicon Setup Guidance", 10, "Provide implementation guidance for one website favicon.", "A short favicon setup guide."],
  ["meta-title-polish", "Single Page Meta Title Polish", 11, "Polish one customer-supplied page title for clarity and length.", "One revised meta title."],
  ["email-signature-review", "Email Signature Review", 12, "Review one business email signature for consistency and usability.", "An annotated signature review."],
  ["contact-line-polish", "Contact Section Wording Polish", 13, "Improve one short customer-supplied contact section.", "Revised contact-section copy."],
  ["brand-font-note", "Brand Font Pairing Note", 14, "Recommend a practical two-font direction for one small-business brand.", "One font-pairing note."],
  ["brand-palette", "Brand Color Palette Mini", 15, "Create a concise web-ready palette from customer direction.", "A palette with color codes and usage notes."],
  ["social-bio-polish", "Business Social Bio Polish", 16, "Polish one short customer-supplied business profile biography.", "One revised social bio."],
  ["image-sizing-guide", "Website Image Sizing Guide", 17, "Prepare sizing guidance for one customer-selected website section.", "One image-sizing reference."],
  ["headline-polish", "Homepage Headline Polish", 18, "Improve one homepage headline and supporting sentence.", "One revised headline pair."],
  ["link-review", "Website Link Review", 19, "Review up to five customer-supplied website links for labeling and destination consistency.", "A five-link review note."],
  ["navigation-labels", "Navigation Label Review", 20, "Review and polish up to five website navigation labels.", "A revised navigation-label list."],
  ["contact-form-copy", "Contact Form Copy Set", 21, "Write labels and confirmation copy for one basic contact form.", "A complete form-copy set."],
  ["brand-usage-note", "Brand Usage Quick Note", 22, "Document basic usage rules for one logo and color set.", "A one-page brand usage note."],
  ["service-card-copy", "Single Service Card Copy", 23, "Write a title, description, and action label for one service card.", "One publication-ready service card."],
  ["footer-content-review", "Website Footer Content Review", 24, "Review one website footer for business, navigation, and policy completeness.", "An annotated footer review."],
  ["homepage-section-outline", "Homepage Section Outline", 25, "Create a practical content outline for one small-business homepage.", "A sequenced homepage outline."],
  ["mobile-copy-check", "Mobile Copy Readability Check", 26, "Review one customer-selected page section for mobile copy length and hierarchy.", "A concise mobile readability report."],
  ["form-confirmation-copy", "Form Confirmation Message Set", 27, "Write success and error messages for one basic website form.", "A reusable confirmation-message set."],
  ["about-copy-polish", "About Section Copy Polish", 28, "Polish one customer-supplied About section for clarity and credibility.", "One revised About section."],
  ["service-page-outline", "Single Service Page Outline", 29, "Create a structured outline for one customer-selected service page.", "A complete service-page outline."],
  ["seo-basics-review", "Single Page SEO Basics Review", 30, "Review one page title, description, headings, and image text for basic consistency.", "A concise SEO basics report."],
  ["contact-form-plan", "Contact Form Setup Plan", 31, "Define fields, routing, and confirmation behavior for one contact form.", "A contact-form implementation plan."],
  ["landing-page-copy-map", "Landing Page Copy Map", 32, "Map the core message and sections for one focused landing page.", "A sequenced landing-page copy map."],
  ["brand-assets-checklist", "Brand Assets Readiness Checklist", 33, "Review customer-supplied logo, colors, fonts, and image assets for web use.", "A completed readiness checklist."],
  ["policy-page-format", "Policy Page Formatting Review", 34, "Review formatting and navigation placement of customer-supplied policy text.", "A policy-page formatting report."],
  ["contact-form-setup", "Basic Contact Form Setup", 35, "Configure one basic website contact form using customer-provided destination details.", "One configured form with a test report."],
  ["homepage-copy-review", "Homepage Copy Review", 43, "Review one small-business homepage for message clarity and consistency.", "An annotated homepage copy review."],
  ["brand-kit-starter", "Brand Kit Starter", 44, "Organize customer-approved colors, type direction, and logo usage into a concise guide.", "A starter brand guide PDF."],
  ["website-content-check", "Website Content Consistency Check", 45, "Review up to three website sections for naming, tone, and business-information consistency.", "A prioritized consistency report."],
  ["landing-page-wireframe", "Landing Page Content Wireframe", 46, "Create a content-first wireframe for one focused landing page.", "A structured wireframe document."],
  ["website-launch-checklist", "Website Launch Readiness Checklist", 47, "Review a small-business site against a practical pre-launch checklist.", "A completed launch-readiness report."],
  ["homepage-copy-cleanup", "Homepage Copy Cleanup", 48, "Polish customer-supplied homepage copy across its core sections.", "Publication-ready homepage copy."],
  ["brand-web-alignment", "Brand and Website Alignment Review", 49, "Review one website for consistency with approved logo, colors, typography, and messaging.", "An annotated alignment report with priorities."],
];

const FIXED_PRODUCTS = definitions.map(([key, name, price, description, deliverable]) => ({
  key, name, price, description, deliverable,
  deliveryMethod: "PDF or digital file by email",
  deliveryTimeframe: price <= 20 ? "1 business day" : price <= 35 ? "2 business days" : "3 business days",
  evidenceType: "Delivery email and attached file",
  refundTreatment: REFUND_TREATMENT,
  taxCategory: TAX_CATEGORY,
  websiteSection: WEBSITE_SECTION,
  stripePriceId: priceIds[key] || "",
  kind: "service",
}));

module.exports = { CATALOG: [], FIXED_PRODUCTS };
