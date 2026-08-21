const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("permanent Payment Link provisioning enforces the approved contract", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "scripts", "create-open-payment-links.js"), "utf8");
  assert.match(source, /custom_unit_amount:\s*\{ enabled: true, minimum: 600, maximum: 20000 \}/);
  assert.match(source, /payment_method_types:\s*\["cashapp"\]/);
  assert.match(source, /customer_creation:\s*"always"/);
  assert.match(source, /key:\s*"customer_name"/);
  assert.match(source, /custom:\s*"Full name"/);
  assert.match(source, /optional:\s*false/);
  assert.match(source, /invoice_creation:\s*\{ enabled: false \}/);
  assert.match(source, /system_model:\s*"payment-link-postpay-v1"/);
  assert.match(source, /PAYMENT_LINK_COUNT/);
  assert.match(source, /ALLOW_LIVE_PAYMENT_LINK_CREATION/);
});
