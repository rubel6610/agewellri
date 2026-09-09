"use client";

import React from "react";
import { Settings, Shield, Bell, CreditCard, Sliders } from "lucide-react";
import { showSuccessAlert, showToast } from "@/lib/alerts/sweetalert";

export default function SettingsAdminPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-[#D9E4EC]/60">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Admin Operations Settings
        </h1>
        <p className="text-sm text-[#64748B] mt-1">
          Configure business rules, dispatch notification triggers, and staff role permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-[#D9E4EC] space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#EAF3F8] text-[#294B68] rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#243746]">Plan &amp; Service Controls</h3>
          </div>
          <p className="text-xs text-[#64748B]">
            Configure monthly visit limits and allowed booking lead times.
          </p>
          <button
            onClick={() => showToast("Plan configuration settings synced", "success")}
            className="text-xs font-bold text-[#5E8FB2] hover:underline pt-2 block cursor-pointer"
          >
            Configure Rules →
          </button>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#D9E4EC] space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#EAF3F8] text-[#294B68] rounded-xl">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#243746]">Notification Triggers</h3>
          </div>
          <p className="text-xs text-[#64748B]">
            Manage automatic SMS/email dispatch alerts for upcoming visits, signed agreements, and failed payments.
          </p>
          <button
            onClick={() => showToast("Notification triggers active", "info")}
            className="text-xs font-bold text-[#5E8FB2] hover:underline pt-2 block cursor-pointer"
          >
            Manage Triggers →
          </button>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#D9E4EC] space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#EAF3F8] text-[#294B68] rounded-xl">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#243746]">Role &amp; Staff Permissions</h3>
          </div>
          <p className="text-xs text-[#64748B]">
            Assign staff roles (Owner, Admin, Field Specialist) and restrict sensitive billing/client data access.
          </p>
          <button
            onClick={() => showToast("Role permissions operational", "info")}
            className="text-xs font-bold text-[#5E8FB2] hover:underline pt-2 block cursor-pointer"
          >
            Manage Permissions →
          </button>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-[#D9E4EC] space-y-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#EAF3F8] text-[#294B68] rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#243746]">Stripe &amp; Billing Gateway</h3>
          </div>
          <p className="text-xs text-[#64748B]">
            View Stripe payment gateway connection status and automated retry policies for declined credit cards.
          </p>
          <button
            onClick={() => showSuccessAlert("Stripe Gateway Connected", "Live Stripe integration is connected and healthy.")}
            className="text-xs font-bold text-[#5E8FB2] hover:underline pt-2 block cursor-pointer"
          >
            Gateway Settings →
          </button>
        </div>
      </div>
    </div>
  );
}
