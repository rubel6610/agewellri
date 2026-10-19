"use client";

import React, { useState } from "react";
import { AlertTriangle, KeyRound, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useGetAdminStripeSettingsQuery } from "@/redux/features/payment/paymentApi";
import { StripeSettingsModal } from "./stripe-settings-modal";

export function StripeUnconfiguredBanner() {
  const { data, isLoading } = useGetAdminStripeSettingsQuery();
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading || !data?.data) return null;

  const settings = data.data;

  // If already configured and has both keys, do not render warning banner
  if (settings.isConfigured && settings.hasSecretKey && settings.hasPublishableKey) {
    return (
      <>
        <StripeSettingsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </>
    );
  }

  const isPartiallyConfigured = settings.hasSecretKey || settings.hasPublishableKey;

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs transition-all animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm sm:text-base font-extrabold text-[#1E293B]">
                  Payment Gateway Action Required: Stripe Not Configured
                </h4>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-md border border-amber-300">
                  {isPartiallyConfigured ? "Missing Keys" : "No Keys Set"}
                </span>
              </div>
              <p className="text-xs text-[#475569] mt-1 leading-relaxed max-w-2xl">
                {!settings.hasPublishableKey && !settings.hasSecretKey
                  ? "Clients cannot sign up, update cards, or renew memberships because Stripe API keys have not been configured yet."
                  : !settings.hasPublishableKey
                    ? "Stripe Publishable Key is missing! Card forms and client checkout will fail until it is added."
                    : "Stripe Secret Key is missing! Recurring renewals and subscription creation will fail."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Configure Stripe Keys</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <StripeSettingsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
