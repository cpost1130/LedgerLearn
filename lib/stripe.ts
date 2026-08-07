import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export { getStripe as stripe };
export const STRIPE_PRICE_ONE_TIME = process.env.STRIPE_PRICE_ONE_TIME ?? "price_1U1wITLjitasGf5zCdM8NbET";
export const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY ?? "price_1U1wHFLjitasGf5zv2SbnFOk";
