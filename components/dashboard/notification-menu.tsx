"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, Check, Calendar, FileText, ShieldAlert, CreditCard } from "lucide-react";
import { NotificationItem } from "@/lib/types/dashboard";

interface NotificationMenuProps {
  notifications: NotificationItem[];
}

export function NotificationMenu({ notifications: initialNotifications }: NotificationMenuProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "visit":
        return <Calendar className="w-4 h-4 text-[#294B68]" />;
      case "report":
        return <FileText className="w-4 h-4 text-[#5E8FB2]" />;
      case "billing":
        return <CreditCard className="w-4 h-4 text-[#C28A3A]" />;
      case "agreement":
        return <ShieldAlert className="w-4 h-4 text-[#3F8F6B]" />;
      default:
        return <Bell className="w-4 h-4 text-[#64748B]" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications (${unreadCount} unread)`}
        className="relative p-2.5 rounded-xl bg-white border border-[#D9E4EC] text-[#243746] hover:bg-[#F7FAFC] focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C95C5C] text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-[#D9E4EC] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 bg-[#F7FAFC] border-b border-[#D9E4EC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#243746]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-[#EAF3F8] text-[#294B68] rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-semibold text-[#5E8FB2] hover:text-[#294B68] flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-[#D9E4EC]/60">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#64748B]">
                  You&apos;re all caught up! No notifications.
                </div>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => markAsRead(item.id)}
                    className={`p-4 flex items-start gap-3 transition-colors ${
                      !item.read ? "bg-[#EAF3F8]/30 font-medium" : "hover:bg-[#F7FAFC]"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-white border border-[#D9E4EC] shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#243746] truncate">
                          {item.title}
                        </p>
                        <span className="text-[11px] text-[#64748B] shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5 leading-normal">
                        {item.message}
                      </p>
                      {item.link && (
                        <Link
                          href={item.link}
                          onClick={() => setIsOpen(false)}
                          className="inline-block text-xs font-bold text-[#5E8FB2] hover:underline mt-1.5"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-[#F7FAFC] border-t border-[#D9E4EC] text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-[#64748B] hover:text-[#243746]"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
