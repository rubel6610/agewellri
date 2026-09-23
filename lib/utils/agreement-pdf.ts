import jsPDF from "jspdf";
import { formatPlanDuration } from "@/redux/features/plan/planTypes";

export interface AuthorizedRecipientItem {
  name: string;
  relationship: string;
  email: string;
  phone?: string | null;
}

export interface AgreementPdfData {
  id?: string;
  clientId?: string;
  clientNumber?: string;
  clientName?: string;
  clientFullName?: string;
  clientPrintedName?: string;
  clientEmail?: string;
  email?: string;
  phone?: string | null;
  dob?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  stateAddress?: string | null;
  postalCode?: string | null;
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
  primaryContactPhone?: string | null;
  primaryContactRelation?: string | null;
  primaryBillingContact?: string | null;
  authorizedRepName?: string | null;
  repFullName?: string | null;
  relationshipToClient?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactEmail?: string | null;
  emergencyContactRelation?: string | null;
  authorizedRecipients?: AuthorizedRecipientItem[];
  homeAccessType?: string | null;
  homeAccessInstructions?: string | null;
  homeAccessCode?: string | null;
  homeAccessAuthorized?: boolean;
  authorizations?: {
    emergencyRightOfEntry?: boolean;
    residentAutonomyAcknowledgment?: boolean;
    automaticBillingAuthorization?: boolean;
  };
  signingTrack?: "TRACK_A" | "TRACK_B" | string;
  representativeCapacity?: string | null;
  authorityDocumentUrl?: string | null;
  documentUrl?: string | null;
  planName?: string | null;
  selectedPlan?: string | null;
  planPrice?: number | null;
  planTimes?: string | null;
  times?: string | null;
  hasCleaningAddon?: boolean;
  planSnapshot?: any;
  signerName?: string | null;
  signerRole?: string | null;
  signerEmail?: string | null;
  signerPhone?: string | null;
  legalAuthority?: string | null;
  legalAuthorityOther?: string | null;
  clientSignature?: string | null;
  signedDate?: string | null;
  signedAt?: string | null;
  executedAt?: string | null;
  agreementDate?: string | null;
  createdAt?: string | null;
  cancellationDeadline?: string | null;
  cancellationDeadlineRule?: string | null;
  templateVersion?: string | null;
  version?: string | null;
  status?: string | null;
}

const AGEWELL_OFFICER_NAME = "Cory Poplaski";
const AGEWELL_OFFICER_TITLE = "Founder & Director";
const AGEWELL_COMPANY_NAME = "AgeWellRI LLC";

const OWNER_SIGNATURE_SVG ="/signature.png"

async function svgToPngDataUrl(
  svgStr: string,
  width = 360,
  height = 120,
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve("");
    try {
      const img = new (window as any).Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/png"));
          } else {
            resolve("");
          }
        } catch {
          resolve("");
        }
      };
      img.onerror = () => resolve("");
      img.src = svgStr;
    } catch {
      resolve("");
    }
  });
}

function formatCapacity(cap?: string | null): string {
  if (!cap) return "Attorney-in-Fact (Durable Power of Attorney)";
  switch (cap) {
    case "ATTORNEY_IN_FACT":
      return "Attorney-in-Fact (Durable Power of Attorney)";
    case "GUARDIAN":
      return "Court-Appointed Legal Guardian";
    case "CONSERVATOR":
      return "Court-Appointed Conservator";
    default:
      return cap.replace(/_/g, " ");
  }
}

// function formatAccessType(accessType?: string | null): string {
//   if (!accessType) return "Resident Answers Door";
//   switch (accessType) {
//     case "RESIDENT_ANSWERS":
//       return "Resident Answers Door (Onsite Resident / Family Member greets specialist)";
//     case "DIGITAL_CODE":
//       return "Digital Keypad / Lockbox (Specialist enters via authorized code/lockbox)";
//     case "LOCKBOX":
//       return "Key Lockbox (Exterior key vault access)";
//     default:
//       return accessType.replace(/_/g, " ");
//   }
// }

/**
 * Generates and downloads a vector-based, high-fidelity PDF of the AgeWellRI Hybrid Services Agreement (16-Section Rhode Island Version).
 */
export async function downloadAgreementPdf(
  agreement: AgreementPdfData,
): Promise<void> {
  let providerSigPng = "";
  try {
    providerSigPng = await svgToPngDataUrl(OWNER_SIGNATURE_SVG, 360, 105);
  } catch {
    providerSigPng = "";
  }

  let clientSigPng = agreement.clientSignature || "";
  if (clientSigPng && clientSigPng.startsWith("data:image/svg+xml")) {
    try {
      clientSigPng = await svgToPngDataUrl(clientSigPng, 360, 105);
    } catch {
      // keep
    }
  }

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  let y = 10;

  // Design Tokens & Colors
  const navy: [number, number, number] = [36, 55, 70]; // #243746
  const lightNavy: [number, number, number] = [41, 75, 104]; // #294B68
  const skyBlue: [number, number, number] = [94, 143, 178]; // #5E8FB2
  const paleBg: [number, number, number] = [248, 250, 252]; // #F8FAFC
  const cardBg: [number, number, number] = [234, 243, 248]; // #EAF3F8
  const borderColor: [number, number, number] = [217, 228, 236]; // #D9E4EC
  const darkText: [number, number, number] = [36, 55, 70];
  const darkBodyText: [number, number, number] = [51, 65, 85]; // #334155
  const mutedText: [number, number, number] = [100, 116, 139]; // #64748B
  const greenText: [number, number, number] = [22, 101, 52]; // #166534
  const lightGreenBg: [number, number, number] = [235, 248, 242];
  const white: [number, number, number] = [255, 255, 255];

  const checkPageBreak = (neededHeight: number): void => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 12;
    }
  };

  const drawSectionHeader = (title: string, spaceAfter = 4): void => {
    checkPageBreak(14);
    doc.setFillColor(...navy);
    doc.roundedRect(margin, y, contentWidth, 6.8, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3.5, y + 4.7);
    y += 6.8 + spaceAfter;
  };

  const renderParagraph = (
    text: string,
    spaceAfter = 2.8,
    indent = 0,
  ): void => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(...darkBodyText);
    const lines = doc.splitTextToSize(text, contentWidth - indent);
    for (const line of lines) {
      checkPageBreak(3.5);
      doc.text(line, margin + indent, y);
      y += 3.2;
    }
    y += spaceAfter;
  };

  const renderSubsection = (
    heading: string,
    body: string,
    spaceAfter = 2.8,
    indent = 0,
  ): void => {
    checkPageBreak(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(...navy);
    doc.text(heading, margin + indent, y);
    y += 3.5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(...darkBodyText);
    const lines = doc.splitTextToSize(body, contentWidth - indent);
    for (const line of lines) {
      checkPageBreak(3.5);
      doc.text(line, margin + indent, y);
      y += 3.2;
    }
    y += spaceAfter;
  };

  const statusUpper = (agreement.status || "").toUpperCase();
  const isExecuted =
    Boolean(agreement.clientSignature) ||
    statusUpper === "EXECUTED" ||
    statusUpper === "SIGNED" ||
    statusUpper === "ACTIVE" ||
    statusUpper === "COMPLETED" ||
    Boolean(agreement.signedAt) ||
    Boolean(agreement.executedAt) ||
    Boolean(agreement.signedDate);

  const rawDate =
    agreement.agreementDate ||
    agreement.signedAt ||
    agreement.executedAt ||
    agreement.signedDate ||
    agreement.createdAt;

  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : isExecuted
      ? "Executed & Active"
      : "Pending Execution";

  const clientFullName =
    agreement.clientFullName ||
    agreement.clientName ||
    agreement.clientPrintedName ||
    agreement.signerName ||
    "Client Member";

  const clientEmail = agreement.email || agreement.clientEmail || "N/A";
  const stateCode = agreement.state || agreement.stateAddress || "RI";
  const clientNumber =
    agreement.clientNumber || agreement.clientId || "AW-MEMBER";

  const isRepresentative =
    agreement.signingTrack === "TRACK_B" ||
    (agreement.signerRole && agreement.signerRole !== "RESIDENT") ||
    Boolean(agreement.authorizedRepName) ||
    Boolean(agreement.repFullName);

  const signerLegalName = isRepresentative
    ? agreement.repFullName ||
      agreement.signerName ||
      agreement.authorizedRepName ||
      agreement.clientPrintedName ||
      clientFullName
    : agreement.clientPrintedName || clientFullName;

  const fullAddress = [
    agreement.address,
    agreement.city,
    agreement.state || agreement.stateAddress || "RI",
    agreement.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  const rawPlanName =
    agreement.planName || agreement.selectedPlan || "Peace of Mind Plan";
  const planPrice = agreement.planPrice ?? 495;
  const isPlan1 =
    planPrice === 295 ||
    rawPlanName.toLowerCase().includes("safeguard") ||
    rawPlanName.toLowerCase().includes("plan 1");
  const isPlan2 = !isPlan1;

  // ==========================================
  // DOCUMENT HEADER (No badge overlap)
  // ==========================================
  doc.setFillColor(...navy);
  doc.roundedRect(margin, y, contentWidth, 16, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.8);
  doc.setTextColor(255, 255, 255);
  doc.text(
    "AGEWELLRI HYBRID SERVICES AGREEMENT",
    margin + 4,
    y + 6.5,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(190, 220, 240);
  doc.text(
    "Company Name: © 2026 AgeWellRI LLC. All rights reserved.| Location: Westerly, Rhode Island",
    margin + 4,
    y + 12,
  );

  y += 18.5;

  // Metadata Sub-bar
  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 6.5, 1, 1, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(...darkText);
  doc.text(
    `Doc Ref: ${agreement.id?.slice(-8)?.toUpperCase() || "AW-AG"}`,
    margin + 3.5,
    y + 4.2,
  );
  doc.text(`Client ID: ${clientNumber}`, margin + 48, y + 4.2);
  doc.text(
    `Version: ${agreement.templateVersion || agreement.version || "v2.0"} (RI)`,
    margin + 95,
    y + 4.2,
  );
  doc.text(`Effective: ${formattedDate}`, margin + 140, y + 4.2);

  y += 9.5;

  // ==========================================
  // 1. Resident / Client Profile & Residence Location
  // ==========================================
  drawSectionHeader("1. Resident / Client Profile & Residence Location", 3.5);
  checkPageBreak(25);

  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 24, 1, 1, "FD");

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("CLIENT FULL LEGAL NAME", margin + 3.5, y + 4);
  doc.text("SERVICE RESIDENCE ADDRESS", margin + 95, y + 4);

  doc.setFontSize(8);
  doc.setTextColor(...darkText);
  doc.text(clientFullName, margin + 3.5, y + 8);
  const dispAddress = fullAddress || `${stateCode}, USA`;
  doc.text(
    dispAddress.length > 52 ? dispAddress.slice(0, 52) + "..." : dispAddress,
    margin + 95,
    y + 8,
  );

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("PHONE NUMBER", margin + 3.5, y + 14);
  doc.text("DATE OF BIRTH", margin + 50, y + 14);
  doc.text("EMAIL ADDRESS", margin + 95, y + 14);

  doc.setFontSize(7.5);
  doc.setTextColor(...darkText);
  doc.text(agreement.phone || "On File", margin + 3.5, y + 18.5);
  doc.text(
    agreement.dob || agreement.dateOfBirth || "On File",
    margin + 50,
    y + 18.5,
  );
  doc.text(clientEmail, margin + 95, y + 18.5);

  y += 27.5;

  // ==========================================
  // 2. Signing Track & Legal Representation Authority
  // ==========================================
  drawSectionHeader("2. Signing Track & Legal Representation Authority", 3.5);
  checkPageBreak(25);

  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 24, 1, 1, "FD");

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("SIGNING TRACK", margin + 3.5, y + 4);
  doc.text("SIGNER LEGAL NAME", margin + 60, y + 4);
  doc.text("LEGAL CAPACITY / ROLE", margin + 120, y + 4);

  doc.setFontSize(7.5);
  doc.setTextColor(...darkText);
  const trackLabel = isRepresentative
    ? "Track B: Representative / POA"
    : "Track A: Primary Resident (Self)";
  doc.text(trackLabel, margin + 3.5, y + 8);
  doc.text(signerLegalName, margin + 60, y + 8);
  doc.text(
    isRepresentative
      ? formatCapacity(
          agreement.representativeCapacity || agreement.legalAuthority,
        )
      : "Primary Resident (Self-Signer)",
    margin + 120,
    y + 8,
  );

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("RELATIONSHIP TO CLIENT", margin + 3.5, y + 14);
  doc.text("SIGNER PHONE", margin + 60, y + 14);
  doc.text("LEGAL AUTHORITY STATUS", margin + 120, y + 14);

  doc.setFontSize(7.5);
  doc.setTextColor(...darkText);
  doc.text(
    agreement.relationshipToClient ||
      (isRepresentative ? "Authorized Representative" : "Self"),
    margin + 3.5,
    y + 18.5,
  );
  doc.text(
    agreement.signerPhone || agreement.phone || "On File",
    margin + 60,
    y + 18.5,
  );

  const hasAuthDoc = Boolean(
    agreement.authorityDocumentUrl || agreement.documentUrl,
  );
  if (isRepresentative) {
    doc.setTextColor(...(hasAuthDoc ? greenText : mutedText));
    doc.setFont("helvetica", "bold");
    doc.text(
      hasAuthDoc
        ? "✓ Verified & Attached On File"
        : "Representative Capacity Declared",
      margin + 120,
      y + 18.5,
    );
  } else {
    doc.text("N/A (Resident Signature)", margin + 120, y + 18.5);
  }

  y += 27.5;

  // ==========================================
  // 3. Primary Billing & Emergency Contacts
  // ==========================================
  drawSectionHeader("3. Primary Billing & Emergency Contacts", 3.5);
  checkPageBreak(22);

  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth / 2 - 1.5, 20, 1, 1, "FD");
  doc.roundedRect(
    margin + contentWidth / 2 + 1.5,
    y,
    contentWidth / 2 - 1.5,
    20,
    1,
    1,
    "FD",
  );

  // Primary Contact
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...skyBlue);
  doc.text("PRIMARY / BILLING CONTACT", margin + 3.5, y + 4);
  doc.setFontSize(7.5);
  doc.setTextColor(...darkText);
  const primName =
    agreement.primaryContactName ||
    (isRepresentative ? signerLegalName : clientFullName);
  doc.text(primName, margin + 3.5, y + 8.5);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedText);
  doc.text(
    `Relationship: ${agreement.primaryContactRelation || (isRepresentative ? "Authorized Representative" : "Self")}`,
    margin + 3.5,
    y + 13,
  );
  doc.text(
    `Phone: ${agreement.primaryContactPhone || agreement.phone || "On File"} • Email: ${agreement.primaryContactEmail || agreement.primaryBillingContact || clientEmail}`,
    margin + 3.5,
    y + 17.5,
  );

  // Emergency Contact
  const ecX = margin + contentWidth / 2 + 1.5;
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...skyBlue);
  doc.text("DESIGNATED EMERGENCY CONTACT", ecX + 3.5, y + 4);
  doc.setFontSize(7.5);
  doc.setTextColor(...darkText);
  doc.text(
    agreement.emergencyContactName || "Not Provided",
    ecX + 3.5,
    y + 8.5,
  );
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedText);
  doc.text(
    `Relationship: ${agreement.emergencyContactRelation || "Designated Emergency Contact"}`,
    ecX + 3.5,
    y + 13,
  );
  doc.text(
    `Phone: ${agreement.emergencyContactPhone || "Not Provided"}${agreement.emergencyContactEmail ? ` • Email: ${agreement.emergencyContactEmail}` : ""}`,
    ecX + 3.5,
    y + 17.5,
  );

  y += 23.5;

  // ==========================================
  // 4. Authorized Report Recipients (if any)
  // ==========================================
  const recipients = agreement.authorizedRecipients || [];
  if (recipients.length > 0) {
    drawSectionHeader(
      "4. Authorized Report Recipients (Post-Visit Updates & Photos)",
      3.5,
    );
    checkPageBreak(12 + recipients.length * 5.5);

    doc.setFillColor(...paleBg);
    doc.setDrawColor(...borderColor);
    const recBoxH = Math.max(16, 8 + recipients.length * 5.5);
    doc.roundedRect(margin, y, contentWidth, recBoxH, 1, 1, "FD");

    doc.setFontSize(6.2);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...mutedText);
    doc.text("FULL NAME", margin + 3.5, y + 4);
    doc.text("RELATIONSHIP", margin + 55, y + 4);
    doc.text("EMAIL ADDRESS (DIGITAL REPORT RECIPIENT)", margin + 105, y + 4);

    let recY = y + 8.5;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...darkText);

    for (const rec of recipients) {
      doc.text(rec.name || "Recipient", margin + 3.5, recY);
      doc.text(rec.relationship || "Family Member", margin + 55, recY);
      doc.text(rec.email || "N/A", margin + 105, recY);
      recY += 5.5;
    }

    y += recBoxH + 3.5;
  }

  // ==========================================
  // 5. Home Access Specifications
  // ==========================================
  drawSectionHeader("5. Home Access Specifications & Entry Protocol", 3.5);
  checkPageBreak(20);

  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 18, 1, 1, "FD");

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("SCHEDULED ENTRY METHOD", margin + 3.5, y + 4);
  doc.text("AUTHORIZATION STATUS", margin + 95, y + 4);

  doc.setFontSize(7.5);
  doc.setTextColor(...darkText);
  const accessDisplay =
    agreement.homeAccessType === "DIGITAL_CODE"
      ? "Digital Keypad / Smart Lock Access"
      : agreement.homeAccessType === "LOCKBOX"
        ? "Key Lockbox Access"
        : "Resident Answers Door (Onsite Greeting)";
  doc.text(accessDisplay, margin + 3.5, y + 8.5);

  doc.setTextColor(...greenText);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text(
    "Authorized for Confirmed Scheduled Visits",
    margin + 95,
    y + 8.5,
  );

  doc.setFontSize(6.2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedText);
  doc.text(
    "Entry credentials are protected in AgeWellRI's secure portal and accessed only by assigned specialists.",
    margin + 3.5,
    y + 13.8,
  );

  y += 21.5;

  // ==========================================
  // FULL 16-SECTION LEGAL AGREEMENT
  // ==========================================

  // SECTION 1: PARTIES, PLANS, & SCOPE OF SERVICE
  drawSectionHeader("1. PARTIES, PLANS, & SCOPE OF SERVICE", 4.5);
  renderParagraph(
    `This Hybrid Services Agreement (the "Agreement") is entered into by and between AgeWellRI LLC ("Company") and the undersigned client and/or responsible family representative ("Client"): ${clientFullName}, residing at ${dispAddress}. Company agrees to provide its recurring monthly subscription services based on the specific plan tier selected by the Client below. Both tiers operate on a biweekly rotation consisting of two (2) scheduled home visits per calendar month spaced approximately two weeks apart.`,
    3.5,
  );

  // Subtitle
  checkPageBreak(10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(...navy);
  doc.text(
    "[Client Must Check Exactly One Box to Select a Plan Tier]:",
    margin,
    y,
  );
  y += 4.5;

  // Plan 1 Full Card
  const p1FullScope =
    "Scope: Each biweekly visit provides a dedicated, objective environmental safety assessment of the home. During the visit, an AgeWellRI specialist conducts a structured walkthrough of the home's key areas — stairs and circulation, bathrooms, exterior entry, bedrooms and living areas, life-safety systems, and kitchen and laundry — to identify fall risks, hazards, and safety concerns. The specialist documents each finding with photos, notes recommended corrections, generates a standardized residential safety report, and delivers it to the Client's designated family dashboard the same day. This plan may include the complimentary minor safety courtesies described in Section 7 (such as replacing a bulb, placing a plug-in nightlight, or securing a loose cord). It does not include the proactive hazard-clearing, item relocation, or expanded mitigation services offered under Plan 2, and does not include any general or routine housekeeping, laundry, meal preparation, or personal care of any kind.";

  const p1Lines = doc.splitTextToSize(p1FullScope, contentWidth - 8);
  const p1BoxH = 15 + p1Lines.length * 3.1 + 3;
  checkPageBreak(Math.min(p1BoxH, 35));

  doc.setFillColor(...(isPlan1 ? cardBg : white));
  doc.setDrawColor(...(isPlan1 ? lightNavy : borderColor));
  doc.roundedRect(margin, y, contentWidth, p1BoxH, 1.2, 1.2, "FD");

  let p1Y = y + 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...(isPlan1 ? lightNavy : darkText));
  doc.text(
    `PLAN 1: THE PREMIUM SAFETY SAFEGUARD`,
    margin + 4,
    p1Y,
  );
  if (isPlan1) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...greenText);
    doc.text("[SELECTED PLAN]", pageWidth - margin - 4, p1Y, {
      align: "right",
    });
  }

  p1Y += 4.0;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...lightNavy);
  const p1Times = formatPlanDuration(
    (agreement as any).planTimes ||
      (agreement as any).times ||
      agreement.planSnapshot?.times,
  );
  doc.text(
    `Rate: $295.00 per calendar month   •   Time: ${p1Times}   •   (Environmental Safety Oversight Only)`,
    margin + 4,
    p1Y,
  );

  p1Y += 4.2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...darkBodyText);
  doc.text(p1Lines, margin + 4, p1Y);

  y += p1BoxH + 4;

  // Plan 2 Full Card
  const p2FullScope =
    "Scope: Each biweekly visit provides everything in Plan 1, plus proactive hazard clearing performed during the same visit. This includes: verifying and improving lighting at key entrances and along stairs, hallways, and walkways by swapping in brighter LED bulbs and placing plug-in, battery, or solar nightlights and motion lights (no wiring); clearing clutter and obstacles from walkways, hallways, stairs, and entryways to establish clear walking paths; applying anti-slip backing or tape to loose rugs, runners, and stair treads, non-slip strips to bare stairs and to tub and shower surfaces, and foam guards to sharp furniture corners; marking stair edges and steps with high-contrast non-slip tape, adding clear hot/cold water indicators, and applying easy-to-read overlays on stove and appliance controls; securing loose cords along baseboards with safety clips; stabilizing unstable furniture; at the resident's direction, moving critical items such as a cane, phone, or eyeglasses within safe reach, and relocating frequently used items from unsafe high or low storage to a safer, reachable height where it reduces a clear fall or strain hazard; manual testing and battery replacement for smoke and carbon monoxide alarms; checking fire-extinguisher condition and expiration dates; testing that emergency alert and medical-alert devices are charged and connected to the home Wi-Fi network; mounting lightweight fire extinguishers in high-risk areas; posting emergency contact cards and exit-route plans; checking that water temperature settings remain below 120°F; and addressing an immediate wet-floor or spill-related slip hazard identified during the visit, such as drying the affected area or placing a temporary caution marker, so the hazard does not persist between visits. This plan does not include general or routine housekeeping, laundry, meal preparation, or personal care of any kind.";

  const p2Lines = doc.splitTextToSize(p2FullScope, contentWidth - 8);
  const p2BoxH = 15 + p2Lines.length * 3.1 + 3;
  checkPageBreak(Math.min(p2BoxH, 35));

  doc.setFillColor(...(isPlan2 ? cardBg : white));
  doc.setDrawColor(...(isPlan2 ? lightNavy : borderColor));
  doc.roundedRect(margin, y, contentWidth, p2BoxH, 1.2, 1.2, "FD");

  let p2Y = y + 4.5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...(isPlan2 ? lightNavy : darkText));
  doc.text(
    `PLAN 2: THE INDEPENDENCE & UPKEEP PLAN`,
    margin + 4,
    p2Y,
  );
  if (isPlan2) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...greenText);
    doc.text("[SELECTED PLAN]", pageWidth - margin - 4, p2Y, {
      align: "right",
    });
  }

  p2Y += 4.0;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...lightNavy);
  const p2Times = formatPlanDuration(
    (agreement as any).planTimes ||
      (agreement as any).times ||
      agreement.planSnapshot?.times,
  );
  doc.text(
    `Rate: $${planPrice}.00 per calendar month   •   Time: ${p2Times}   •   (Comprehensive Safety Oversight & Proactive Mitigation)`,
    margin + 4,
    p2Y,
  );

  p2Y += 4.2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...darkBodyText);
  doc.text(p2Lines, margin + 4, p2Y);

  y += p2BoxH + 4.5;

  // SECTION 2
  drawSectionHeader(
    "2. PURPOSE, SCOPE OF ASSESSMENT, & OUTSIDE PERIMETER BOUNDARIES",
    4.5,
  );
  renderParagraph(
    "The Client authorizes AgeWellRI to photograph the interior and exterior of the home during visits for the sole purpose of documenting safety findings, and to include those photographs in the Client's visit reports. The assessment, the Age Safe® Home Score™ and the report are generated by the Age Safe® America app, and photographs and report data are stored on Age Safe® America's secure infrastructure. AgeWellRI decides what is collected and photographed, obtains the Client's consent, and delivers the reports. Age Safe® America is a technology provider to AgeWellRI and is not a party to this agreement. Photographs are limited to areas and conditions relevant to home safety; AgeWellRI does not photograph the resident's person, medical information, or unrelated personal effects, and does not use these photographs for marketing or any purpose other than delivering and administering the services, except with the Client's separate written consent. The Client acknowledges that email is not a fully secure medium and consents to receiving reports and photographs by email where that delivery method is used.",
  );
  renderSubsection(
    "Scope of Additional Hazard-Mitigation Services (Plan 2):",
    "The additional services provided under Plan 2 are strictly limited to the specific, non-medical, targeted hazard-clearing tasks described in Section 1, performed at the resident's direction where indicated. These services do not include deep structural restoration, hazardous mold remediation, heavy lifting, or chemical abatement, and do not include general or routine housekeeping, laundry, meal preparation, or personal care of any kind. Company shall not be held liable for normal wear-and-tear, pre-existing surface degradation, or minor, incidental cosmetic imperfections occurring during a hazard-clearing visit.",
  );
  renderSubsection(
    "Prioritized Hazard Mitigation (Plan 2):",
    "Where multiple hazards are identified during a visit, Company addresses the highest-risk items first within the scheduled time. Remaining lower-priority items are documented in the visit report and addressed, where practicable, at the next scheduled visit. Company does not warrant that the home is, or will remain, free of all hazards, and hazard mitigation under this Agreement is an ongoing, visit-by-visit process rather than a one-time guarantee.",
  );
  renderSubsection(
    "Outside Perimeter Boundaries:",
    "External property tasks are strictly restricted to ground-level debris clearing, light walkway sweeping, and the visual reporting of obvious exterior structural hazards. To comply with the Rhode Island Contractors' Registration and Licensing Board (CRLB) rules, Company personnel are strictly prohibited from using ladders, applying commercial chemical pesticides, performing tree trimming, or executing any structural hardscape, masonry, or carpentry repairs.",
  );

  // SECTION 3
  drawSectionHeader("3. EXCLUSION OF MEDICAL AND CLINICAL ADVICE", 4.5);
  renderParagraph(
    "AgeWellRI LLC is an environmental safety and consulting service. We do not provide medical diagnoses, clinical evaluations, physical therapy, occupational therapy, dispensing of medications, or any other form of professional healthcare services or advice. The reports, checklists, recommendations, and safety scores provided by AgeWellRI are not medical assessments and are not intended to substitute for professional clinical judgment, medical care, or qualified caregiver supervision. Clients are strongly advised to consult with their primary care physicians, licensed occupational therapists, or other qualified healthcare providers regarding specific physical limitations, mobility challenges, or physiological fall-risk factors. AgeWellRI does not provide personal care, homemaker services, or hands-on assistance with activities of daily living such as bathing, dressing, feeding, grooming, or mobility transfer.",
  );

  // SECTION 4
  drawSectionHeader("4. NO GUARANTEE OR WARRANTY (ACCIDENT PREVENTION)", 4.5);
  renderParagraph(
    "While our structured assessment methodologies are designed to assist in identifying and mitigating environmental hazards, no residential environment can be rendered entirely accident-proof. AgeWellRI makes no representations, warranties, or guarantees—either express or implied—that implementing our recommendations, performing suggested modifications, or achieving any specific safety score will prevent future slips, trips, falls, bodily injuries, or other adverse incidents. Falls are multifactorial events influenced by environmental, behavioral, and physiological variables beyond the scope and control of this assessment.",
  );

  // SECTION 5
  drawSectionHeader("5. IMPLEMENTATION AND THIRD-PARTY PROVIDERS", 4.5);
  renderParagraph(
    "Any recommendations, modifications, or product suggestions contained within our reports are for informational purposes only. The decision to act upon, modify, or ignore any portion of the report is made at the sole and absolute discretion, and risk, of the client. AgeWellRI does not perform structural home repairs, heavy construction, or complex plumbing/electrical installations. If the client chooses to engage third-party contractors, handymen, or other service providers to perform recommended modifications (such as installing wall-anchored grab bars, structural ramps, or dedicated lighting fixtures), AgeWellRI disclaims all liability and responsibility for the quality, safety, regulatory compliance, or efficacy of those third-party services or products.",
  );

  // SECTION 5A
  drawSectionHeader("5A. THIRD-PARTY CONTRACTOR REFERRALS", 4.5);
  renderParagraph(
    "Where AgeWellRI's safety assessment identifies work that requires a licensed trade or structural modification — such as anchoring grab bars, installing ramps, or performing plumbing, electrical, or carpentry work — AgeWellRI does not perform that work. As a convenience only, AgeWellRI may provide the Client with the names of local contractors for the Client's consideration.",
  );
  renderSubsection(
    "Independent Third Parties:",
    "Any contractor referenced by AgeWellRI is an independent third party and is not an employee, agent, partner, joint venturer, or subcontractor of AgeWellRI. AgeWellRI does not employ, supervise, direct, or control any contractor's work.",
  );
  renderSubsection(
    "No Guarantee or Warranty of Contractors:",
    "AgeWellRI does not guarantee, warrant, or assume responsibility for the licensing, registration, insurance, workmanship, quality, safety, pricing, timeliness, regulatory compliance, or conduct of any contractor — whether that contractor was named by AgeWellRI or selected independently by the Client. The Client is responsible for verifying a contractor's license, registration, and insurance before hiring.",
  );
  renderSubsection(
    "Client's Sole Decision:",
    "The decision to hire any contractor, and all agreements, payments, and dealings with that contractor, are solely between the Client and the contractor, entered into at the Client's own risk. AgeWellRI is not a party to any agreement between the Client and any contractor.",
  );
  renderSubsection(
    "No Referral Compensation:",
    "AgeWellRI receives no fee, commission, or other compensation in exchange for referring any contractor, unless such an arrangement is separately and expressly disclosed to the Client in writing.",
  );
  renderSubsection(
    "Release:",
    "To the fullest extent permitted by law, the Client releases and holds harmless AgeWellRI (and its owners, employees, and agents) from any liability, claim, demand, or damage — including property damage or personal injury — arising out of or relating to work performed, or not performed, by any third-party contractor, whether recommended by AgeWellRI or sourced independently by the Client. This release does not apply to loss or injury caused by AgeWellRI's own gross negligence, recklessness, or willful misconduct.",
  );

  // SECTION 6
  drawSectionHeader("6. LIMITATION OF LIABILITY AND RELEASE", 4.5);
  renderParagraph(
    "By accepting, accessing, or utilizing the AgeWellRI report, checklist, or scoring data, and by receiving services under this Agreement, the Client acknowledges that reliance on this information, and receipt of these services, is at the Client's own risk. AgeWellRI does not guarantee absolute home safety, fall prevention, or any specific health outcome, and does not provide continuous or real-time remote monitoring. Except as stated below, AgeWellRI is not liable for any direct, indirect, incidental, consequential, special, or compensatory damages, including personal injury, property damage, or medical expenses, arising from latent or undetected hazards, the implementation or omission of any recommendation, or any slip, trip, fall, or medical emergency on the property, except to the extent directly caused by AgeWellRI's own negligence. AgeWellRI's total liability for any claim arising out of this Agreement is limited to the fees paid in the calendar month the claim arose. These limitations do not apply to AgeWellRI's gross negligence, recklessness, or willful misconduct, or to liability that cannot be limited under applicable law.",
  );

  // SECTION 7
  drawSectionHeader(
    "7. LIABILITY DISCLAIMER: COMPLIMENTARY SAFETY & CONVENIENCE ADJUSTMENTS",
    4.5,
  );
  renderSubsection(
    "Scope of Complimentary Adjustments:",
    "All complimentary, low-impact adjustments (including, but not limited to, replacing standard lightbulbs, installing plug-in or adhesive nightlights, replacing surface cabinet hardware, securing exposed electrical cords with safety clips, and swapping minor convenience fixtures) are provided strictly as a gratuitous safety courtesy and do not constitute professional construction, carpentry, plumbing, or electrical contracting services. No separate labor or installation fees are assessed for these minor adjustments.",
  );
  renderSubsection(
    "No-Load Bearing Limitation:",
    "AgeWellRI does not install heavy, load-bearing safety equipment (including wall-anchored grab bars, structural transfer poles, or wall-mounted shower benches) under this courtesy service. The client explicitly agrees that no low-impact convenience adjustment made by AgeWellRI is designed, intended, or structurally certified to support a human being's body weight.",
  );
  renderSubsection(
    "Waiver of Liability:",
    "While AgeWellRI exercises reasonable care and certified safety practices in performing these minor convenience adjustments, the Client hereby releases, waives, and forever discharges AgeWellRI (along with its officers, employees, and agents) from any and all liability, claims, demands, or causes of action arising out of property damage, personal injury, or accidental falls associated with the use, wear-and-tear, structural failure, or placement of any complimentary items installed. This release does not apply to loss or injury caused by AgeWellRI's gross negligence, recklessness, or willful misconduct.",
  );
  renderSubsection(
    "Product Warranties:",
    "AgeWellRI does not manufacture the convenience items used (such as LED bulbs, safety nightlights, or adhesive clips) and provides no independent warranty, express or implied, regarding the performance, lifespan, or mechanical defects of third-party products.",
  );
  renderSubsection(
    "Right of Refusal:",
    "AgeWellRI reserves the absolute right to decline any minor adjustment request if, in the technician's professional judgment, the installation would require a licensed trade, alter the structural integrity of the home, or present an unforeseen safety hazard.",
  );

  // SECTION 8
  drawSectionHeader("8. FOOD & KITCHEN SAFETY MONITORING", 4.5);
  renderParagraph(
    "As part of our environmental safety monitoring, technicians may perform a visual, non-invasive check of readily accessible kitchen, refrigerator, and pantry areas to identify visibly spoiled, expired, or molding food items. AgeWellRI's role is limited to observation and reporting. Where technicians identify items that appear spoiled or expired, they will note the observation in the digital visit report and, where appropriate, notify the resident and/or the designated family contact so that the resident or family may decide whether to remove or discard the item. Technicians do not remove, discard, or dispose of the resident's food, medications, or other property under this Agreement, and do not open, move, or handle items beyond what is necessary for a visual check.",
  );
  renderParagraph(
    "To the fullest extent permitted by law, the Client releases AgeWellRI (and its officers, employees, and agents) from liability for foodborne illness, food spoilage, or any related illness arising from the condition of food in the home, and acknowledges that decisions to keep, remove, or discard any food item rest solely with the resident and their family. This release does not apply to loss or injury caused by AgeWellRI's gross negligence, recklessness, or willful misconduct.",
  );

  // SECTION 9
  drawSectionHeader(
    "9. MONTHLY RATE, CHECK PARITY, & RECURRING AUTO-BILLING TERMS",
    4.5,
  );
  renderSubsection(
    "Subscription Rate:",
    `Client authorizes Company to securely store their billing credentials on file and automatically process a recurring flat charge corresponding to their selected tier: $295.00 per month for Plan 1 OR $${planPrice}.00 per month for Plan 2.`,
  );
  renderSubsection(
    "Service Commencement:",
    "Regardless of the date on which the Client signs up, service and billing begin on the first (1st) day of the calendar month following sign-up. The Client's first automatic charge will process on that date for that month's scheduled biweekly visits, and recurring monthly billing will continue on the 1st of each calendar month thereafter. No charge is made, and no visits are scheduled, for the partial month in which the Client signs up.",
  );
  renderSubsection(
    "Automatic Processing:",
    "Payment is processed automatically and in advance on the 1st day of each calendar month for that upcoming month's scheduled biweekly services.",
  );
  renderSubsection(
    "Advance Billing Notification:",
    "As a matter of Company policy, Company's automated accounting system will issue an electronic notice (via email or SMS text statement) to Client fifteen (15) days prior to the end of each calendar month. This notice will detail the upcoming charge amount and explicitly state the processing date for the next month's service.",
  );
  renderSubsection(
    "Payment Method Parity:",
    "As a matter of AgeWellRI policy, clients who pay their recurring balance by physical or paper check receive the same base subscription rate as clients paying by credit card or ACH, with no penalty fee or processing surcharge for choosing check payment.",
  );
  renderSubsection(
    "Explicit Auto-Renewal Terms:",
    `Client acknowledges that this Agreement involves an automatically renewing monthly subscription ($295.00/month for Plan 1 or $${planPrice}.00/month for Plan 2). Services and recurring auto-billing will continue on the 1st of each calendar month until affirmatively canceled by the Client or Company in accordance with Section 10.`,
  );

  // SECTION 10
  drawSectionHeader(
    "10. CLIENT CANCELLATION & RISK TERMINATION POLICY",
    4.5,
  );
  renderSubsection(
    "Right to Cancel:",
    "Client may cancel this Agreement at any time by submitting a request via email to agewellri@gmail.com or through the client dashboard. A cancellation request is deemed received, and Company will begin processing it, immediately upon submission. A Client who cancels before their service commencement date under Section 9 owes nothing and is not subject to the notice period below, since no charge has yet processed and no services have yet been scheduled.",
  );
  renderSubsection(
    "Standard Cancellation Window:",
    "To prevent an automated recurring charge on the 1st of the upcoming month, Client's cancellation request must be submitted at least ten (10) days prior to the end of the current calendar month. If a cancellation request is received fewer than 10 days before the month's end, the upcoming monthly charge will process as scheduled, and services will permanently conclude at the end of that final paid month.",
  );
  renderSubsection(
    "Permanent Medical Exit Provision:",
    "In the event of a sudden, unexpected health change resulting in the senior resident being permanently placed into a hospital, skilled nursing rehabilitation facility, or long-term care community, the standard 10-day notice is completely waived. Upon receiving verifiable written notice or proof of facility admission, Company will immediately halt all future recurring auto-billing and issue a prorated refund for any unrendered service visits remaining in that active billing cycle.",
  );
  renderSubsection(
    "Rescheduling & Missed Visits:",
    "Client must provide a minimum of forty-eight (48) hours' notice to temporarily reschedule a biweekly block. Missed visits without 48 hours' notice will not be rescheduled or refunded and will be documented as missed. Company reserves the right to utilize its open evening and Saturday overflow windows to accommodate weather-related, municipal state-of-emergency, or medical reschedules.",
  );

  // SECTION 11
  drawSectionHeader(
    "11. PAPER INVOICE COMPLIANCE (RHODE ISLAND ONLY)",
    4.5,
  );
  renderParagraph(
    "In strict compliance with the Rhode Island Senior Savings Protection Act (R.I. Gen. Laws § 6-40.1-2), if the Client or senior resident is sixty-five (65) years of age or older and requests a printed, physical paper invoice sent via United States Postal Service mail rather than electronic delivery, Company will provide such physical mailings completely free of charge. No handling, processing, environmental, or printing fees will ever be applied to physical mailings.",
  );

  // SECTION 12
  drawSectionHeader(
    "12. REQUIRED AUTHORIZATIONS",
    4.5,
  );
  

  renderSubsection(
    "Section 12.2: Emergency Right of Entry Authorization",
    "EMERGENCY ACCESS AGREEMENT: Regardless of the selection made in Section 12.1, the Client explicitly grants AgeWellRI LLC the right to enter the home during a scheduled visit window if the technician has a reasonable belief that a medical emergency or safety crisis is occurring inside (e.g., viewing a resident fallen on the floor through a window, or hearing cries for help). I authorize AgeWellRI LLC to utilize any available key/code, contact emergency services (911), or follow instructions from designated family contacts. AgeWellRI LLC and its technicians shall be held completely harmless for any property damage (such as forced entry) or liabilities resulting from responding to a suspected medical or safety emergency in good faith, except to the extent caused by AgeWellRI’s gross negligence, recklessness, or willful misconduct.",
  );

  renderSubsection(
    "Section 12.3: Resident Autonomy & Refusal Acknowledgment",
    "RESIDENT BOUNDARIES ACKNOWLEDGMENT: Client acknowledges that AgeWellRI LLC technicians prioritize the dignity, comfort, and personal boundaries of all residents. If a resident explicitly refuses entry, objects to a specific safety checklist item, or requests that a technician leave a specific area during a scheduled visit, our technicians will immediately respect those boundaries and cease that portion of the service. Client agrees that such a refusal by the resident does not constitute a breach of contract by AgeWellRI LLC, and that the standard visit fee will still apply in full. Company is not liable for accidents or injuries caused by a hazard that remains in place solely because the resident declined to have it addressed, except to the extent caused by Company's gross negligence, recklessness, or willful misconduct.",
  );

  renderSubsection(
    "Section 12.4: Automatic Billing Authorization",
    `AUTOMATED MONTHLY CHARGE AUTHORIZATION: : I authorize AgeWellRI LLC to automatically charge my saved digital payment method or process my submitted check payment for the flat monthly fee corresponding to my selected tier ($295.00 for Plan 1 / $495.00 for Plan 2) on a recurring basis. I understand I can cancel this subscription at any time by emailing agewellri@gmail.com or utilizing my secure client dashboard portal link.`,
  );

  // SECTION 13
  drawSectionHeader(
    "13. PRIVACY AND CONFIDENTIALITY & OPERATIONAL POLICIES",
    4.5,
  );
  renderParagraph(
    "Client information is collected solely to deliver services and optimize home routing safety. It is never shared, sold, or disclosed to third-party marketing entities without explicit written consent except as required by law. Visit reports and digital dashboards are securely accessible only to the client and designated family care team members. Technicians must always maintain strict client confidentiality.",
  );
  renderSubsection(
    "13A. CLIENT REPRESENTATIONS & INDEMNIFICATION:",
    "The Client represents that all information the Client provides to AgeWellRI — including entry codes, contact information, the identity and authority of any representative, and details about the home and its occupants — is accurate and complete. To the fullest extent permitted by law, the Client agrees to indemnify and hold harmless AgeWellRI (and its owners, employees, and agents) from any claim, loss, or cost arising from inaccurate, incomplete, or outdated information the Client provides, including entry to an incorrect location or reliance on a representative who lacked actual authority. This indemnity does not apply to loss or injury caused by AgeWellRI's gross negligence, recklessness, or willful misconduct.",
  );
  renderSubsection(
    "13B. FORCE MAJEURE & INABILITY TO PERFORM:",
    "AgeWellRI is not in breach of this Agreement, and is not liable for any delay or failure to perform a scheduled visit, where performance is prevented or delayed by circumstances beyond its reasonable control — including severe weather, natural disaster, a declared state of emergency, public-health emergency, loss of utilities or access, or the illness or incapacity of its personnel. Where a visit cannot be performed for such a reason, AgeWellRI will make reasonable efforts to reschedule the visit within a reasonable time, or, if the visit cannot be rescheduled within the billing cycle, to credit or prorate the affected visit. This provision does not relieve the Client of payment obligations for services actually rendered.",
  );
  renderSubsection(
    "13C. CONSENT TO PHOTOGRAPH & SHARE REPORTS:",
    "The Client authorizes AgeWellRI to photograph the interior and exterior of the home during visits for the sole purpose of documenting safety findings, and to include those photographs in the Client's visit reports. Reports and photographs are created and processed using the Age Safe® America platform, stored in the Client's secure client portal, and, at the Client's request or as needed, delivered to the Client and their Authorized Recipients by email. Photographs are limited to areas and conditions relevant to home safety; AgeWellRI does not photograph the resident's person, medical information, or unrelated personal effects, and does not use these photographs for marketing or any purpose other than delivering and administering the services, except with the Client's separate written consent. The Client acknowledges that email is not a fully secure medium and consents to receiving reports and photographs by email where that delivery method is used.",
  );
  renderSubsection(
    "13D. AUTHORIZED REPORT RECIPIENTS:",
    "The Client designates, during sign-up and as updated from time to time, the specific family members, caregivers, or trusted contacts authorized to receive the Client's visit reports, photographs, and safety information (the “Authorized Recipients”). AgeWellRI will share reports and related information only with the Client and the Authorized Recipients, except as required by law or as described in Section 12.2 (emergency response). It is the Client's responsibility to keep the list of Authorized Recipients current, and to notify AgeWellRI promptly of any change or removal.",
  );
  renderSubsection(
    "13E. DATA RETENTION & DELETION:",
    "AgeWellRI retains the Client's reports, photographs, and account information for the duration of the service relationship and for a reasonable period afterward to meet legal, tax, and recordkeeping obligations, after which such data is deleted or de-identified in the ordinary course. Entry codes and similar access credentials are deleted promptly following cancellation of service or removal of keypad/smart-lock access. Upon written request, and subject to applicable law, the Client may request a copy of, or the deletion of, their personal information.",
  );
  renderSubsection(
    "13F. COMPANY RIGHT TO TERMINATE FOR CAUSE:",
    "In addition to the Client's cancellation rights under Section 10, AgeWellRI may suspend or terminate service, effective upon written notice, for cause — including non-payment, abusive or threatening conduct toward AgeWellRI personnel, conditions in or around the home that are unsafe for personnel to work in, or the Client's material breach of this Agreement. Where AgeWellRI terminates for cause other than non-payment or safety, it will refund any prepaid fees for visits not yet rendered in the then-current billing cycle.",
  );
  renderSubsection(
    "13G. FAILED OR NON-PAYMENT:",
    "If a scheduled automatic payment fails or is declined, AgeWellRI will notify the Client and may attempt to process the payment again. If payment is not successfully completed within a reasonable grace period after notice, AgeWellRI may pause scheduled visits until the balance is resolved, and may terminate service for continued non-payment under Section 13F. Paused or missed visits resulting from non-payment are not owed or refundable, and service resumes once payment is current.",
  );

  // SECTION 14
  drawSectionHeader("14. CLIENT COMPLAINTS", 4.5);
  renderParagraph(
    "AgeWellRI is committed to resolving any concern about our services promptly and fairly. If you have a complaint, please contact us first so we can address it directly: AgeWellRI — Client Concerns. Phone: (401) 212-3002. Email: agewellri@gmail.com.",
  );
  renderParagraph(
    "We will acknowledge your complaint within three (3) business days and work in good faith to resolve it. Please describe the concern, the visit or service involved, and the outcome you're seeking, so we can respond as quickly as possible.",
  );
  renderParagraph(
    "If we are unable to resolve your concern directly, Rhode Island consumers may contact the Rhode Island Office of the Attorney General, Consumer Protection Unit, which enforces the Rhode Island Deceptive Trade Practices Act (R.I. Gen. Laws Chapter 6-13.1). This provision does not limit any right or remedy available to you under law.",
  );

  // SECTION 15
  drawSectionHeader(
    "15. DISPUTE RESOLUTION, SEVERABILITY, & GOVERNING LAW",
    4.5,
  );
  renderParagraph(
    "Both parties agree to a good-faith resolution process before initiating any legal action, and mandatory mediation before formal litigation. This agreement is governed by and construed under the laws of the State of Rhode Island. This agreement supersedes all prior communications, verbal representations, or early text message drafts. Amendments require the express written consent of both parties. AgeWellRI LLC may update general terms with 30 days' notice; continued enrollment following notice constitutes acceptance of updated terms.",
  );
  renderSubsection(
    "Severability:",
    "If any provision or portion of this Agreement is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be severed or modified to the minimum extent necessary, and the remaining provisions of this Agreement shall continue in full force and effect.",
  );

  // SECTION 16: SIGNATURES
  drawSectionHeader("16. SIGNATURES & EXECUTION", 4.5);
  renderParagraph(
    "This Agreement is signed electronically through AgeWellRI's online client portal. One of the two signature tracks below applies, depending on who is signing.",
    2,
  );

  checkPageBreak(46);

  const sigBoxW = (contentWidth - 4) / 2;
  const sigBoxH = 43;

  // 1. Client / Signer Signature Box
  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, sigBoxW, sigBoxH, 1, 1, "FD");

  // Box 1 Header
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text(
    isRepresentative
      ? "TRACK B — REPRESENTATIVE SIGNATURE"
      : "TRACK A — RESIDENT SIGNATURE",
    margin + 3.5,
    y + 4.5,
  );
  doc.setFontSize(5.5);
  doc.setTextColor(...greenText);
  doc.text("✓ EXECUTED", margin + sigBoxW - 3.5, y + 4.5, { align: "right" });

  // White Signature Canvas Pad for Client
  const padX = margin + 3.5;
  const padY = y + 6.5;
  const padW = sigBoxW - 7;
  const padH = 15;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(padX, padY, padW, padH, 1, 1, "FD");

  // Digital Signature Image or Text
  if (clientSigPng && clientSigPng.startsWith("data:image")) {
    try {
      const isJpeg =
        clientSigPng.includes("image/jpeg") ||
        clientSigPng.includes("image/jpg");
      doc.addImage(
        clientSigPng,
        isJpeg ? "JPEG" : "PNG",
        padX + (padW - 48) / 2,
        padY + 1,
        48,
        13,
      );
    } catch {
      doc.setFont("times", "italic");
      doc.setFontSize(13);
      doc.setTextColor(...lightNavy);
      doc.text(signerLegalName, padX + padW / 2, padY + 10, {
        align: "center",
      });
    }
  } else if (clientSigPng) {
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.setTextColor(...lightNavy);
    doc.text(clientSigPng, padX + padW / 2, padY + 10, {
      align: "center",
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text("[Awaiting Digital Signature]", padX + padW / 2, padY + 9, {
      align: "center",
    });
  }

  // Client Signature Baseline
  doc.setDrawColor(210, 220, 230);
  doc.line(padX + 4, padY + padH - 1.5, padX + padW - 4, padY + padH - 1.5);

  // Client Signer Metadata
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(...darkText);
  doc.text(`Printed Name: ${signerLegalName}`, margin + 3.5, y + 25.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(...mutedText);
  if (isRepresentative) {
    const repCapText = formatCapacity(
      agreement.representativeCapacity || agreement.legalAuthority,
    );
    doc.text(`Capacity: ${repCapText}`, margin + 3.5, y + 29.5);
    doc.text(
      `On behalf of Resident: ${clientFullName}`,
      margin + 3.5,
      y + 33.5,
    );
    doc.text(`Execution Date: ${formattedDate}`, margin + 3.5, y + 37.5);
  } else {
    doc.text(
      "Capacity: Primary Resident (Self-Signer)",
      margin + 3.5,
      y + 29.5,
    );
    doc.text(`Execution Date: ${formattedDate}`, margin + 3.5, y + 33.5);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.2);
  doc.setTextColor(...greenText);
  doc.text(
    "✓ Verified Digital E-Signature (ESIGN / UETA Compliant)",
    margin + 3.5,
    y + (isRepresentative ? 40.8 : 37.5),
  );

  // 2. AgeWellRI Provider Counter-Signature Box
  const providerX = margin + sigBoxW + 4;
  doc.setFillColor(...lightGreenBg);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(providerX, y, sigBoxW, sigBoxH, 1, 1, "FD");

  // Provider Header
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...greenText);
  doc.text("AgeWellRI Authorized Signature", providerX + 3.5, y + 4.5);
  doc.setFontSize(5.5);
  doc.text("✓ AUTHORIZED", providerX + sigBoxW - 3.5, y + 4.5, {
    align: "right",
  });

  // White Signature Canvas Pad for Provider
  const provPadX = providerX + 3.5;
  const provPadY = y + 6.5;
  const provPadW = sigBoxW - 7;
  const provPadH = 15;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(provPadX, provPadY, provPadW, provPadH, 1, 1, "FD");

  if (providerSigPng) {
    try {
      doc.addImage(
        providerSigPng,
        "PNG",
        provPadX + (provPadW - 48) / 2,
        provPadY + 1,
        48,
        13,
      );
    } catch {
      doc.setDrawColor(41, 75, 104);
      doc.setLineWidth(0.65);
      doc.line(provPadX + 10, provPadY + 11, provPadX + 22, provPadY + 5);
      doc.line(provPadX + 22, provPadY + 5, provPadX + 34, provPadY + 12);
      doc.line(provPadX + 34, provPadY + 12, provPadX + 48, provPadY + 6);
      doc.line(provPadX + 48, provPadY + 6, provPadX + 60, provPadY + 11);
    }
  } else {
    doc.setDrawColor(41, 75, 104);
    doc.setLineWidth(0.65);
    doc.line(provPadX + 10, provPadY + 11, provPadX + 22, provPadY + 5);
    doc.line(provPadX + 22, provPadY + 5, provPadX + 34, provPadY + 12);
    doc.line(provPadX + 34, provPadY + 12, provPadX + 48, provPadY + 6);
    doc.line(provPadX + 48, provPadY + 6, provPadX + 60, provPadY + 11);
  }

  // Provider Signature Baseline
  doc.setDrawColor(187, 247, 208);
  doc.line(
    provPadX + 4,
    provPadY + provPadH - 1.5,
    provPadX + provPadW - 4,
    provPadY + provPadH - 1.5,
  );

  // Provider Metadata below signature pad
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.8);
  doc.setTextColor(...darkText);
  doc.text(` ${AGEWELL_OFFICER_NAME}`, providerX + 3.5, y + 25.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.8);
  doc.setTextColor(...mutedText);
  doc.text(` ${AGEWELL_OFFICER_TITLE}`, providerX + 3.5, y + 29.5);
  doc.text(`${AGEWELL_COMPANY_NAME}`, providerX + 3.5, y + 33.5);
  doc.text(
    "Phone: (401) 212-3002 • agewellri@gmail.com",
    providerX + 3.5,
    y + 37.5,
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.2);
  doc.setTextColor(...greenText);
  doc.text(
    "✓ Verified Provider Counter-Signature On File",
    providerX + 3.5,
    y + 40.8,
  );

  y += sigBoxH + 4;

  // ==========================================
  // PAGE NUMBERS & FOOTERS ACROSS ALL PAGES
  // ==========================================
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...borderColor);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(...mutedText);
    doc.text(
      `AgeWellRI LLC • Client Service Agreement (${stateCode}) • Ref: ${agreement.id?.slice(-8)?.toUpperCase() || "AW-AG"}`,
      margin,
      pageHeight - 6,
    );
    doc.text(
      `Page ${p} of ${totalPages}`,
      pageWidth - margin - 20,
      pageHeight - 6,
    );
  }

  // Save PDF file
  const safeFilename = `AgeWellRI_Service_Agreement_${clientFullName.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  doc.save(safeFilename);
}
