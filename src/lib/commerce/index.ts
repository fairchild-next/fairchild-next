import { StripeProvider } from "./providers/stripeProvider";
import { CommerceProvider } from "./types";

export function getCommerceProvider(): CommerceProvider {
  const provider = process.env.COMMERCE_PROVIDER;

  switch (provider) {
    case "stripe":
      return new StripeProvider();

    default:
      throw new Error("Invalid COMMERCE_PROVIDER setting");
  }
}