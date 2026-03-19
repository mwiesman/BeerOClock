// In-App Purchase definitions for "Buy Me a Cold One" tip jar
//
// IAP requires native modules and can only be tested in production/preview builds,
// not Expo Go. This module provides product definitions, types, and a purchase stub
// so the UI can be built now. The stub will be replaced with real react-native-iap
// calls when EAS builds and store accounts are set up.

// Product IDs — must match App Store Connect / Google Play Console
export const TIP_PRODUCTS = {
  COLD_ONE: 'tip_cold_one', // $1.99
  SIX_PACK: 'tip_six_pack', // $4.99
  CASE: 'tip_case', // $9.99
} as const;

export const TIP_PRODUCT_IDS = Object.values(TIP_PRODUCTS);

export type TipProductId = (typeof TIP_PRODUCTS)[keyof typeof TIP_PRODUCTS];

export interface TipDisplayInfo {
  name: string;
  price: string;
  description: string;
}

export const TIP_DISPLAY: Record<TipProductId, TipDisplayInfo> = {
  [TIP_PRODUCTS.COLD_ONE]: {
    name: 'A Cold One',
    price: '$1.99',
    description: 'Buy me a beer!',
  },
  [TIP_PRODUCTS.SIX_PACK]: {
    name: 'A Six Pack',
    price: '$4.99',
    description: "Now we're talking!",
  },
  [TIP_PRODUCTS.CASE]: {
    name: 'A Case',
    price: '$9.99',
    description: "You're a legend!",
  },
};

export interface PurchaseResult {
  success: boolean;
  message: string;
}

/**
 * Purchase a tip product.
 *
 * Currently a stub — real IAP requires a production build with native modules.
 * Will be replaced with actual react-native-iap calls when store accounts are
 * configured and the app is built with EAS.
 */
export async function purchaseTip(
  productId: TipProductId
): Promise<PurchaseResult> {
  // Validate the product ID
  if (!TIP_PRODUCT_IDS.includes(productId)) {
    return { success: false, message: 'Invalid product.' };
  }

  // Stub — simulate a successful purchase
  // In production, this will:
  // 1. Initialize IAP connection
  // 2. Request the product from the store
  // 3. Launch the native purchase flow
  // 4. Verify the receipt
  // 5. Finish/acknowledge the transaction
  return { success: true, message: 'Thank you for the support!' };
}

/**
 * Check whether IAP is available on this device/build.
 *
 * Returns false in Expo Go (no native IAP module).
 * Will return true in production EAS builds with react-native-iap installed.
 */
export function isIAPAvailable(): boolean {
  // Stub — always false until real IAP library is installed
  return false;
}
