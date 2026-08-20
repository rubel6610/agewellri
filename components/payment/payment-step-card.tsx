"use client";

import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/stripe-client";
import { StripeCardElement } from "./stripe-card-element";
import {
  useCreateSetupIntentMutation,
  useGetStripeConfigQuery,
} from "@/redux/features/payment/paymentApi";
import {
  Shield,
  Heart,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  CreditCard,
} from "lucide-react";

interface PaymentStepCardProps {
  selectedPlan: "ESSENTIAL_GUARD" | "GUARDIAN_PLUS";
  hasCleaningAddon: boolean;
  clientFullName: string;
  clientEmail: string;
  clientPostalCode: string;
  onBackToAgreement: () => void;
  onPaymentConfirmed: (setupIntentId: string, paymentMethodId: string) => Promise<void>;
  isSubmittingOverall: boolean;
}

export function PaymentStepCard({
  selectedPlan,
  hasCleaningAddon,
  clientFullName,
  clientEmail,
  clientPostalCode,
  onBackToAgreement,
  onPaymentConfirmed,
  isSubmittingOverall,
}: PaymentStepCardProps) {
  const { data: configData, isLoading: isLoadingConfig } = useGetStripeConfigQuery();
  const [createSetupIntent, { isLoading: isCreatingIntent }] =
    useCreateSetupIntentMutation();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState(clientFullName || "");
  const [billingZip, setBillingZip] = useState(clientPostalCode || "02906");
  const [initError, setInitError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate pricing breakdown
  const planBasePrice = selectedPlan === "GUARDIAN_PLUS" ? 1800 : 99;
  const addonPrice = hasCleaningAddon ? 50 : 0;
  const totalQuarterlyPrice = planBasePrice + addonPrice;

  // Plan metadata
  const planName =
    selectedPlan === "GUARDIAN_PLUS" ? "Guardian Plus" : "Essential Guard";
  const planVisits =
    selectedPlan === "GUARDIAN_PLUS"
      ? "8 Safety Oversight Visits / Quarter"
      : "4 Safety Oversight Visits / Quarter";

  // Create SetupIntent on mount or when plan changes
  useEffect(() => {
    let isMounted = true;

    async function initSetupIntent() {
      try {
        setInitError(null);
        const res = await createSetupIntent({
          plan: selectedPlan,
          hasCleaningAddon,
        }).unwrap();

        if (isMounted && res?.data?.clientSecret) {
          setClientSecret(res.data.clientSecret);
        } else if (isMounted) {
          setInitError(res?.message || "Failed to initialize payment gateway.");
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg =
            (err as { data?: { message?: string } })?.data?.message ||
            (err as { message?: string })?.message ||
            "Unable to connect to Stripe payment services.";
          setInitError(msg);
        }
      }
    }

    initSetupIntent();

    return () => {
      isMounted = false;
    };
  }, [createSetupIntent, selectedPlan, hasCleaningAddon]);

  const handleSuccess = async (setupIntentId: string, paymentMethodId: string) => {
    setIsProcessing(true);
    await onPaymentConfirmed(setupIntentId, paymentMethodId);
    setIsProcessing(false);
  };

  const publishableKey =
    configData?.data?.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9E4EC]">
        <div>
          <button
            type="button"
            onClick={onBackToAgreement}
            disabled={isProcessing || isSubmittingOverall}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] transition-colors mb-2 cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Service Agreement</span>
          </button>
          <h2 className="text-2xl sm:text-3xl font-black text-[#243746]">
            Secure Payment &amp; Membership Activation
          </h2>
          <p className="text-sm text-[#64748B] mt-0.5">
            Step 2 of 2: Authorize your quarterly membership payment method via Stripe.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EAF3F8] text-[#294B68] rounded-full border border-[#5E8FB2]/30 text-xs font-bold shrink-0 self-start sm:self-center">
          <Sparkles className="w-3.5 h-3.5 text-[#294B68]" />
          <span>Activation Ready</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order & Plan Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#F8FAFC] rounded-3xl border border-[#D9E4EC] p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#D9E4EC] pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Selected Membership
              </span>
              <span className="text-xs font-bold text-[#3F8F6B] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Quarterly Billing
              </span>
            </div>

            {/* Plan Details Card */}
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#294B68] text-white flex items-center justify-center shrink-0 shadow-sm">
                  {selectedPlan === "GUARDIAN_PLUS" ? (
                    <Shield className="w-5 h-5 text-white" />
                  ) : (
                    <Heart className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-[#243746]">
                    {planName}
                  </h3>
                  <p className="text-xs text-[#64748B] font-medium mt-0.5">
                    {planVisits}
                  </p>
                </div>
              </div>

              {/* Inclusions list */}
              <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] space-y-2.5 text-xs text-[#475569]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3F8F6B] shrink-0" />
                  <span>Comprehensive in-home safety oversight</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3F8F6B] shrink-0" />
                  <span>Hazard mitigation &amp; emergency preparedness</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#3F8F6B] shrink-0" />
                  <span>Family care portal &amp; real-time inspection logs</span>
                </div>
                {hasCleaningAddon && (
                  <div className="flex items-center gap-2 text-[#294B68] font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#294B68] shrink-0" />
                    <span>Quarterly Deep Cleaning Add-On Included</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 pt-2 border-t border-[#D9E4EC]">
              <div className="flex justify-between text-xs text-[#64748B]">
                <span>{planName} (Quarterly)</span>
                <span className="font-bold text-[#243746]">${planBasePrice}.00</span>
              </div>
              {hasCleaningAddon && (
                <div className="flex justify-between text-xs text-[#64748B]">
                  <span>Cleaning Add-On (Quarterly)</span>
                  <span className="font-bold text-[#243746]">$50.00</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-[#243746] pt-3 border-t border-[#D9E4EC]">
                <span>Total Due Today:</span>
                <span className="text-[#294B68]">${totalQuarterlyPrice}.00</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] text-right">
                Renews automatically every 3 months. Cancel anytime.
              </p>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-[#F0F5F9] rounded-2xl border border-[#D9E4EC]/70 text-xs font-bold text-[#294B68] flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>PCI-DSS Level 1</span>
            </div>
            <div className="p-3 bg-[#F0F5F9] rounded-2xl border border-[#D9E4EC]/70 text-xs font-bold text-[#294B68] flex items-center justify-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Stripe Protected</span>
            </div>
          </div>
        </div>

        {/* Right Column: Stripe Elements Payment Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-center justify-between border-b border-[#D9E4EC] pb-4">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Payment Method
              </span>
              <h3 className="text-lg font-black text-[#243746]">
                Credit or Debit Card
              </h3>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#3F8F6B]">
              <Lock className="w-3.5 h-3.5" />
              <span>Encrypted</span>
            </div>
          </div>

          {initError ? (
            <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <h4 className="font-bold text-red-800 text-sm">Payment Gateway Notice</h4>
              <p className="text-xs text-red-600 max-w-sm mx-auto">{initError}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Retry Gateway Connection
              </button>
            </div>
          ) : isLoadingConfig || isCreatingIntent || !clientSecret ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#294B68] mx-auto" />
              <p className="text-sm font-bold text-[#243746]">
                Initializing Secure Stripe Checkout...
              </p>
              <p className="text-xs text-[#64748B]">
                Establishing bank-grade TLS encryption channel.
              </p>
            </div>
          ) : (
            <Elements stripe={getStripe(publishableKey)} options={{ clientSecret }}>
              <StripeCardElement
                clientSecret={clientSecret}
                cardholderName={cardholderName}
                onCardholderNameChange={setCardholderName}
                postalCode={billingZip}
                onPostalCodeChange={setBillingZip}
                onPaymentSuccess={handleSuccess}
                onPaymentError={(err) => console.error("Payment error:", err)}
                isProcessing={isProcessing || isSubmittingOverall}
                setIsProcessing={setIsProcessing}
                submitButtonText={`Pay $${totalQuarterlyPrice}.00 & Activate Membership`}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
