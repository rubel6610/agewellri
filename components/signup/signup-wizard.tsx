"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { useSubmitAgreementMutation } from "@/redux/features/agreement/agreementApi";

import { Step1CreateAccount } from "./steps/step1-create-account";
import { Step2ChoosePlan } from "./steps/step2-choose-plan";
import { Step3ResidentDetails } from "./steps/step3-resident-details";
import {
  Step4AuthorizedRecipients,
  AuthorizedRecipient,
} from "./steps/step4-authorized-recipients";
import { Step5HomeAccess } from "./steps/step5-home-access";
import { Step6AgreementSigning } from "./steps/step6-agreement-signing";
import { Step7Authorizations } from "./steps/step7-authorizations";
import { Step8BillingSetup } from "./steps/step8-billing-setup";
import { Step9Confirmation } from "./steps/step9-confirmation";

import {
  User,
  Shield,
  Home,
  Users,
  Key,
  FileSignature,
  CheckSquare,
  CreditCard,
  CheckCircle2,
  Phone,
  LogOut,
} from "lucide-react";
import { showErrorAlert } from "@/lib/alerts/sweetalert";

const STEPS = [
  { id: 1, label: "Account", icon: User },
  { id: 2, label: "Plan", icon: Shield },
  { id: 3, label: "Resident", icon: Home },
  { id: 4, label: "Recipients", icon: Users },
  { id: 5, label: "Access", icon: Key },
  { id: 6, label: "Agreement", icon: FileSignature },
  { id: 7, label: "Authorizations", icon: CheckSquare },
  { id: 8, label: "Billing", icon: CreditCard },
  { id: 9, label: "Done", icon: CheckCircle2 },
];

interface SignupWizardProps {
  skipAccountStep?: boolean;
}

export function SignupWizard({
  skipAccountStep = false,
}: SignupWizardProps = {}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const [submitAgreement] = useSubmitAgreementMutation();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  const [currentStep, setCurrentStep] = useState<number>(
    skipAccountStep ? 2 : 1,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const visibleSteps = skipAccountStep
    ? STEPS.filter((s) => s.id !== 1)
    : STEPS;

  // Master Wizard State
  const [accountData, setAccountData] = useState({
    firstName: authUser?.firstName || "",
    lastName: authUser?.lastName || "",
    phone: authUser?.phone || "",
    email: authUser?.email || "",
  });

  const [planData, setPlanData] = useState({
    planId: "premium_safety_safeguard",
    planCode: "PREMIUM_SAFETY_SAFEGUARD",
    planName: "Premium Safety Safeguard",
    planPrice: 295,
    billingInterval: "MONTHLY",
    totalVisits: 12,
    services: [] as Array<{ serviceName: string; allocatedVisits: number }>,
  });


  const [residentData, setResidentData] = useState({
    isSameAsAccountHolder: true,
    fullName: authUser
      ? `${authUser.firstName} ${authUser.lastName}`.trim()
      : "",
    address: "",
    city: "Providence",
    state: "RI",
    postalCode: "02906",
    phone: authUser?.phone || "",
    email: authUser?.email || "",
  });

  useEffect(() => {
    if (authUser) {
      setAccountData((prev) => ({
        firstName: prev.firstName || authUser.firstName || "",
        lastName: prev.lastName || authUser.lastName || "",
        phone: prev.phone || authUser.phone || "",
        email: prev.email || authUser.email || "",
      }));
      setResidentData((prev) => ({
        ...prev,
        fullName:
          prev.fullName ||
          `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim(),
        phone: prev.phone || authUser.phone || "",
        email: prev.email || authUser.email || "",
      }));
    }
  }, [authUser]);

  const [authorizedRecipients, setAuthorizedRecipients] = useState<
    AuthorizedRecipient[]
  >([]);

  const [homeAccessData, setHomeAccessData] = useState({
    accessType: "RESIDENT_ANSWERS" as "RESIDENT_ANSWERS" | "DIGITAL_CODE",
    entryCode: "",
    isAuthorized: false,
    specialInstructions: "",
  });

  const [signingData, setSigningData] = useState<{
    signingTrack: "TRACK_A" | "TRACK_B";
    residentPrintedName: string;
    repFullName?: string;
    repCapacity?: "ATTORNEY_IN_FACT" | "GUARDIAN" | "CONSERVATOR" | null;
    repRelationship?: string;
    authorityDocumentUrl?: string | null;
    authorityDocumentName?: string | null;
    agreementDate: string;
    signatureDataUrl: string;
    consentElectronicSignature: boolean;
  }>({
    signingTrack: "TRACK_A",
    residentPrintedName: "",
    repFullName: "",
    repCapacity: null,
    repRelationship: "",
    authorityDocumentUrl: null,
    authorityDocumentName: null,
    agreementDate: new Date().toISOString().split("T")[0],
    signatureDataUrl: "",
    consentElectronicSignature: false,
  });

  const [authorizationsData, setAuthorizationsData] = useState({
    emergencyRightOfEntry: false,
    residentAutonomyAcknowledgment: false,
    automaticBillingAuthorization: false,
  });

  // Calculate dynamic 1st of next month
  const now = new Date();
  const nextMonthFirst = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const commencementDateFormatted = nextMonthFirst.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // If user is already authenticated, prefill details
  useEffect(() => {
    if (authUser) {
      setAccountData({
        firstName: authUser.firstName || "",
        lastName: authUser.lastName || "",
        phone: authUser.phone || "",
        email: authUser.email || "",
      });

      setResidentData((prev) => ({
        ...prev,
        fullName:
          prev.fullName || `${authUser.firstName} ${authUser.lastName}`.trim(),
        address: prev.address || authUser.client?.address || "",
        city: prev.city || authUser.client?.city || "Providence",
        state: prev.state || authUser.client?.state || "RI",
        postalCode: prev.postalCode || authUser.client?.postalCode || "02906",
        phone:
          prev.phone ||
          authUser.client?.primaryContactPhone ||
          authUser.phone ||
          "",
        email:
          prev.email ||
          authUser.client?.primaryContactEmail ||
          authUser.email ||
          "",
      }));

      if (skipAccountStep && currentStep === 1) {
        setCurrentStep(2);
      }
    }
  }, [authUser, skipAccountStep, currentStep]);

  // Step Handlers
  const handleStep1Success = (account: typeof accountData) => {
    setAccountData(account);
    if (!residentData.fullName || residentData.isSameAsAccountHolder) {
      setResidentData((prev) => ({
        ...prev,
        fullName: `${account.firstName} ${account.lastName}`.trim(),
        phone: account.phone,
        email: account.email,
      }));
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep2Success = (plan: typeof planData) => {
    setPlanData(plan);
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep3Success = (resident: typeof residentData) => {
    setResidentData(resident);
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep4Success = (recipients: AuthorizedRecipient[]) => {
    setAuthorizedRecipients(recipients);
    setCurrentStep(5);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep5Success = (access: typeof homeAccessData) => {
    setHomeAccessData(access);
    setCurrentStep(6);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep6Success = (signing: typeof signingData) => {
    setSigningData(signing);
    setCurrentStep(7);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep7Success = (authorizations: typeof authorizationsData) => {
    setAuthorizationsData(authorizations);
    setCurrentStep(8);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStep8PaymentSuccess = async (
    setupIntentId: string,
    paymentMethodId: string,
  ) => {
    setIsSubmitting(true);
    try {
      const agreementPayload = {
        clientFullName: residentData.fullName,
        address: residentData.address,
        city: residentData.city,
        state: residentData.state,
        postalCode: residentData.postalCode,
        phone: residentData.phone,
        email: residentData.email || accountData.email,

        signingTrack: signingData.signingTrack,
        signerRole:
          signingData.signingTrack === "TRACK_A"
            ? "RESIDENT"
            : "AUTHORIZED_REPRESENTATIVE",
        representativeCapacity:
          signingData.signingTrack === "TRACK_B"
            ? signingData.repCapacity
            : null,
        authorityDocumentUrl:
          signingData.signingTrack === "TRACK_B"
            ? signingData.authorityDocumentUrl
            : null,
        signerName:
          signingData.signingTrack === "TRACK_B"
            ? signingData.repFullName
            : residentData.fullName,
        relationshipToClient:
          signingData.signingTrack === "TRACK_B"
            ? signingData.repRelationship
            : "Self",

        authorizedRecipients: authorizedRecipients.map((r) => ({
          name: r.name,
          relationship: r.relationship,
          email: r.email,
        })),

        homeAccessType: homeAccessData.accessType,
        homeAccessCode:
          homeAccessData.accessType === "DIGITAL_CODE"
            ? homeAccessData.entryCode
            : null,
        homeAccessInstructions: homeAccessData.specialInstructions || null,
        homeAccessAuthorized: homeAccessData.isAuthorized,

        authorizations: {
          emergencyRightOfEntry: authorizationsData.emergencyRightOfEntry,
          residentAutonomyAcknowledgment:
            authorizationsData.residentAutonomyAcknowledgment,
          automaticBillingAuthorization:
            authorizationsData.automaticBillingAuthorization,
        },

        planId: planData.planId,
        selectedPlan: planData.planCode,
        hasCleaningAddon: false,
        billingMethod: "AUTOMATIC" as const,
        paymentMethodId,
        setupIntentId,

        clientPrintedName:
          (signingData.signingTrack === "TRACK_A"
            ? signingData.residentPrintedName || residentData.fullName
            : signingData.repFullName || residentData.fullName) ||
          residentData.fullName ||
          "Primary Resident",
        agreementDate: signingData.agreementDate,
        clientSignature: signingData.signatureDataUrl,
        agreedToTerms: true,
      };

      try {
        await submitAgreement(agreementPayload).unwrap();
      } catch (submitErr: any) {
        if (
          submitErr?.originalStatus !== 200 &&
          submitErr?.originalStatus !== 201
        ) {
          throw submitErr;
        }
      }

      setCurrentStep(9);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      console.error("Signup submission failed:", err);
      const msg =
        err?.data?.message ||
        err?.message ||
        "An error occurred while finalizing your agreement and payment authorization.";
      showErrorAlert(msg, "Registration Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Header / Branding with Logout */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 mb-6 border-b border-[#D9E4EC]/80">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="AgeWellRI"
            width={160}
            height={44}
            priority
            className="h-8 sm:h-9 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          {mounted && authUser ? (
            <>
              <div className="hidden sm:flex flex-col text-right text-xs">
                <span className="font-bold text-[#243746]">
                  {authUser.firstName} {authUser.lastName}
                </span>
                <span className="text-slate-500 font-medium truncate max-w-[200px]">
                  {authUser.email}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-red-600 bg-white hover:bg-red-50/80 rounded-xl border border-[#D9E4EC] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Sign out of your account"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4 text-xs font-semibold text-[#64748B]">
              <span className="hidden sm:inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#294B68]" />
                Questions? Call <strong>(401) 212-3002</strong>
              </span>
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl bg-white border border-[#D9E4EC] text-[#294B68] font-bold hover:bg-[#F0F5F9] transition-colors"
              >
                Log In
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Progress Stepper Header (Only show for steps 1 - 8) */}
      {currentStep < 9 && (
        <div className="max-w-4xl mx-auto w-full mb-8">
          <div className="flex items-center justify-between relative overflow-x-auto pb-2 scrollbar-none">
            {visibleSteps.slice(0, visibleSteps.length - 1).map((step) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center gap-1.5 min-w-[70px] sm:min-w-[85px] text-center"
                >
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? "bg-[#3F8F6B] text-white shadow-sm"
                        : isCurrent
                          ? "bg-[#294B68] text-white shadow-md ring-4 ring-[#294B68]/15"
                          : "bg-white border border-[#D9E4EC] text-[#94A3B8]"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4.5 h-4.5" />
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-bold tracking-tight ${
                      isCurrent
                        ? "text-[#294B68]"
                        : isCompleted
                          ? "text-[#3F8F6B]"
                          : "text-[#94A3B8]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Wizard Content Body */}
      <main className="max-w-4xl mx-auto w-full flex-1">
        {currentStep === 1 && (
          <Step1CreateAccount
            onSuccess={handleStep1Success}
            initialData={accountData}
          />
        )}

        {currentStep === 2 && (
          <Step2ChoosePlan
            selectedPlanId={planData.planId}
            onSelectPlan={handleStep2Success}
            onBack={skipAccountStep ? undefined : () => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3ResidentDetails
            accountHolder={accountData}
            initialData={residentData}
            onSave={handleStep3Success}
            onBack={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4AuthorizedRecipients
            initialRecipients={authorizedRecipients}
            onSave={handleStep4Success}
            onBack={() => setCurrentStep(3)}
          />
        )}

        {currentStep === 5 && (
          <Step5HomeAccess
            initialData={homeAccessData}
            onSave={handleStep5Success}
            onBack={() => setCurrentStep(4)}
          />
        )}

        {currentStep === 6 && (
          <Step6AgreementSigning
            planDetails={planData}
            residentDetails={residentData}
            accountHolder={accountData}
            initialData={signingData}
            onSave={handleStep6Success}
            onBack={() => setCurrentStep(5)}
          />
        )}

        {currentStep === 7 && (
          <Step7Authorizations
            initialAuthorizations={authorizationsData}
            onSave={handleStep7Success}
            onBack={() => setCurrentStep(6)}
          />
        )}

        {currentStep === 8 && (
          <Step8BillingSetup
            planDetails={planData}
            residentDetails={residentData}
            onPaymentSuccess={handleStep8PaymentSuccess}
            onBack={() => setCurrentStep(7)}
            isSubmittingOverall={isSubmitting}
          />
        )}

        {currentStep === 9 && (
          <Step9Confirmation
            planDetails={planData}
            residentDetails={residentData}
            recipientCount={authorizedRecipients.length}
            commencementDateFormatted={commencementDateFormatted}
            userEmail={accountData.email || authUser?.email || "your email"}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto w-full pt-8 mt-12 border-t border-[#D9E4EC] text-center text-xs text-[#64748B] space-y-2">
        <div className="flex items-center justify-center gap-4 font-semibold">
          <Link
            href="/privacy-policy"
            className="hover:text-[#294B68] underline"
          >
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link href="/terms-of-use" className="hover:text-[#294B68] underline">
            Terms of Use
          </Link>
          <span>&bull;</span>
          <a href="mailto:agewellri@gmail.com" className="hover:text-[#294B68]">
            agewellri@gmail.com
          </a>
        </div>
        <p>
          AgeWellRI LLC
        </p>
      </footer>
    </div>
  );
}
