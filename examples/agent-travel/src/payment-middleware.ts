import type { Request, Response, NextFunction, RequestHandler } from "express";
import { paymentMiddleware } from "@x402/express";
import { validateAndConsumePaymentIntent } from "./stripe";

export interface UnifiedPaymentConfig {
  x402: {
    routes: Record<string, unknown>;
    resourceServer: unknown;
  };
  stripe: {
    enabled: boolean;
    priceInCents: number;
  };
}

export function unifiedPaymentMiddleware(config: UnifiedPaymentConfig): RequestHandler {
  const x402Middleware = paymentMiddleware(
    config.x402.routes as Parameters<typeof paymentMiddleware>[0],
    config.x402.resourceServer as Parameters<typeof paymentMiddleware>[1],
  );

  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Check for x402 payment headers first
    const x402Header = req.headers["x-payment"] || req.headers["x-402-payment"];
    if (x402Header) {
      return x402Middleware(req, res, next);
    }

    // 2. Check for Stripe PaymentIntent ID
    if (config.stripe.enabled) {
      const stripePaymentIntentId = req.headers["x-stripe-payment-intent-id"] as string;
      if (stripePaymentIntentId) {
        const result = await validateAndConsumePaymentIntent(stripePaymentIntentId, config.stripe.priceInCents);
        if (result.valid) {
          return next();
        }
        return res.status(402).json({
          error: "Payment Required",
          message: result.error,
          options: getPaymentOptions(req, config),
        });
      }
    }

    // 3. No valid payment - return 402 with options
    return res.status(402).json({
      error: "Payment Required",
      message: "No valid payment method provided",
      options: getPaymentOptions(req, config),
    });
  };
}

function getPaymentOptions(req: Request, config: UnifiedPaymentConfig) {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const options: Record<string, unknown> = {
    x402: {
      description: "Pay with cryptocurrency (USDC on Base)",
      headers: ["X-Payment", "X-402-Payment"],
    },
  };

  if (config.stripe.enabled) {
    options.stripe = {
      description: "Pay with credit card via Stripe",
      createPaymentIntentEndpoint: `${baseUrl}/stripe/create-payment-intent`,
      header: "X-Stripe-Payment-Intent-Id",
      price: `$${(config.stripe.priceInCents / 100).toFixed(2)}`,
    };
  }

  return options;
}
