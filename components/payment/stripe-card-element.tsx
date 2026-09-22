"use client";

import React, { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import {
  Lock,
  CreditCard,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const elementStyles = {
  base: {
    fontSize: "15px",
    color: "#243746",
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    fontWeight: "500",
    "::placeholder": {
      color: "#94A3B8",
    },
    iconColor: "#294B68",
  },
  invalid: {
    color: "#EF4444",
    iconColor: "#EF4444",
  },
};

interface StripeCardElementProps {
  clientSecret: string;
  cardholderName: string;
  onCardholderNameChange: (name: string) => void;
  postalCode: string;
  onPostalCodeChange: (zip: string) => void;
  onPaymentSuccess: (setupIntentId: string, paymentMethodId: string) => void;
  onPaymentError: (errorMessage: string) => void;
  isProcessing: boolean;
  setIsProcessing: (loading: boolean) => void;
  submitButtonText?: string;
}

export function StripeCardElement({
  clientSecret,
  cardholderName,
  onCardholderNameChange,
  postalCode,
  onPostalCodeChange,
  onPaymentSuccess,
  onPaymentError,
  isProcessing,
  setIsProcessing,
  submitButtonText = "Authorize Card & Activate Membership",
}: StripeCardElementProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCardComplete, setIsCardComplete] = useState({
    number: false,
    expiry: false,
    cvc: false,
  });

  const handleCardChange = (field: "number" | "expiry" | "cvc", complete: boolean, error?: { message?: string }) => {
    setIsCardComplete((prev) => ({ ...prev, [field]: complete }));
    if (error?.message) {
      setErrorMessage(error.message);
    } else {
      setErrorMessage(null);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Stripe payment provider is initializing. Please wait a moment.");
      return;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      setErrorMessage("Credit card inputs are not ready.");
      return;
    }

    if (!cardholderName.trim()) {
      setErrorMessage("Cardholder name is required.");
      return;
    }

    if (!postalCode.trim()) {
      setErrorMessage("Billing ZIP/Postal code is required.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Confirm the SetupIntent with the Card details
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardNumber,
          billing_details: {
            name: cardholderName.trim(),
            address: {
              postal_code: postalCode.trim(),
              country: "US",
            },
          },
        },
      });

      if (result.error) {
        const errorMsg =
          result.error.message || "Payment authorization failed. Please verify your card details.";
        setErrorMessage(errorMsg);
        onPaymentError(errorMsg);
        setIsProcessing(false);
        return;
      }

      if (result.setupIntent && result.setupIntent.status === "succeeded") {
        const setupIntentId = result.setupIntent.id;
        const paymentMethodId =
          typeof result.setupIntent.payment_method === "string"
            ? result.setupIntent.payment_method
            : result.setupIntent.payment_method?.id || "";

        onPaymentSuccess(setupIntentId, paymentMethodId);
      } else {
        const statusMsg = `Setup status: ${result.setupIntent?.status || "pending"}`;
        setErrorMessage(statusMsg);
        onPaymentError(statusMsg);
        setIsProcessing(false);
      }
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        "An unexpected error occurred while processing payment.";
      setErrorMessage(msg);
      onPaymentError(msg);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmitPayment} className="space-y-6">
      {errorMessage && (
        <div className="p-4 bg-red-50/90 border border-red-200 rounded-2xl flex items-start gap-3 text-sm text-red-700 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
          <div className="flex-1 font-medium">{errorMessage}</div>
        </div>
      )}

      {/* Cardholder Name */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
          Cardholder Full Name *
        </label>
        <div className="relative">
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => onCardholderNameChange(e.target.value)}
            placeholder="e.g. Arfan Rubel"
            disabled={isProcessing}
            required
            className="w-full h-12 px-4 text-sm font-semibold text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all disabled:opacity-60"
          />
        </div>
      </div>

      {/* Card Number */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
          <span>Card Number *</span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B]">
            <Lock className="w-3 h-3 text-[#3F8F6B]" /> 256-Bit SSL Encrypted
          </span>
        </label>
        <div className="h-12 px-4 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5E8FB2] focus-within:border-transparent flex items-center transition-all">
          <CardNumberElement
            options={{
              style: elementStyles,
              showIcon: true,
              placeholder: "4242 •••• •••• 4242",
            }}
            onChange={(e) => handleCardChange("number", e.complete, e.error)}
            className="w-full"
          />
        </div>
      </div>

      {/* Expiry, CVC, Postal Code Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Expiry */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Expiration *
          </label>
          <div className="h-12 px-4 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5E8FB2] focus-within:border-transparent flex items-center transition-all">
            <CardExpiryElement
              options={{
                style: elementStyles,
                placeholder: "MM / YY",
              }}
              onChange={(e) => handleCardChange("expiry", e.complete, e.error)}
              className="w-full"
            />
          </div>
        </div>

        {/* CVC */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
            CVC / Security *
          </label>
          <div className="h-12 px-4 bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5E8FB2] focus-within:border-transparent flex items-center transition-all">
            <CardCvcElement
              options={{
                style: elementStyles,
                placeholder: "CVC",
              }}
              onChange={(e) => handleCardChange("cvc", e.complete, e.error)}
              className="w-full"
            />
          </div>
        </div>

        {/* Billing ZIP */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Billing ZIP *
          </label>
          <input
            type="text"
           
            onChange={(e) => onPostalCodeChange(e.target.value)}
            placeholder="02906"
            maxLength={10}
            disabled={isProcessing}
            required
            className="w-full h-12 px-4 text-sm font-semibold text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all disabled:opacity-60"
          />
        </div>
      </div>

      {/* Auto-pay & Trust Notice */}
      <div className="p-4 bg-[#F0F5F9] rounded-2xl border border-[#D9E4EC] flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#294B68] shrink-0 mt-0.5" />
        <div className="text-xs text-[#475569] leading-relaxed">
          <strong>Safe & Secure Monthly Subscription:</strong> Your payment method is securely saved with Stripe for automatic monthly renewal. You can update your payment method or cancel anytime in your member dashboard — canceling at least 10 days before month-end stops your next charge.
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full h-14 bg-[#294B68] hover:bg-[#1E374D] text-white font-extrabold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Authorizing Payment &amp; Activating Plan...</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5 group-hover:scale-105 transition-transform" />
            <span>{submitButtonText}</span>
          </>
        )}
      </button>
    </form>
  );
}
