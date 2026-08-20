import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (publishableKey?: string): Promise<Stripe | null> => {
  const key =
    publishableKey ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51U658aGpE47YsiXu8fiQRLcKEoMGVyydNlN6YytyczPiILvK8BXdV6ssDGpiR3MeBBYKRiKYNf2CSYPh1AmRzmoi00BwKLNTrM";

  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};
