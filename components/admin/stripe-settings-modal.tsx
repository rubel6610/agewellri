"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CreditCard,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
  Lock,
} from "lucide-react";
import {
  useGetAdminStripeSettingsQuery,
  useUpdateAdminStripeSettingsMutation,
  useTestStripeConnectionMutation,
} from "@/redux/features/payment/paymentApi";
import { showSuccessAlert, showErrorAlert } from "@/lib/alerts/sweetalert";

interface StripeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StripeSettingsModal({ isOpen, onClose }: StripeSettingsModalProps) {
  const { data: response, isLoading: isFetching, refetch } = useGetAdminStripeSettingsQuery(undefined, {
    skip: !isOpen,
  });
  const [updateSettings, { isLoading: isSaving }] = useUpdateAdminStripeSettingsMutation();
  const [testConnection, { isLoading: isTesting }] = useTestStripeConnectionMutation();

  const settings = response?.data;

  const [publishableKey, setPublishableKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [isLiveMode, setIsLiveMode] = useState(false);

  const [showPublishableKey, setShowPublishableKey] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  useEffect(() => {
    if (settings) {
      setPublishableKey(settings.publishableKey || "");
      setSecretKey(settings.maskedSecretKey || "");
      setWebhookSecret(settings.maskedWebhookSecret || "");
      setIsLiveMode(settings.isLiveMode ?? false);
    }
  }, [settings]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    try {
      const payload: { secretKey?: string; publishableKey?: string } = {};
      if (secretKey && !secretKey.includes("•")) {
        payload.secretKey = secretKey.trim();
      }
      if (publishableKey) {
        payload.publishableKey = publishableKey.trim();
      }

      const res = await testConnection(payload).unwrap();
      showSuccessAlert(
        "Connection Verified!",
        res.message || "Stripe API responded successfully."
      );
    } catch (err: any) {
      showErrorAlert(
        "Connection Failed",
        err.data?.message || err.message || "Failed to communicate with Stripe."
      );
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!publishableKey.trim()) {
      showErrorAlert("Required Field", "Please enter a Stripe Publishable Key.");
      return;
    }

    if (!secretKey.trim()) {
      showErrorAlert("Required Field", "Please enter a Stripe Secret or Restricted Key.");
      return;
    }

    try {
      await updateSettings({
        publishableKey: publishableKey.trim(),
        secretKey: secretKey.trim(),
        webhookSecret: webhookSecret.trim() || undefined,
        isLiveMode,
      }).unwrap();

      showSuccessAlert(
        "Stripe Gateway Updated",
        "Your Stripe credentials have been saved to the database and reloaded in the server."
      );
      refetch();
      onClose();
    } catch (err: any) {
      showErrorAlert(
        "Save Failed",
        err.data?.message || err.message || "Unable to save Stripe settings."
      );
    }
  };

  const isConfigured = settings?.isConfigured;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#D9E4EC] my-8 overflow-hidden relative animate-scaleUp">
        {/* Header */}
        <div className="p-6 border-b border-[#D9E4EC] flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#294B68] text-white flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-[#243746]">Stripe Gateway Configuration</h3>
                {isConfigured ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3" />
                    {settings?.isLiveMode ? "Live Mode" : "Test Mode"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertTriangle className="w-3 h-3" />
                    Unconfigured
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Manage your payment gateway credentials stored securely in the database.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F8FAFC] hover:bg-[#F0F5F9] text-[#64748B] hover:text-[#243746] flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {isFetching ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#294B68] mx-auto" />
            <p className="text-xs font-bold text-[#64748B]">Loading gateway configuration...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-5">
            {/* Source info pill */}
            <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-xs">
              <div className="flex items-center gap-2 text-[#475569]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Active Source:{" "}
                  <strong className="text-[#1E293B] uppercase font-bold">
                    {settings?.source === "db" ? "(Database)" : settings?.source === "env" ? "Fallback (.env file)" : "None"}
                  </strong>
                </span>
              </div>
              {settings?.lastTestedAt && (
                <span className="text-[11px] text-[#64748B]">
                  Last verified: {new Date(settings.lastTestedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Publishable Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider">
                  Publishable Key (pk_...) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPublishableKey(!showPublishableKey)}
                  className="text-[11px] font-bold text-[#294B68] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showPublishableKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPublishableKey ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPublishableKey ? "text" : "password"}
                  required
                  value={publishableKey}
                  onChange={(e) => setPublishableKey(e.target.value)}
                  placeholder="pk_test_... or pk_live_..."
                  className="w-full h-11 px-3.5 text-xs font-mono text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Required on the website frontend for Stripe Elements credit card input fields.
              </p>
            </div>

            {/* Secret / Restricted Key */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider">
                  Secret or Restricted Key (rk_... / sk_...) *
                </label>
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="text-[11px] font-bold text-[#294B68] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showSecretKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showSecretKey ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showSecretKey ? "text" : "password"}
                  required
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="rk_test_... or sk_test_..."
                  className="w-full h-11 px-3.5 text-xs font-mono text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Never shared publicly. Used on the server for subscriptions and recurring renewals.
              </p>
            </div>

            {/* Webhook Secret */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-[#243746] uppercase tracking-wider">
                  Webhook Signing Secret (whsec_...)
                </label>
                <button
                  type="button"
                  onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                  className="text-[11px] font-bold text-[#294B68] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {showWebhookSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showWebhookSecret ? "Hide" : "Show"}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showWebhookSecret ? "text" : "password"}
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="w-full h-11 px-3.5 text-xs font-mono text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
                />
              </div>
              <p className="text-[11px] text-[#64748B] mt-1">
                Verifies that incoming Stripe webhook events are authentic.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#D9E4EC]">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || isSaving || !secretKey}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#243746] text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Testing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Test Connection</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2.5 border border-[#D9E4EC] text-[#64748B] hover:bg-[#F8FAFC] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#294B68] hover:bg-[#1E374D] text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving &amp; Reloading...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Save &amp; Apply Keys</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
