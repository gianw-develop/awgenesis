const crypto = require("crypto");
const { FIXED_PRODUCTS } = require("./catalog");

function activeProducts(sourceProducts = FIXED_PRODUCTS) {
  const seenPriceIds = new Set();
  return (sourceProducts || []).filter(
    (product) =>
      product &&
      Number.isFinite(product.price) &&
      product.price > 0 &&
      typeof product.stripePriceId === "string" &&
      product.stripePriceId.startsWith("price_") &&
      !seenPriceIds.has(product.stripePriceId) &&
      seenPriceIds.add(product.stripePriceId)
  );
}

function combinationHash(items) {
  const key = items
    .map((item) => `${item.stripePriceId}:${item.quantity}`)
    .sort()
    .join("|");
  return crypto.createHash("sha256").update(key).digest("hex");
}

function toUniqueLineItems(products) {
  const priceIds = products.map((product) => product.stripePriceId);
  if (new Set(priceIds).size !== priceIds.length) {
    throw new Error("A service cannot be repeated within the same order");
  }
  return products.map((product) => ({
    name: product.name,
    unitAmountCents: Math.round(product.price * 100),
    stripePriceId: product.stripePriceId,
    quantity: 1,
  }));
}

function enumerateExactCombinations(amountCents, maxUnits = 3, sourceProducts = FIXED_PRODUCTS) {
  const products = activeProducts(sourceProducts).sort((a, b) => b.price - a.price);
  const matches = [];

  function search(start, selected, totalCents) {
    if (totalCents === amountCents && selected.length > 0) {
      matches.push(toUniqueLineItems(selected));
      return;
    }
    if (totalCents >= amountCents || selected.length >= maxUnits) return;

    for (let index = start; index < products.length; index += 1) {
      const product = products[index];
      const nextTotal = totalCents + Math.round(product.price * 100);
      if (nextTotal <= amountCents) {
        // A service can appear only once in an order. Advancing to the next
        // index prevents repeated quantities such as 2 x $75.
        search(index + 1, [...selected, product], nextTotal);
      }
    }
  }

  search(0, [], 0);
  return matches;
}

function chooseExactCombination(amountCents, usedHashes = [], maxUnits = 3, sourceProducts = FIXED_PRODUCTS) {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error("Amount must be a positive integer in cents");
  }

  const matches = enumerateExactCombinations(amountCents, maxUnits, sourceProducts);
  const minimumItems = amountCents >= 8000 ? 3 : 1;
  const eligibleMatches = matches.filter((items) => items.length >= minimumItems);
  if (eligibleMatches.length === 0) return null;

  const ranked = eligibleMatches
    .map((items) => ({ items, hash: combinationHash(items) }))
    .sort((a, b) => {
      // Larger payments should carry a richer, transparent service breakdown.
      // Below $80 we keep Checkout concise; from $80 onward we prefer the
      // greatest number of unique services available within the configured cap.
      if (a.items.length !== b.items.length) {
        return amountCents >= 8000
          ? b.items.length - a.items.length
          : a.items.length - b.items.length;
      }

      if (amountCents >= 8000) {
        // Among equally rich exact combinations, prefer the most balanced
        // invoice. This prevents one high-priced service from dominating the
        // total while the remaining lines merely fill the difference.
        const aAmounts = a.items.map((item) => item.unitAmountCents);
        const bAmounts = b.items.map((item) => item.unitAmountCents);
        const aMax = Math.max(...aAmounts);
        const bMax = Math.max(...bAmounts);
        if (aMax !== bMax) return aMax - bMax;

        const aSpread = aMax - Math.min(...aAmounts);
        const bSpread = bMax - Math.min(...bAmounts);
        if (aSpread !== bSpread) return aSpread - bSpread;

        const aSquares = aAmounts.reduce((sum, value) => sum + value * value, 0);
        const bSquares = bAmounts.reduce((sum, value) => sum + value * value, 0);
        if (aSquares !== bSquares) return aSquares - bSquares;
      }

      const aUsed = usedHashes.includes(a.hash) ? 1 : 0;
      const bUsed = usedHashes.includes(b.hash) ? 1 : 0;
      if (aUsed !== bUsed) return aUsed - bUsed;
      return a.hash.localeCompare(b.hash);
    });

  return ranked[0];
}

function nearbySupportedAmounts(amountCents, radiusDollars = 10, limit = 4, sourceProducts = FIXED_PRODUCTS) {
  const suggestions = [];
  for (let delta = 100; delta <= radiusDollars * 100; delta += 100) {
    for (const candidate of [amountCents - delta, amountCents + delta]) {
      if (candidate < 500 || candidate > 20000) continue;
      if (chooseExactCombination(candidate, [], 5, sourceProducts)) {
        suggestions.push(candidate);
        if (suggestions.length >= limit) return suggestions;
      }
    }
  }
  return suggestions;
}

module.exports = {
  activeProducts,
  combinationHash,
  enumerateExactCombinations,
  chooseExactCombination,
  nearbySupportedAmounts,
};
