const test = require("node:test");
const assert = require("node:assert/strict");
const {
  activeProducts,
  enumerateExactCombinations,
  chooseExactCombination,
  combinationHash,
  nearbySupportedAmounts,
} = require("../src/preorderAlgorithm");

const PRODUCTS = [
  { name: "A", price: 10, stripePriceId: "price_test_10" },
  { name: "B", price: 20, stripePriceId: "price_test_20" },
  { name: "C", price: 30, stripePriceId: "price_test_30" },
  { name: "D", price: 50, stripePriceId: "price_test_50" },
  { name: "E", price: 80, stripePriceId: "price_test_80" },
  { name: "F", price: 90, stripePriceId: "price_test_90" },
];

test("catalog exposes active Stripe products", () => {
  assert.ok(activeProducts(PRODUCTS).length >= 1);
  assert.ok(activeProducts(PRODUCTS).every((item) => item.stripePriceId.startsWith("price_")));
});

test("selector honors an explicit combination cap", () => {
  const result = chooseExactCombination(8000, [], 3, PRODUCTS);
  assert.ok(result);
  const total = result.items.reduce((sum, item) => sum + item.unitAmountCents * item.quantity, 0);
  assert.equal(total, 8000);
  assert.ok(result.items.reduce((sum, item) => sum + item.quantity, 0) <= 3);
});

test("the required 37-item ladder prefers five unique services for $80, $150 and $200", () => {
  const ladder = [];
  for (const price of [5, 10, 15, 20, 25, 30]) {
    for (let index = 1; index <= 5; index += 1) {
      ladder.push({ name: `${price}-${index}`, price, stripePriceId: `price_${price}_${index}` });
    }
  }
  for (const price of [40, 45, 55, 75, 95, 150, 200]) {
    ladder.push({ name: `${price}`, price, stripePriceId: `price_${price}` });
  }
  for (const amountCents of [8000, 15000, 20000]) {
    const result = chooseExactCombination(amountCents, [], 5, ladder);
    assert.ok(result);
    assert.equal(result.items.length, 5);
    assert.equal(new Set(result.items.map((item) => item.stripePriceId)).size, 5);
    assert.ok(result.items.every((item) => item.quantity === 1));
    assert.equal(result.items.reduce((sum, item) => sum + item.unitAmountCents, 0), amountCents);
  }
});

test("large totals choose a balanced exact breakdown instead of a dominant filler line", () => {
  const ladder = [];
  for (const price of [5, 10, 15, 20, 25, 30]) {
    for (let index = 1; index <= 5; index += 1) {
      ladder.push({ name: `${price}-${index}`, price, stripePriceId: `price_balance_${price}_${index}` });
    }
  }
  for (const price of [40, 45, 55, 75, 95, 150, 200]) {
    ladder.push({ name: `${price}`, price, stripePriceId: `price_balance_${price}` });
  }

  const result = chooseExactCombination(19500, [], 5, ladder);
  assert.ok(result);
  assert.equal(result.items.length, 5);
  assert.equal(result.items.reduce((sum, item) => sum + item.unitAmountCents, 0), 19500);
  assert.equal(Math.max(...result.items.map((item) => item.unitAmountCents)), 5500);
  assert.ok(result.items.every((item) => item.quantity === 1));
});

test("builds an exact $90 combination", () => {
  const result = chooseExactCombination(9000, [], 3, PRODUCTS);
  assert.ok(result);
  assert.equal(result.items.reduce((sum, item) => sum + item.unitAmountCents * item.quantity, 0), 9000);
});

test("payments of $80 or more use at least three unique services", () => {
  const products = [
    { name: "Five", price: 5, stripePriceId: "price_large_5" },
    { name: "Ten", price: 10, stripePriceId: "price_large_10" },
    { name: "Fifteen", price: 15, stripePriceId: "price_large_15" },
    { name: "Twenty", price: 20, stripePriceId: "price_large_20" },
    { name: "Thirty", price: 30, stripePriceId: "price_large_30" },
    { name: "Seventy Five", price: 75, stripePriceId: "price_large_75" },
  ];
  const result = chooseExactCombination(8000, [], 5, products);
  assert.ok(result);
  assert.ok(result.items.length >= 3);
  assert.equal(result.items.reduce((sum, item) => sum + item.unitAmountCents, 0), 8000);
  assert.ok(result.items.every((item) => item.quantity === 1));
});

test("payments below $80 still prefer a concise checkout", () => {
  const products = [
    { name: "Five", price: 5, stripePriceId: "price_small_5" },
    { name: "Ten", price: 10, stripePriceId: "price_small_10" },
    { name: "Fifteen", price: 15, stripePriceId: "price_small_15" },
    { name: "Thirty", price: 30, stripePriceId: "price_small_30" },
  ];
  const result = chooseExactCombination(3000, [], 5, products);
  assert.equal(result.items.length, 1);
});

test("never repeats a service within the same order", () => {
  const products = [
    { name: "A", price: 15, stripePriceId: "price_unique_15" },
    { name: "B", price: 40, stripePriceId: "price_unique_40" },
    { name: "C", price: 75, stripePriceId: "price_unique_75" },
    { name: "D", price: 95, stripePriceId: "price_unique_95" },
  ];
  const result = chooseExactCombination(15000, [], 3, products);
  assert.ok(result);
  assert.equal(result.items.reduce((sum, item) => sum + item.unitAmountCents, 0), 15000);
  assert.ok(result.items.every((item) => item.quantity === 1));
  assert.equal(new Set(result.items.map((item) => item.stripePriceId)).size, result.items.length);
});

test("supports five-dollar payments when a unique $5 service exists", () => {
  const products = [
    { name: "Five A", price: 5, stripePriceId: "price_five_a" },
    { name: "Five B", price: 5, stripePriceId: "price_five_b" },
  ];
  const result = chooseExactCombination(500, [], 3, products);
  assert.ok(result);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].unitAmountCents, 500);
  assert.equal(result.items[0].quantity, 1);
});

test("uses distinct services when equal-price products form an order", () => {
  const products = [
    { name: "Fifteen A", price: 15, stripePriceId: "price_fifteen_a" },
    { name: "Fifteen B", price: 15, stripePriceId: "price_fifteen_b" },
    { name: "Fifteen C", price: 15, stripePriceId: "price_fifteen_c" },
  ];
  const result = chooseExactCombination(4500, [], 3, products);
  assert.ok(result);
  assert.equal(result.items.length, 3);
  assert.ok(result.items.every((item) => item.quantity === 1));
  assert.equal(new Set(result.items.map((item) => item.stripePriceId)).size, 3);
});

test("rejects unsupported exact amounts instead of inventing a fee", () => {
  assert.equal(chooseExactCombination(1100, [], 3, PRODUCTS), null);
});

test("prefers a combination whose hash was not used", () => {
  const matches = enumerateExactCombinations(8000, 3, PRODUCTS);
  assert.ok(matches.length > 1);
  const firstHash = combinationHash(matches[0]);
  const selected = chooseExactCombination(8000, [firstHash], 3, PRODUCTS);
  assert.notEqual(selected.hash, firstHash);
});

test("suggests whole-dollar nearby amounts", () => {
  const suggestions = nearbySupportedAmounts(2700, 10, 4, PRODUCTS);
  assert.ok(suggestions.length > 0);
  assert.ok(suggestions.every((amount) => amount % 100 === 0));
  assert.ok(suggestions.includes(3000));
});
