"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  Calendar,
  FileText,
  ShieldCheck,
  CreditCard,
  Users,
  UserCheck,
  ExternalLink,
  Loader2,
  RotateCw,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from "@/redux/features/notification/notificationApi";
import { NotificationItem } from "@/redux/features/notification/notificationTypes";
import { useAppSelector } from "@/redux/hooks";
import { formatTimeAgo } from "@/lib/utils";

interface NotificationMenuProps {
  notifications?: any[]; // For backwards-compatibility with existing props
}

export function NotificationMenu({}: NotificationMenuProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const authUser = useAppSelector((state) => state.auth.user);
  const isAdmin = authUser?.role === "ADMIN";

  // 1. Fetch unread count for bell badge (polls periodically and refetches on focus/reconnect)
  const {
    data: unreadRes,
    refetch: refetchUnread,
    isFetching: isFetchingUnread,
  } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 10000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  // 2. Fetch latest 10 notifications on-demand when dropdown is open
  const {
    data: notifRes,
    isLoading,
    refetch: refetchNotifs,
    isFetching: isFetchingNotifs,
  } = useGetNotificationsQuery(
    { limit: 10 },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      skip: !isOpen,
    }
  );
  const notifications: NotificationItem[] = notifRes?.data?.notifications || [];

  const unreadCount = Number(
    unreadRes?.data?.unreadCount ??
    (unreadRes as any)?.unreadCount ??
    (unreadRes as any)?.data?.data?.unreadCount ??
    notifications.filter((n) => !n.isRead).length ??
    0
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();

  const isRefreshing = isFetchingUnread || isFetchingNotifs;

  const handleManualRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await Promise.all([refetchUnread(), refetchNotifs()]);
    } catch (err) {
      console.warn("Failed to manually refresh notifications:", err);
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAllRead().unwrap();
    } catch (err) {
      console.warn("Failed to mark all notifications as read:", err);
    }
  };

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markRead(item.id).unwrap();
      } catch (err) {
        console.warn("Failed to mark notification as read:", err);
      }
    }
    setIsOpen(false);
    if (item.link) {
      router.push(item.link);
    }
  };

  const getIcon = (type: string, priority?: string) => {
    const isCritical = priority === "CRITICAL";

    switch (type) {
      case "PAYMENT_FAILED":
        return <CreditCard className="w-4 h-4 text-[#C95C5C]" />;
      case "PAYMENT_SUCCESS":
      case "INVOICE_ISSUED":
      case "RENEWAL_REMINDER":
      case "SUBSCRIPTION_RENEWED":
      case "SUBSCRIPTION_CANCELLED":
      case "SUBSCRIPTION_REACTIVATED":
        return <CreditCard className="w-4 h-4 text-[#C28A3A]" />;

      case "AGREEMENT_SENT":
      case "AGREEMENT_SIGNED":
      case "AGREEMENT_EXECUTED":
        return <ShieldCheck className="w-4 h-4 text-[#3F8F6B]" />;

      case "APPOINTMENT_CREATED":
      case "APPOINTMENT_RESCHEDULED":
      case "APPOINTMENT_CANCELLED":
      case "VISIT_COMPLETED":
      case "SPECIALIST_ASSIGNED":
        return <Calendar className="w-4 h-4 text-[#294B68]" />;

      case "REPORT_READY":
        return <FileText className="w-4 h-4 text-[#5E8FB2]" />;

      case "FAMILY_MEMBER_ADDED":
        return <Users className="w-4 h-4 text-[#7C3AED]" />;

      case "ACCOUNT_CREATED":
      case "ONBOARDING_COMPLETED":
        return <UserCheck className="w-4 h-4 text-[#2563EB]" />;

      default:
        return isCritical ? (
          <Bell className="w-4 h-4 text-[#C95C5C]" />
        ) : (
          <Bell className="w-4 h-4 text-[#64748B]" />
        );
    }
  };

  const fullNotificationsUrl = isAdmin
    ? "/admin/notifications"
    : "/dashboard/notifications";

  return (
    <div className="relative">
      {/* Bell Button with Clean Top-Right Red Count Badge */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Notifications (${unreadCount} unread)`}
        className="relative p-2.5 rounded-xl bg-white border border-[#D9E4EC] text-[#243746] hover:bg-[#F7FAFC] focus:outline-none focus:ring-2 focus:ring-[#5E8FB2] transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center"
      >
        <Bell className="w-5 h-5 text-[#243746]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 text-xs font-bold text-[#DC2626] leading-none pointer-events-none select-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl border border-[#D9E4EC] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header with Title, Badge, Refresh, and Mark Read */}
            <div className="p-4 bg-[#F7FAFC] border-b border-[#D9E4EC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#243746]">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-bold bg-[#EAF3F8] text-[#294B68] rounded-full">
                    {unreadCount} new
                  </span>
                )}
                {/* Small Refresh Button */}
                <button
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  title="Refresh notifications"
                  aria-label="Refresh notifications"
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#294B68] hover:bg-[#EAF3F8] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 ${
                      isRefreshing ? "animate-spin text-[#5E8FB2]" : ""
                    }`}
                  />
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  className="text-xs font-semibold text-[#5E8FB2] hover:text-[#294B68] flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-84 overflow-y-auto divide-y divide-[#D9E4EC]/60">
              {isLoading ? (
                <div className="p-8 text-center text-[#64748B] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#5E8FB2]" />
                  <span className="text-xs">Loading notifications...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#64748B]">
                  <div className="w-10 h-10 rounded-full bg-[#F1F5F9] mx-auto flex items-center justify-center mb-2">
                    <Bell className="w-5 h-5 text-[#94A3B8]" />
                  </div>
                  You&apos;re all caught up! No notifications.
                </div>
              ) : (
                notifications.map((item) => {
                  const isUnread = !item.isRead;
                  const isCritical = item.priority === "CRITICAL";

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                        isUnread
                          ? isCritical
                            ? "bg-[#C95C5C]/5 hover:bg-[#C95C5C]/10"
                            : "bg-[#EAF3F8]/40 hover:bg-[#EAF3F8]/70"
                          : "hover:bg-[#F7FAFC]"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl bg-white border shrink-0 mt-0.5 shadow-2xs ${
                          isCritical
                            ? "border-[#C95C5C]/40 bg-[#FFF5F5]"
                            : "border-[#D9E4EC]"
                        }`}
                      >
                        {getIcon(item.type, item.priority)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`text-xs sm:text-sm truncate ${
                              isUnread
                                ? "font-bold text-[#243746]"
                                : "font-medium text-[#475569]"
                            }`}
                          >
                            {item.title}
                          </p>
                          <span className="text-[10px] sm:text-[11px] text-[#64748B] shrink-0">
                            {formatTimeAgo(item.createdAt)}
                          </span>
                        </div>

                        <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed line-clamp-2">
                          {item.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          {item.link ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5E8FB2] hover:text-[#294B68]">
                              View Details
                              <ExternalLink className="w-3 h-3" />
                            </span>
                          ) : (
                            <span />
                          )}

                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-[#5E8FB2] shrink-0" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#F7FAFC] border-t border-[#D9E4EC] flex items-center justify-between">
              <Link
                href={fullNotificationsUrl}
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-[#294B68] hover:text-[#5E8FB2] transition-colors"
              >
                View All Notifications →
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-medium text-[#64748B] hover:text-[#243746] cursor-pointer"
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
