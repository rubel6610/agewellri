import Swal, { SweetAlertOptions, SweetAlertResult } from "sweetalert2";

/**
 * AgeWellRI SweetAlert2 theme preset with refined design system tokens
 */
const customSwal = Swal.mixin({
  customClass: {
    popup: "rounded-3xl p-6 sm:p-8 border border-[#D9E4EC] shadow-2xl font-sans",
    title: "text-xl sm:text-2xl font-black text-[#243746] tracking-tight mb-2",
    htmlContainer: "text-sm text-[#5E8FB2] font-medium leading-relaxed",
    confirmButton:
      "px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#294B68] hover:bg-[#1E374D] shadow-md transition-all cursor-pointer mx-1.5 focus:outline-none focus:ring-2 focus:ring-[#294B68]/40",
    cancelButton:
      "px-6 py-3 rounded-xl font-bold text-sm text-[#64748B] bg-[#F0F5F9] hover:bg-[#E2E8F0] border border-[#D9E4EC] transition-all cursor-pointer mx-1.5 focus:outline-none",
    denyButton:
      "px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#C95C5C] hover:bg-[#A84444] shadow-md transition-all cursor-pointer mx-1.5 focus:outline-none focus:ring-2 focus:ring-red-300",
  },
  buttonsStyling: false,
});

/**
 * Standard confirmation dialog for DELETE or permanent destructive actions.
 */
export async function confirmDelete(options?: {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}): Promise<boolean> {
  const result: SweetAlertResult = await customSwal.fire({
    title: options?.title || "Are you sure you want to delete?",
    text: options?.text || "This action cannot be undone and will permanently remove this record.",
    icon: "warning",
    iconColor: "#C95C5C",
    showCancelButton: true,
    confirmButtonText: options?.confirmButtonText || "Yes, Delete",
    cancelButtonText: options?.cancelButtonText || "Cancel",
    customClass: {
      popup: "rounded-3xl p-6 sm:p-8 border border-red-100 shadow-2xl font-sans",
      title: "text-xl sm:text-2xl font-black text-[#243746] tracking-tight mb-2",
      htmlContainer: "text-sm text-[#64748B] font-medium leading-relaxed",
      confirmButton:
        "px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-[#C95C5C] hover:bg-[#B04A4A] shadow-md transition-all cursor-pointer mx-1.5 focus:outline-none focus:ring-2 focus:ring-red-400",
      cancelButton:
        "px-6 py-3 rounded-xl font-bold text-sm text-[#64748B] bg-[#F0F5F9] hover:bg-[#E2E8F0] border border-[#D9E4EC] transition-all cursor-pointer mx-1.5 focus:outline-none",
    },
    reverseButtons: true,
  });

  return result.isConfirmed;
}

/**
 * Confirmation dialog for EDIT or sensitive UPDATE actions.
 */
export async function confirmEdit(options?: {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}): Promise<boolean> {
  const result: SweetAlertResult = await customSwal.fire({
    title: options?.title || "Save Changes?",
    text: options?.text || "Are you sure you want to apply these updates?",
    icon: "question",
    iconColor: "#5E8FB2",
    showCancelButton: true,
    confirmButtonText: options?.confirmButtonText || "Yes, Save",
    cancelButtonText: options?.cancelButtonText || "Cancel",
    reverseButtons: true,
  });

  return result.isConfirmed;
}

/**
 * General Critical Action confirmation dialog (e.g. Cancel Subscription, Deactivate, Revoke).
 */
export async function confirmCriticalAction(options: {
  title: string;
  text: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  icon?: "warning" | "error" | "info" | "question";
  isDestructive?: boolean;
}): Promise<boolean> {
  const isDestructive = options.isDestructive ?? true;

  const result: SweetAlertResult = await customSwal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon || (isDestructive ? "warning" : "question"),
    iconColor: isDestructive ? "#C95C5C" : "#294B68",
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || "Confirm",
    cancelButtonText: options.cancelButtonText || "Cancel",
    customClass: {
      popup: `rounded-3xl p-6 sm:p-8 border ${isDestructive ? "border-amber-200" : "border-[#D9E4EC]"} shadow-2xl font-sans`,
      title: "text-xl sm:text-2xl font-black text-[#243746] tracking-tight mb-2",
      htmlContainer: "text-sm text-[#64748B] font-medium leading-relaxed",
      confirmButton: isDestructive
        ? "px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-[#C95C5C] hover:bg-[#B04A4A] shadow-md transition-all cursor-pointer mx-1.5 focus:outline-none focus:ring-2 focus:ring-red-400"
        : "px-6 py-3 rounded-xl font-extrabold text-sm text-white bg-[#294B68] hover:bg-[#1E374D] shadow-md transition-all cursor-pointer mx-1.5 focus:outline-none focus:ring-2 focus:ring-[#294B68]/40",
      cancelButton:
        "px-6 py-3 rounded-xl font-bold text-sm text-[#64748B] bg-[#F0F5F9] hover:bg-[#E2E8F0] border border-[#D9E4EC] transition-all cursor-pointer mx-1.5 focus:outline-none",
    },
    reverseButtons: true,
  });

  return result.isConfirmed;
}

/**
 * Success Alert Modal
 */
export async function showSuccessAlert(title: string, text?: string) {
  return customSwal.fire({
    title,
    text,
    icon: "success",
    iconColor: "#3F8F6B",
    confirmButtonText: "Great, Continue",
    customClass: {
      popup: "rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-2xl font-sans",
      title: "text-xl sm:text-2xl font-black text-[#243746] tracking-tight mb-2",
      htmlContainer: "text-sm text-[#5E8FB2] font-medium leading-relaxed",
      confirmButton:
        "px-7 py-3 rounded-xl font-extrabold text-sm text-white bg-[#3F8F6B] hover:bg-[#347658] shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400",
    },
  });
}

/**
 * Error Alert Modal
 */
export async function showErrorAlert(title: string, text?: string) {
  return customSwal.fire({
    title,
    text,
    icon: "error",
    iconColor: "#C95C5C",
    confirmButtonText: "Understood",
    customClass: {
      popup: "rounded-3xl p-6 sm:p-8 border border-red-100 shadow-2xl font-sans",
      title: "text-xl sm:text-2xl font-black text-[#243746] tracking-tight mb-2",
      htmlContainer: "text-sm text-[#64748B] font-medium leading-relaxed",
      confirmButton:
        "px-7 py-3 rounded-xl font-extrabold text-sm text-white bg-[#294B68] hover:bg-[#1E374D] shadow-md transition-all cursor-pointer focus:outline-none",
    },
  });
}

/**
 * Warning Alert Modal
 */
export async function showWarningAlert(title: string, text?: string) {
  return customSwal.fire({
    title,
    text,
    icon: "warning",
    iconColor: "#E08738",
    confirmButtonText: "Got It",
    customClass: {
      popup: "rounded-3xl p-6 sm:p-8 border border-amber-100 shadow-2xl font-sans",
      title: "text-xl sm:text-2xl font-black text-[#243746] tracking-tight mb-2",
      htmlContainer: "text-sm text-[#64748B] font-medium leading-relaxed",
      confirmButton:
        "px-7 py-3 rounded-xl font-extrabold text-sm text-white bg-[#294B68] hover:bg-[#1E374D] shadow-md transition-all cursor-pointer focus:outline-none",
    },
  });
}

/**
 * Toast notification in top right corner.
 */
export function showToast(title: string, icon: "success" | "error" | "warning" | "info" = "success") {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3500,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
    customClass: {
      popup: "rounded-2xl shadow-xl border border-[#D9E4EC] bg-white text-xs font-bold text-[#243746]",
    },
  });

  Toast.fire({
    icon,
    title,
  });
}

export default customSwal;
