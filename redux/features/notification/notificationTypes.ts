export type NotificationType =
  | "ACCOUNT_CREATED"
  | "AGREEMENT_SENT"
  | "AGREEMENT_SIGNED"
  | "AGREEMENT_EXECUTED"
  | "ONBOARDING_COMPLETED"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "INVOICE_ISSUED"
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_RESCHEDULED"
  | "APPOINTMENT_CANCELLED"
  | "VISIT_COMPLETED"
  | "SPECIALIST_ASSIGNED"
  | "REPORT_READY"
  | "RENEWAL_REMINDER"
  | "SUBSCRIPTION_RENEWED"
  | "SUBSCRIPTION_CANCELLED"
  | "SUBSCRIPTION_REACTIVATED"
  | "FAMILY_MEMBER_ADDED"
  | string;

export type NotificationPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any> | null;
  readAt: string | null;
  isRead: boolean;
  createdAt: string;
  link: string;
  priority: NotificationPriority;
}

export interface NotificationPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface GetNotificationsResponse {
  notifications: NotificationItem[];
  pagination: NotificationPagination;
  unreadCount: number;
  readCount?: number;
  totalCount?: number;
}

export interface GetNotificationsQueryParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
  readOnly?: boolean;
  status?: "all" | "unread" | "read";
  type?: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
  readCount?: number;
  totalCount?: number;
}
