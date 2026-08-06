import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) console.warn("STRIPE_SECRET_KEY is not configured");
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
export const STRIPE_PRICE_ONE_TIME = process.env.STRIPE_PRICE_ONE_TIME ?? "price_1TxSA7D5beF4SzVlfDPknFqA";
export const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_MONTHLY ?? "price_1TxSA7D5beF4SzVlW19VWXvc";
