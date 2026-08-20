"use client";

import React, { useState } from "react";
import { X, UserPlus, Loader2, CheckCircle2 } from "lucide-react";
import { createClientAccount } from "@/lib/api/admin-api";

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddClientModal({ isOpen, onClose }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    street: "",
    city: "Providence",
    state: "RI",
    zip: "02906",
    planName: "Guardian Plus" as "Guardian Plus" | "Essential Guard" | "Cleaning Add-On" | "Standalone Cleaning",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createClientAccount(formData);
      setSuccess(true);
    } catch {
      alert("Failed to create client account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSuccess(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      street: "",
      city: "Providence",
      state: "RI",
      zip: "02906",
      planName: "Guardian Plus",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={handleReset} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#D9E4EC] shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#294B68]" />
            <h3 className="text-xl font-bold text-[#243746]">Add New Client</h3>
          </div>
          <button onClick={handleReset} className="p-2 text-[#64748B] hover:text-[#243746] rounded-xl border border-[#D9E4EC]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-[#3F8F6B] text-white rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-[#243746]">Client Profile Created!</h4>
              <p className="text-sm text-[#64748B] mt-1">
                Account created for <strong>{formData.firstName} {formData.lastName}</strong>.
                Service agreement has been dispatched to {formData.email}.
              </p>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-[#294B68] text-white font-bold rounded-xl cursor-pointer"
            >
              Done &amp; Return to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">First Name *</label>
                <input
                  required
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="Jane"
                  className="w-full h-11 px-3.5 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">Last Name *</label>
                <input
                  required
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                  className="w-full h-11 px-3.5 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">Email Address *</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane.doe@example.com"
                className="w-full h-11 px-3.5 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">Phone Number *</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(401) 555-0199"
                className="w-full h-11 px-3.5 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">Street Address *</label>
              <input
                required
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="142 Wayland Ave"
                className="w-full h-11 px-3.5 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full h-11 px-3 text-sm border border-[#D9E4EC] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full h-11 px-3 text-sm border border-[#D9E4EC] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#243746] mb-1">ZIP Code</label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="w-full h-11 px-3 text-sm border border-[#D9E4EC] rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#243746] mb-1">Selected Plan *</label>
              <select
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value as any })}
                className="w-full h-11 px-3.5 text-sm border border-[#D9E4EC] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5E8FB2]"
              >
                <option value="Guardian Plus">Guardian Plus (12 Visits / Qtr)</option>
                <option value="Essential Guard">Essential Guard (6 Safety Visits / Qtr)</option>
                <option value="Cleaning Add-On">Cleaning Add-On (6 Cleaning Visits / Qtr)</option>
                <option value="Standalone Cleaning">Standalone Cleaning (1 Visit)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#294B68] hover:bg-[#1E374D] text-white font-bold text-base rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <span>Create Account &amp; Send Agreement</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
