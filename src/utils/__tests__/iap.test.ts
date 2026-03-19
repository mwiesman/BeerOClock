import {
  TIP_PRODUCTS,
  TIP_PRODUCT_IDS,
  TIP_DISPLAY,
  purchaseTip,
  isIAPAvailable,
} from '../iap';

// ─── Product definitions ─────────────────────────────────

describe('TIP_PRODUCTS', () => {
  it('has exactly 3 tip products', () => {
    expect(Object.keys(TIP_PRODUCTS)).toHaveLength(3);
  });

  it('includes COLD_ONE, SIX_PACK, and CASE', () => {
    expect(TIP_PRODUCTS).toHaveProperty('COLD_ONE');
    expect(TIP_PRODUCTS).toHaveProperty('SIX_PACK');
    expect(TIP_PRODUCTS).toHaveProperty('CASE');
  });
});

describe('TIP_PRODUCT_IDS', () => {
  it('has exactly 3 product IDs', () => {
    expect(TIP_PRODUCT_IDS).toHaveLength(3);
  });

  it('all product IDs are non-empty strings', () => {
    for (const id of TIP_PRODUCT_IDS) {
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    }
  });

  it('all product IDs start with "tip_"', () => {
    for (const id of TIP_PRODUCT_IDS) {
      expect(id).toMatch(/^tip_/);
    }
  });
});

// ─── Display info ────────────────────────────────────────

describe('TIP_DISPLAY', () => {
  it('has display info for every product', () => {
    for (const id of TIP_PRODUCT_IDS) {
      expect(TIP_DISPLAY).toHaveProperty(id);
    }
  });

  it('every product has a non-empty name, price, and description', () => {
    for (const id of TIP_PRODUCT_IDS) {
      const info = TIP_DISPLAY[id];
      expect(typeof info.name).toBe('string');
      expect(info.name.length).toBeGreaterThan(0);

      expect(typeof info.price).toBe('string');
      expect(info.price.length).toBeGreaterThan(0);

      expect(typeof info.description).toBe('string');
      expect(info.description.length).toBeGreaterThan(0);
    }
  });

  it('prices start with a dollar sign', () => {
    for (const id of TIP_PRODUCT_IDS) {
      expect(TIP_DISPLAY[id].price).toMatch(/^\$/);
    }
  });
});

// ─── purchaseTip ─────────────────────────────────────────

describe('purchaseTip', () => {
  it('returns success for valid product IDs', async () => {
    for (const id of TIP_PRODUCT_IDS) {
      const result = await purchaseTip(id);
      expect(result.success).toBe(true);
      expect(result.message).toBeTruthy();
    }
  });

  it('returns failure for invalid product ID', async () => {
    const result = await purchaseTip('tip_invalid' as any);
    expect(result.success).toBe(false);
  });
});

// ─── isIAPAvailable ──────────────────────────────────────

describe('isIAPAvailable', () => {
  it('returns a boolean', () => {
    expect(typeof isIAPAvailable()).toBe('boolean');
  });

  it('returns false in test/Expo Go environment (stub)', () => {
    expect(isIAPAvailable()).toBe(false);
  });
});
