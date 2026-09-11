"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  Calendar,
  CreditCard,
  FileText,
  ShieldCheck,
  Users,
  UserCheck,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} from "@/redux/features/notification/notificationApi";
import { NotificationItem } from "@/redux/features/notification/notificationTypes";
import { formatTimeAgo } from "@/lib/utils";

export default function ClientNotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching } = useGetNotificationsQuery(
    {
      page,
      limit,
      unreadOnly: filter === "unread",
    },
    {
      pollingInterval: 8000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();
  const [deleteNotif] = useDeleteNotificationMutation();

  const notifications: NotificationItem[] = data?.data?.notifications || [];
  const pagination = data?.data?.pagination;
  const unreadCount = data?.data?.unreadCount ?? 0;
  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead().unwrap();
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = async (n: NotificationItem) => {
    if (!n.isRead) {
      try {
        await markRead(n.id).unwrap();
      } catch (err) {
        console.warn("Failed to mark notification as read:", err);
      }
    }
    if (n.link) {
      router.push(n.link);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteNotif(id).unwrap();
    } catch (err) {
      console.warn("Failed to delete notification:", err);
    }
  };

  const getIcon = (type: string, priority?: string) => {
    switch (type) {
      case "PAYMENT_FAILED":
        return <CreditCard className="w-5 h-5 text-[#C95C5C]" />;
      case "PAYMENT_SUCCESS":
      case "INVOICE_ISSUED":
      case "RENEWAL_REMINDER":
      case "SUBSCRIPTION_RENEWED":
      case "SUBSCRIPTION_CANCELLED":
      case "SUBSCRIPTION_REACTIVATED":
        return <CreditCard className="w-5 h-5 text-[#C28A3A]" />;

      case "AGREEMENT_SENT":
      case "AGREEMENT_SIGNED":
      case "AGREEMENT_EXECUTED":
        return <ShieldCheck className="w-5 h-5 text-[#3F8F6B]" />;

      case "APPOINTMENT_CREATED":
      case "APPOINTMENT_RESCHEDULED":
      case "APPOINTMENT_CANCELLED":
      case "VISIT_COMPLETED":
      case "SPECIALIST_ASSIGNED":
        return <Calendar className="w-5 h-5 text-[#294B68]" />;

      case "REPORT_READY":
        return <FileText className="w-5 h-5 text-[#5E8FB2]" />;

      case "FAMILY_MEMBER_ADDED":
        return <Users className="w-5 h-5 text-[#7C3AED]" />;

      case "ACCOUNT_CREATED":
      case "ONBOARDING_COMPLETED":
        return <UserCheck className="w-5 h-5 text-[#2563EB]" />;

      default:
        return priority === "CRITICAL" ? (
          <AlertCircle className="w-5 h-5 text-[#C95C5C]" />
        ) : (
          <Bell className="w-5 h-5 text-[#64748B]" />
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "CRITICAL":
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-[#C95C5C]/15 text-[#C95C5C] rounded-md border border-[#C95C5C]/30">
            Action Required
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-[#C28A3A]/15 text-[#C28A3A] rounded-md border border-[#C28A3A]/30">
            Important
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D9E4EC]/80">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#243746]">
              Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-black bg-[#C95C5C] text-white rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            Stay updated with your care visits, assessments, membership, and
            billing notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="px-4 py-2 text-xs font-bold text-[#294B68] bg-[#EAF3F8] hover:bg-[#D9E4EC] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Mark All Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-[#D9E4EC] shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === "all"
                ? "bg-[#294B68] text-white shadow-xs"
                : "text-[#64748B] hover:bg-[#F7FAFC]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => {
              setFilter("unread");
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
              filter === "unread"
                ? "bg-[#294B68] text-white shadow-xs"
                : "text-[#64748B] hover:bg-[#F7FAFC]"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className={`px-1.5 py-0.2 text-[10px] rounded-full ${
                  filter === "unread"
                    ? "bg-white text-[#294B68]"
                    : "bg-[#EAF3F8] text-[#294B68]"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="text-xs text-[#64748B] px-3 font-medium">
          {isFetching
            ? "Updating..."
            : `Showing ${notifications.length} of ${total}`}
        </div>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-3xl border border-[#D9E4EC] divide-y divide-[#D9E4EC]/60 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-16 text-center text-[#64748B] flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#5E8FB2]" />
            <span className="text-sm font-medium">
              Loading notifications...
            </span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-[#64748B] flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F7FAFC] border border-[#D9E4EC] flex items-center justify-center mb-3 text-[#94A3B8]">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#243746]">
              No notifications to display
            </h3>
            <p className="text-xs text-[#64748B] mt-1 max-w-sm">
              {filter === "unread"
                ? "You have marked all notifications as read."
                : "You don't have any notifications right now."}
            </p>
          </div>
        ) : (
          notifications.map((n) => {
            const isUnread = !n.isRead;
            const isCritical = n.priority === "CRITICAL";

            return (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-5 sm:p-6 flex items-start gap-4 transition-colors cursor-pointer ${
                  isUnread
                    ? isCritical
                      ? "bg-[#C95C5C]/5 hover:bg-[#C95C5C]/10"
                      : "bg-[#EAF3F8]/35 hover:bg-[#EAF3F8]/60"
                    : "hover:bg-[#F7FAFC]"
                }`}
              >
                <div
                  className={`p-3 rounded-2xl bg-white border shrink-0 mt-0.5 shadow-2xs ${
                    isCritical
                      ? "border-[#C95C5C]/40 bg-[#FFF5F5]"
                      : "border-[#D9E4EC]"
                  }`}
                >
                  {getIcon(n.type, n.priority)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <h4
                        className={`text-sm sm:text-base truncate ${
                          isUnread
                            ? "font-extrabold text-[#243746]"
                            : "font-semibold text-[#334155]"
                        }`}
                      >
                        {n.title}
                      </h4>
                      {getPriorityBadge(n.priority)}
                    </div>
                    <span className="text-xs text-[#64748B] shrink-0 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
                      {formatTimeAgo(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#475569] mt-1.5 leading-relaxed">
                    {n.message}
                  </p>

                  <div className="flex items-center justify-between gap-3 mt-3 pt-2 border-t border-[#D9E4EC]/40">
                    <div>
                      {n.link && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5E8FB2] hover:text-[#294B68] transition-colors">
                          <span>View Details</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markRead(n.id);
                          }}
                          className="text-xs font-semibold text-[#5E8FB2] hover:text-[#294B68] px-2.5 py-1 rounded-lg hover:bg-white transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, n.id)}
                        aria-label="Delete notification"
                        className="p-1.5 text-[#94A3B8] hover:text-[#C95C5C] hover:bg-white rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-[#D9E4EC] shadow-2xs">
          <div className="text-xs text-[#64748B] font-medium">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="px-3 py-1.5 rounded-xl border border-[#D9E4EC] text-xs font-bold text-[#243746] hover:bg-[#F7FAFC] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isFetching}
              className="px-3 py-1.5 rounded-xl border border-[#D9E4EC] text-xs font-bold text-[#243746] hover:bg-[#F7FAFC] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
