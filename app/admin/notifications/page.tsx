"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminNotifications } from "@/lib/api/admin-api";
import { AdminNotification } from "@/lib/types/admin";
import { Bell, Check, AlertTriangle, UserPlus, CreditCard, FileCheck } from "lucide-react";

export default function NotificationsAdminPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-[#64748B] bg-white rounded-3xl border border-[#D9E4EC]">
        Loading operational notifications...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#D9E4EC]/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
            Operational Notification Center
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Real-time alerts for client registrations, signed agreements, and failed payments.
          </p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-4 py-2 text-xs font-bold text-[#294B68] bg-[#EAF3F8] hover:bg-[#D9E4EC] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Mark All Read</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#D9E4EC] divide-y divide-[#D9E4EC]/60 p-2 shadow-xs">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-5 flex items-start gap-4 transition-colors rounded-xl ${
              !n.read ? "bg-[#EAF3F8]/30 font-medium" : "hover:bg-[#F7FAFC]"
            }`}
          >
            <div className="p-3 bg-[#F7FAFC] rounded-xl border border-[#D9E4EC] text-[#294B68] shrink-0 mt-0.5">
              {n.type === "payment" ? (
                <CreditCard className="w-5 h-5 text-[#C95C5C]" />
              ) : n.type === "agreement" ? (
                <FileCheck className="w-5 h-5 text-[#3F8F6B]" />
              ) : (
                <UserPlus className="w-5 h-5 text-[#5E8FB2]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-base font-bold text-[#243746] truncate">{n.title}</h4>
                <span className="text-xs text-[#64748B] shrink-0">{n.timestamp}</span>
              </div>
              <p className="text-sm text-[#64748B] mt-1">{n.message}</p>
              {n.link && (
                <Link
                  href={n.link}
                  className="inline-block text-xs font-bold text-[#5E8FB2] hover:underline mt-2"
                >
                  Action Link →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
