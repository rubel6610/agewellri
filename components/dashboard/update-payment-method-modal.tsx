"use client";

import React, { useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/stripe-client";
import {
  useGetStripeConfigQuery,
  useCreateSetupIntentMutation,
  useSavePaymentMethodMutation,
} from "@/redux/features/payment/paymentApi";
import { X, CreditCard, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface UpdatePaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function CardForm({
  clientSecret,
  onClose,
  onSuccess,
}: {
  clientSecret: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savePaymentMethod] = useSavePaymentMethodMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    if (!cardholderName.trim()) {
      setErrorMsg("Please enter the name on the card.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const { setupIntent, error } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(error.message || "Failed to confirm card details.");
        setIsProcessing(false);
        return;
      }

      if (setupIntent && setupIntent.payment_method) {
        const paymentMethodId =
          typeof setupIntent.payment_method === "string"
            ? setupIntent.payment_method
            : setupIntent.payment_method.id;

        await savePaymentMethod({
          paymentMethodId,
          setAsDefault: true,
        }).unwrap();

        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err.data?.message || err.message || "Unable to save payment method.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMsg && (
        <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
          Name on Card *
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Jane Doe"
          className="w-full h-11 px-3.5 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
          Card Information *
        </label>
        <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-[#D9E4EC] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#5E8FB2] transition-all">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "14px",
                  color: "#243746",
                  fontFamily: "Inter, system-ui, sans-serif",
                  "::placeholder": { color: "#94A3B8" },
                },
                invalid: { color: "#E53E3E" },
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9E4EC]">
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="px-5 py-2.5 rounded-xl border border-[#D9E4EC] text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC] cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isProcessing || !stripe}
          className="px-6 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Card...</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span>Save &amp; Set as Default</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export function UpdatePaymentMethodModal({
  isOpen,
  onClose,
  onSuccess,
}: UpdatePaymentMethodModalProps) {
  const { data: configData } = useGetStripeConfigQuery();
  const [createSetupIntent, { isLoading: isCreatingIntent }] = useCreateSetupIntentMutation();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [initError, setInitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setInitError(null);
      createSetupIntent()
        .unwrap()
        .then((res) => {
          if (res?.data?.clientSecret) {
            setClientSecret(res.data.clientSecret);
          } else {
            setInitError(res?.message || "Failed to initialize payment gateway.");
          }
        })
        .catch((err) => {
          setInitError(err.data?.message || "Unable to connect to Stripe.");
        });
    } else {
      setClientSecret(null);
    }
  }, [isOpen, createSetupIntent]);

  if (!isOpen) return null;

  const publishableKey =
    configData?.data?.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#D9E4EC] p-6 sm:p-8 space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D9E4EC] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF3F8] text-[#294B68] flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#243746]">Update Payment Method</h3>
              <p className="text-xs text-[#64748B]">Set your default card for future renewals</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8FAFC] hover:bg-[#F0F5F9] text-[#64748B] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-50 text-[#3F8F6B] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-[#243746]">Payment Method Updated!</h4>
            <p className="text-xs text-[#64748B]">Your default card has been updated successfully.</p>
          </div>
        ) : initError ? (
          <div className="p-4 bg-red-50 rounded-2xl border border-red-200 text-center space-y-2 text-xs text-red-700">
            <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
            <p className="font-bold">{initError}</p>
          </div>
        ) : isCreatingIntent || !clientSecret ? (
          <div className="py-12 text-center space-y-2">
            <Loader2 className="w-7 h-7 animate-spin text-[#294B68] mx-auto" />
            <p className="text-xs font-bold text-[#64748B]">Connecting to secure gateway...</p>
          </div>
        ) : (
          <Elements stripe={getStripe(publishableKey)} options={{ clientSecret }}>
            <CardForm
              clientSecret={clientSecret}
              onClose={onClose}
              onSuccess={() => {
                setIsSuccess(true);
                setTimeout(() => {
                  onSuccess();
                  onClose();
                }, 1200);
              }}
            />
          </Elements>
        )}
      </div>
    </div>
  );
}
