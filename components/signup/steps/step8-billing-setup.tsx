"use client";

import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/stripe-client";
import {
  useCreateSetupIntentMutation,
  useGetStripeConfigQuery,
} from "@/redux/features/payment/paymentApi";
import { StripeCardElement } from "@/components/payment/stripe-card-element";
import {
  ShieldCheck,
  Calendar,
  Lock,
  Loader2,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  Sparkles,
} from "lucide-react";

interface Step8BillingSetupProps {
  planDetails: {
    planName: string;
    planPrice: number;
    billingInterval: string;
  };
  residentDetails: {
    fullName: string;
    postalCode: string;
  };
  onPaymentSuccess: (setupIntentId: string, paymentMethodId: string) => Promise<void>;
  onBack: () => void;
  isSubmittingOverall?: boolean;
}

export function Step8BillingSetup({
  planDetails,
  residentDetails,
  onPaymentSuccess,
  onBack,
  isSubmittingOverall = false,
}: Step8BillingSetupProps) {
  const { data: configData, isLoading: isLoadingConfig } = useGetStripeConfigQuery();
  const [createSetupIntent, { isLoading: isCreatingIntent }] =
    useCreateSetupIntentMutation();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState(residentDetails.fullName || "");
  const [postalCode, setPostalCode] = useState(residentDetails.postalCode || "02906");
  const [initError, setInitError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dynamic calculation of 1st day of next month
  const now = new Date();
  const nextMonthFirst = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const commencementDateFormatted = nextMonthFirst.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  useEffect(() => {
    let isMounted = true;

    async function initIntent() {
      try {
        setInitError(null);
        const res = await createSetupIntent({
          plan: planDetails.planName,
        }).unwrap();
        if (isMounted && res?.data?.clientSecret) {
          setClientSecret(res.data.clientSecret);
        } else if (isMounted) {
          setInitError(res?.message || "Failed to initialize payment gateway.");
        }
      } catch (err: any) {
        if (isMounted) {
          const msg =
            err?.data?.message ||
            err?.message ||
            "Unable to connect to Stripe payment services.";
          setInitError(msg);
        }
      }
    }

    initIntent();

    return () => {
      isMounted = false;
    };
  }, [createSetupIntent]);

  const handleCardSuccess = async (setupIntentId: string, paymentMethodId: string) => {
    setIsProcessing(true);
    try {
      await onPaymentSuccess(setupIntentId, paymentMethodId);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const publishableKey =
    configData?.data?.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF3F8] text-[#294B68] text-xs font-bold uppercase tracking-wider">
          Step 8 of 9
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Billing Setup
        </h2>
        <p className="text-sm text-[#5E8FB2] max-w-lg mx-auto">
          Save your payment method to activate your service. No payment is charged today.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: $0 Today Banner & Summary */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-6 bg-[#F8FAFC] rounded-3xl border border-[#D9E4EC] space-y-5">
            {/* $0 Due Today Badge */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1 text-emerald-950">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Due Today at Signup
              </span>
              <div className="text-3xl font-black text-emerald-800">$0.00</div>
              <p className="text-base text-emerald-700">
                Zero initial charge. Your payment method is authorized and securely stored.
              </p>
            </div>

            {/* Plan Terms */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium">Contracted Plan:</span>
                <span className="font-extrabold text-[#243746]">
                  {planDetails.planName}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-[#64748B] font-medium">Monthly Rate:</span>
                <span className="font-extrabold text-[#243746]">
                  ${planDetails.planPrice}.00 / mo
                </span>
              </div>

              <div className="flex items-start justify-between text-xs pt-2 border-t border-[#D9E4EC]">
                <span className="text-[#64748B] font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#294B68]" /> Service Starts:
                </span>
                <span className="font-bold text-[#294B68] text-right">
                  {commencementDateFormatted}
                </span>
              </div>

              <div className="flex items-start justify-between text-xs pt-2 border-t border-[#D9E4EC]">
                <span className="text-[#64748B] font-medium">First Billing Date:</span>
                <span className="font-bold text-[#294B68] text-right">
                  {commencementDateFormatted}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#D9E4EC] text-base text-[#64748B] leading-relaxed">
              You won't be charged today. Your first charge and your first visit will both be on <strong>{commencementDateFormatted}</strong>. After that, billing recurs automatically on the 1st of each month. You can cancel anytime in your member portal — canceling at least 10 days before month-end stops your next charge.
            </div>
          </div>
        </div>

        {/* Right Column: Stripe Elements Card Form */}
        <div className="md:col-span-7">
          <div className="bg-white rounded-3xl border border-[#D9E4EC] p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#D9E4EC] pb-4">
              <div>
                <h3 className="font-extrabold text-base text-[#243746]">
                  Save Payment Method
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Credit or Debit Card &bull; Powered by Stripe
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#3F8F6B]">
                <Lock className="w-3.5 h-3.5" />
                <span>SSL Encrypted</span>
              </div>
            </div>

            {initError ? (
              <div className="p-5 bg-red-50 rounded-2xl border border-red-200 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                <h4 className="font-bold text-red-800 text-sm">Payment Gateway Notice</h4>
                <p className="text-xs text-red-600 max-w-sm mx-auto">{initError}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Retry Connection
                </button>
              </div>
            ) : isLoadingConfig || isCreatingIntent || !clientSecret ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#294B68] mx-auto" />
                <p className="text-xs font-bold text-[#243746]">
                  Initializing Secure Stripe Gateway...
                </p>
              </div>
            ) : (
              <Elements stripe={getStripe(publishableKey)} options={{ clientSecret }}>
                <StripeCardElement
                  clientSecret={clientSecret}
                  cardholderName={cardholderName}
                  onCardholderNameChange={setCardholderName}
                  postalCode={postalCode}
                  onPostalCodeChange={setPostalCode}
                  onPaymentSuccess={handleCardSuccess}
                  onPaymentError={(err) => console.error("Payment error:", err)}
                  isProcessing={isProcessing || isSubmittingOverall}
                  setIsProcessing={setIsProcessing}
                  submitButtonText="Authorize Payment Method & Complete Signup"
                />
              </Elements>
            )}

            {/* Back Button */}
            <div className="pt-2 border-t border-[#D9E4EC]">
              <button
                type="button"
                onClick={onBack}
                disabled={isProcessing || isSubmittingOverall}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#243746] transition-colors cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Authorizations</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
