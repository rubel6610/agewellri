"use client";

import React, { useState } from "react";
import { Home, User, Phone, Mail, ArrowRight, ArrowLeft } from "lucide-react";

interface Step3ResidentDetailsProps {
  accountHolder: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  initialData?: {
    isSameAsAccountHolder: boolean;
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    email: string;
  };
  onSave: (residentData: {
    isSameAsAccountHolder: boolean;
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    email: string;
  }) => void;
  onBack: () => void;
}

const US_STATES = [
  { code: "RI", name: "Rhode Island" },
];

export function Step3ResidentDetails({
  accountHolder,
  initialData,
  onSave,
  onBack,
}: Step3ResidentDetailsProps) {
  const [isSameAsAccountHolder, setIsSameAsAccountHolder] = useState(
    initialData?.isSameAsAccountHolder ?? true
  );

  const defaultFullName = `${accountHolder.firstName} ${accountHolder.lastName}`.trim();

  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || (isSameAsAccountHolder ? defaultFullName : ""),
    address: initialData?.address || "",
    city: initialData?.city || "Providence",
    state: initialData?.state || "RI",
    postalCode: initialData?.postalCode || "02906",
    phone: initialData?.phone || (isSameAsAccountHolder ? accountHolder.phone : ""),
    email: initialData?.email || (isSameAsAccountHolder ? accountHolder.email : ""),
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleToggleSame = (checked: boolean) => {
    setIsSameAsAccountHolder(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        fullName: defaultFullName,
        phone: accountHolder.phone,
        email: accountHolder.email,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter the resident's full legal name.");
      return;
    }

    if (!formData.address.trim()) {
      setErrorMessage("Please enter the residence street address.");
      return;
    }

    if (!formData.city.trim()) {
      setErrorMessage("Please enter the city.");
      return;
    }

    if (!formData.postalCode.trim() || formData.postalCode.length < 5) {
      setErrorMessage("Please enter a valid 5-digit postal code.");
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMessage("Please enter a primary phone number for the residence.");
      return;
    }

    onSave({
      isSameAsAccountHolder,
      fullName: formData.fullName.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim().toUpperCase(),
      postalCode: formData.postalCode.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EAF3F8] text-[#294B68] text-xs font-bold uppercase tracking-wider">
          Step 3 of 9
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
          Resident &amp; Home Address
        </h2>
        <p className="text-sm text-[#5E8FB2] max-w-md mx-auto">
          Please provide the primary residence address where AgeWellRI technicians will deliver services.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-[#D9E4EC] p-6 sm:p-8 shadow-sm space-y-6"
      >
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm font-medium flex items-start gap-2.5 animate-in fade-in">
            <span className="font-bold shrink-0">Error:</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Same as Account Holder Toggle Card */}
        <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-[#D9E4EC] flex items-center justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-[#243746]">
              Who is receiving service?
            </h4>
            <p className="text-xs text-[#64748B] mt-0.5">
              Check if the primary resident is the same person as the account holder.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isSameAsAccountHolder}
              onChange={(e) => handleToggleSame(e.target.checked)}
              className="w-5 h-5 rounded border-[#D9E4EC] text-[#294B68] focus:ring-[#5E8FB2] cursor-pointer"
            />
            <span className="text-xs font-bold text-[#243746]">
              I am the resident
            </span>
          </label>
        </div>

        {/* Resident Full Name */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Primary Resident Full Legal Name *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Eleanor Vance"
              className="w-full h-12 pl-11 pr-4 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
            />
            <User className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Street Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
            Street Address *
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Benefit Street, Apt 4B"
              className="w-full h-12 pl-11 pr-4 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
            />
            <Home className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* City, State, Zip Code Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5 sm:col-span-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              City *
            </label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Providence"
              className="w-full h-12 px-4 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              State *
            </label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full h-12 px-4 text-sm font-semibold text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all cursor-pointer"
            >
              {US_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Zip Code *
            </label>
            <input
              type="text"
              required
              maxLength={10}
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              placeholder="02906"
              className="w-full h-12 px-4 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
            />
          </div>
        </div>

        {/* Resident Phone & Email Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Resident Phone Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(401) 555-0123"
                className="w-full h-12 pl-11 pr-4 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
              />
              <Phone className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Resident Email (Optional)
            </label>
            <div className="relative">
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="resident@example.com"
                className="w-full h-12 pl-11 pr-4 text-sm font-medium text-[#243746] bg-[#F8FAFC] border border-[#D9E4EC] rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all"
              />
              <Mail className="w-5 h-5 text-[#94A3B8] absolute left-3.5 top-3.5" />
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#D9E4EC]">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#D9E4EC] bg-white text-sm font-bold text-[#64748B] hover:text-[#243746] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#294B68] hover:bg-[#1E374D] text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer group"
          >
            <span>Continue to Authorized Recipients</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
