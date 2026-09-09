"use client";

import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/stripe-client";
import {
  useCreateSetupIntentMutation,
  useGetStripeConfigQuery,
} from "@/redux/features/payment/paymentApi";
import { useGetActivePlansQuery } from "@/redux/features/plan/planApi";
import { StripeCardElement } from "./stripe-card-element";
import {
  ShieldCheck,
  Lock,
  Loader2,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Calendar,
} from "lucide-react";

interface PaymentStepCardProps {
  selectedPlan: string;
  hasCleaningAddon: boolean;
  clientFullName?: string;
  clientEmail?: string;
  clientPostalCode?: string;
  onBackToAgreement?: () => void;
  onPaymentSuccess?: (setupIntentId: string, paymentMethodId: string) => Promise<void>;
  onPaymentConfirmed?: (setupIntentId: string, paymentMethodId: string) => Promise<void>;
  isSubmittingOverall?: boolean;
}

export function PaymentStepCard({
  selectedPlan,
  hasCleaningAddon,
  clientFullName = "",
  clientEmail = "",
  clientPostalCode = "",
  onBackToAgreement,
  onPaymentSuccess,
  onPaymentConfirmed,
  isSubmittingOverall = false,
}: PaymentStepCardProps) {
  const { data: configData, isLoading: isLoadingConfig } = useGetStripeConfigQuery();
  const { data: activePlans = [] } = useGetActivePlansQuery();
  const [createSetupIntent, { isLoading: isCreatingIntent }] =
    useCreateSetupIntentMutation();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState(clientFullName || "");
  const [billingZip, setBillingZip] = useState(clientPostalCode || "");
  const [initError, setInitError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dynamically resolve plan info
  const planObj =
    activePlans.find((p) => p.code === selectedPlan || p.id === selectedPlan) ||
    activePlans[0] ||
    null;

  const planName = planObj?.name || (selectedPlan === "GUARDIAN_PLUS" ? "Guardian Plus" : "Essential Guard");
  const planBasePrice = planObj?.price ?? (selectedPlan === "GUARDIAN_PLUS" ? 1892 : 995);
  const addonPrice = hasCleaningAddon ? 60 : 0;
  const totalDueToday = planBasePrice + addonPrice;
  const billingInterval = planObj?.billingInterval || "MONTHLY";
  const isOneTime = billingInterval === "ONE_TIME";

  // Create SetupIntent on mount or when plan changes
  useEffect(() => {
    let isMounted = true;

    async function initSetupIntent() {
      try {
        setInitError(null);
        const res = await createSetupIntent({
          plan: selectedPlan as any,
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
    if (onPaymentSuccess) {
      await onPaymentSuccess(setupIntentId, paymentMethodId);
    } else if (onPaymentConfirmed) {
      await onPaymentConfirmed(setupIntentId, paymentMethodId);
    }
    setIsProcessing(false);
  };

  const publishableKey =
    configData?.data?.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-400">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D9E4EC]">
        <div>
          {onBackToAgreement && (
            <button
              type="button"
              onClick={onBackToAgreement}
              disabled={isProcessing || isSubmittingOverall}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] transition-colors mb-2 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Service Agreement</span>
            </button>
          )}
          <h2 className="text-2xl font-extrabold text-[#243746]">
            Secure Payment &amp; Membership Activation
          </h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Authorize your contracted membership rate via secure Stripe card checkout.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#EAF3F8] text-[#294B68] rounded-full border border-[#5E8FB2]/30 text-xs font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#3F8F6B]" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {/* Grid Layout: Plan Summary Left, Payment Form Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 bg-[#F8FAFC] rounded-3xl border border-[#D9E4EC] space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] block">
              Contracted Plan Terms
            </span>

            {/* Plan Badge Card */}
            <div className="p-4 bg-white rounded-2xl border border-[#D9E4EC] space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#294B68] text-white flex items-center justify-center font-bold">
                    <Shield className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#243746]">
                      {planName}
                    </h3>
                    <span className="text-[11px] text-[#64748B] font-semibold">
                      {planObj?.totalVisits || (selectedPlan === "GUARDIAN_PLUS" ? 12 : 6)} Visits / {billingInterval.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Features Included */}
              <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] space-y-2 text-[11px] text-[#475569]">
                {(planObj?.services || []).map((srv, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3F8F6B] shrink-0" />
                    <span>
                      {srv.allocatedVisits} {srv.serviceName} visits
                    </span>
                  </div>
                ))}
                {hasCleaningAddon && (
                  <div className="flex items-center gap-2 text-[#3F8F6B] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3F8F6B] shrink-0" />
                    <span>+6 Cleaning Add-On Visits Included</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[#64748B]">
                  <Calendar className="w-3.5 h-3.5 text-[#5E8FB2] shrink-0" />
                  <span>Immediate booking calendar access</span>
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 pt-2 border-t border-[#D9E4EC]">
              <div className="flex justify-between text-xs text-[#64748B]">
                <span>{planName}</span>
                <span className="font-bold text-[#243746]">${planBasePrice}.00</span>
              </div>
              {hasCleaningAddon && (
                <div className="flex justify-between text-xs text-[#64748B]">
                  <span>Cleaning Add-On (6 Visits)</span>
                  <span className="font-bold text-[#243746]">$60.00</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-[#243746] pt-3 border-t border-[#D9E4EC]">
                <span>Amount:</span>
                <span className="text-[#294B68]">${totalDueToday}.00</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] text-right">
                {isOneTime
                  ? "One-time charge. No recurring subscription."
                  : `Contracted rate billed ${billingInterval.toLowerCase()}. Cancel anytime.`}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-[#D9E4EC] pb-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Secure Stripe Checkout
                </span>
                <h3 className="text-lg font-black text-[#243746]">
                  Pay with Credit or Debit Card
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
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#294B68] mx-auto" />
                <p className="text-sm font-bold text-[#243746]">
                  Initializing Secure Stripe Gateway...
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
                  submitButtonText={`Pay $${totalDueToday}.00 & Activate Membership`}
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
