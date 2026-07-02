/**
 * Unit Tests — Dynamic Pricing Engine (computeDynamicPrice)
 *
 * Tests the pure `computeDynamicPrice` function against all documented tiers:
 * early-bird, standard, last-minute, final-days, high-demand (×2), low-demand,
 * loyalty discount, and combined scenarios.
 *
 * Uses node:test (project's existing test runner — no extra deps required).
 */
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
// Import from the pure module (no Prisma dependency) so tests run without a DB
import { computeDynamicPrice } from '../services/pricingAlgorithm.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build a minimal pricing config for computeDynamicPrice. */
function makeParams({
  basePrice = 1000,
  minPrice = 100,
  maxPrice = 5000,
  capacity = 200,
  registrations = 50,
  daysUntilEvent = 20,
  isLoyal = false,
} = {}) {
  const now = new Date();
  const eventDate = new Date(now.getTime() + daysUntilEvent * 24 * 60 * 60 * 1000);
  return { basePrice, minPrice, maxPrice, capacity, registrations, eventDate, isLoyal, now };
}

// ── Test Suites ───────────────────────────────────────────────────────────────

describe('computeDynamicPrice — time-based pricing tiers', () => {
  test('early bird (>30 days out) applies −20%', () => {
    const params = makeParams({ daysUntilEvent: 45 });
    const { price, reasons } = computeDynamicPrice(params);
    // 1000 * 0.8 = 800
    assert.ok(price <= 850, `Expected ≤850 for early bird, got ${price}`);
    assert.ok(reasons.some((r) => r.includes('early_bird')), `Missing early_bird reason; got: ${JSON.stringify(reasons)}`);
  });

  test('standard window (15–30 days out) has 0% time modifier', () => {
    const params = makeParams({ daysUntilEvent: 22, capacity: 200, registrations: 60 });
    const { price, reasons } = computeDynamicPrice(params);
    // No time uplift — check standard_rate is the time reason
    assert.ok(reasons.some((r) => r.includes('standard')), `Expected standard_rate reason; got: ${JSON.stringify(reasons)}`);
    // Price should be close to base (may have demand modifier if capacity is filled)
    assert.ok(price >= 900 && price <= 1200, `Expected 900–1200 for standard window, got ${price}`);
  });

  test('last-minute (3–15 days out) applies +20%', () => {
    const params = makeParams({ daysUntilEvent: 10, registrations: 80, capacity: 200 });
    const { price, reasons } = computeDynamicPrice(params);
    // 1000 * 1.2 = 1200
    assert.ok(price >= 1150, `Expected ≥1150 for last-minute, got ${price}`);
    assert.ok(reasons.some((r) => r.includes('last_minute')), `Missing last_minute reason; got: ${JSON.stringify(reasons)}`);
  });

  test('final days (<3 days) applies +50%', () => {
    const params = makeParams({ daysUntilEvent: 2, registrations: 100, capacity: 200 });
    const { price, reasons } = computeDynamicPrice(params);
    // 1000 * 1.5 = 1500
    assert.ok(price >= 1400, `Expected ≥1400 for final days, got ${price}`);
    assert.ok(reasons.some((r) => r.includes('final_days')), `Missing final_days reason; got: ${JSON.stringify(reasons)}`);
  });
});

describe('computeDynamicPrice — demand-based adjustments', () => {
  test('≥95% capacity utilization adds +25%', () => {
    const params = makeParams({ daysUntilEvent: 20, capacity: 100, registrations: 96 });
    const { price, reasons } = computeDynamicPrice(params);
    assert.ok(reasons.some((r) => r.includes('demand_95')), `Missing demand_95 reason; got: ${JSON.stringify(reasons)}`);
    // 1000 * 1.25 = 1250
    assert.ok(price >= 1200, `Expected ≥1200 for 95% demand, got ${price}`);
  });

  test('≥80% and <95% capacity utilization adds +10%', () => {
    const params = makeParams({ daysUntilEvent: 20, capacity: 100, registrations: 85 });
    const { price, reasons } = computeDynamicPrice(params);
    assert.ok(reasons.some((r) => r.includes('demand_80')), `Missing demand_80 reason; got: ${JSON.stringify(reasons)}`);
    // 1000 * 1.1 = 1100
    assert.ok(price >= 1050, `Expected ≥1050 for 80% demand, got ${price}`);
  });

  test('≤20% capacity utilization applies −15%', () => {
    const params = makeParams({ daysUntilEvent: 20, capacity: 200, registrations: 30 }); // 15%
    const { price, reasons } = computeDynamicPrice(params);
    assert.ok(reasons.some((r) => r.includes('low_demand')), `Missing low_demand reason; got: ${JSON.stringify(reasons)}`);
    // 1000 * 0.85 = 850
    assert.ok(price <= 900, `Expected ≤900 for low demand, got ${price}`);
  });

  test('zero capacity does not crash and applies no demand modifier', () => {
    const params = makeParams({ capacity: 0, registrations: 0, daysUntilEvent: 20 });
    const { price } = computeDynamicPrice(params);
    // No demand adjustment; price stays near base
    assert.ok(price > 0, `Price must be positive, got ${price}`);
  });
});

describe('computeDynamicPrice — loyalty discount', () => {
  test('loyal user (isLoyal=true) receives −10% discount', () => {
    const base = makeParams({ daysUntilEvent: 20, isLoyal: false });
    const loyal = makeParams({ daysUntilEvent: 20, isLoyal: true });

    const { price: priceBase } = computeDynamicPrice(base);
    const { price: priceLoyal, reasons } = computeDynamicPrice(loyal);

    // Loyal price should be exactly 10% less than base price
    const expectedDiscount = priceBase * 0.1;
    const actualDiscount = priceBase - priceLoyal;
    assert.ok(
      Math.abs(actualDiscount - expectedDiscount) <= 2,
      `Loyalty discount: expected ~${expectedDiscount.toFixed(0)}, got ${actualDiscount.toFixed(0)}`
    );
    assert.ok(reasons.some((r) => r.includes('loyalty')), `Missing loyalty reason; got: ${JSON.stringify(reasons)}`);
  });

  test('non-loyal user does NOT get loyalty discount', () => {
    const params = makeParams({ daysUntilEvent: 20, isLoyal: false });
    const { reasons } = computeDynamicPrice(params);
    assert.ok(!reasons.some((r) => r.includes('loyalty')), `Unexpected loyalty reason for non-loyal user; got: ${JSON.stringify(reasons)}`);
  });
});

describe('computeDynamicPrice — combined scenarios', () => {
  test('early bird + high demand: both modifiers apply', () => {
    // 45 days out (early bird −20%) + 96% full (+25%)
    const params = makeParams({ daysUntilEvent: 45, capacity: 100, registrations: 96 });
    const { price, reasons } = computeDynamicPrice(params);
    // 1000 * 0.8 * 1.25 = 1000
    assert.ok(reasons.some((r) => r.includes('early_bird')), 'Expected early_bird');
    assert.ok(reasons.some((r) => r.includes('demand_95')), 'Expected demand_95');
    // combined: 0.8 * 1.25 = 1.0 × base = 1000
    assert.ok(price >= 950 && price <= 1100, `Expected ~1000 combined, got ${price}`);
  });

  test('final days + loyal user: surcharge and discount both apply', () => {
    const params = makeParams({ daysUntilEvent: 1, isLoyal: true, registrations: 50, capacity: 200 });
    const { price, reasons } = computeDynamicPrice(params);
    // 1000 * 1.5 * 0.9 = 1350
    assert.ok(reasons.some((r) => r.includes('final_days')), 'Expected final_days');
    assert.ok(reasons.some((r) => r.includes('loyalty')), 'Expected loyalty');
    assert.ok(price >= 1300 && price <= 1450, `Expected ~1350 combined, got ${price}`);
  });
});

describe('computeDynamicPrice — invariants', () => {
  test('result is always clamped to [minPrice, maxPrice]', () => {
    const testCases = [
      makeParams({ daysUntilEvent: 1, basePrice: 10000, maxPrice: 500 }), // above max
      makeParams({ daysUntilEvent: 60, basePrice: 100, minPrice: 200 }),  // below min
    ];
    for (const params of testCases) {
      const { price } = computeDynamicPrice(params);
      assert.ok(price >= params.minPrice, `Price ${price} is below minPrice ${params.minPrice}`);
      assert.ok(price <= params.maxPrice, `Price ${price} is above maxPrice ${params.maxPrice}`);
    }
  });

  test('price is always a positive number', () => {
    const configs = [
      makeParams({ daysUntilEvent: 60, basePrice: 100 }),
      makeParams({ daysUntilEvent: 1, basePrice: 50 }),
      makeParams({ daysUntilEvent: 10, capacity: 100, basePrice: 500 }),
    ];
    for (const params of configs) {
      const { price } = computeDynamicPrice(params);
      assert.ok(price > 0, `Price must be positive, got ${price}`);
    }
  });

  test('reasons is always an array', () => {
    const params = makeParams({ daysUntilEvent: 20 });
    const { reasons } = computeDynamicPrice(params);
    assert.ok(Array.isArray(reasons), 'reasons must be an array');
  });
});
