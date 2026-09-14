import jsPDF from "jspdf";

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
const AGEWELL_OFFICER_TITLE = "Founder & Director of Care Management";
const AGEWELL_COMPANY_NAME = "AgeWellRI Care Management LLC";
const AGEWELL_CONTACT_LINE =
  "AgeWellRI Care Management LLC • Westerly, RI • (401) 212-3002 • agewellri@gmail.com";

const OWNER_SIGNATURE_SVG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='70' viewBox='0 0 240 70'><path d='M 15 45 Q 35 15 60 40 T 110 35 T 160 45 T 210 30' stroke='%23294B68' stroke-width='2.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/><path d='M 45 42 Q 85 58 140 48' stroke='%23294B68' stroke-width='1.8' fill='none' stroke-linecap='round'/></svg>";

async function svgToPngDataUrl(
  svgStr: string,
  width = 360,
  height = 105,
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

/**
 * Formats representative capacity text for formal legal document presentation
 */
function formatCapacity(cap?: string | null): string {
  if (!cap) return "Authorized Representative";
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

/**
 * Formats home access method text
 */
function formatAccessType(accessType?: string | null): string {
  if (!accessType) return "Resident Answers Door";
  switch (accessType) {
    case "RESIDENT_ANSWERS":
      return "Resident Answers Door (Onsite Resident / Family Member greets specialist)";
    case "DIGITAL_CODE":
      return "Digital Keypad / Lockbox (Specialist enters via authorized code/lockbox)";
    case "LOCKBOX":
      return "Key Lockbox (Exterior key vault access)";
    default:
      return accessType.replace(/_/g, " ");
  }
}

/**
 * Generates and downloads a vector-based, high-fidelity PDF of the AgeWellRI Client Service Agreement.
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

  // Color Palette constants
  const navy: [number, number, number] = [36, 55, 70]; // #243746
  const lightNavy: [number, number, number] = [41, 75, 104]; // #294B68
  const skyBlue: [number, number, number] = [94, 143, 178]; // #5E8FB2
  const paleBg: [number, number, number] = [248, 250, 252]; // #F8FAFC
  const cardBg: [number, number, number] = [234, 243, 248]; // #EAF3F8
  const borderColor: [number, number, number] = [217, 228, 236]; // #D9E4EC
  const darkText: [number, number, number] = [36, 55, 70];
  const mutedText: [number, number, number] = [100, 116, 139]; // #64748B
  const greenText: [number, number, number] = [46, 125, 50]; // #2E7D32
  const lightGreenBg: [number, number, number] = [235, 248, 242];

  const checkPageBreak = (neededHeight: number): void => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 12;
    }
  };

  const drawSectionHeader = (title: string): void => {
    checkPageBreak(9);
    doc.setFillColor(...navy);
    doc.roundedRect(margin, y, contentWidth, 6.5, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3.5, y + 4.5);
    y += 8.2;
  };

  const statusUpper = (agreement.status || "").toUpperCase();
  const isExecuted =
    Boolean(agreement.clientSignature) ||
    statusUpper === "EXECUTED" ||
    statusUpper === "SIGNED" ||
    statusUpper === "ACTIVE" ||
    statusUpper === "COMPLETED" ||
    Boolean(agreement.signedAt) ||
    Boolean(agreement.executedAt);

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

  const clientName =
    agreement.clientFullName ||
    agreement.clientName ||
    agreement.clientPrintedName ||
    agreement.signerName ||
    "Client Member";

  const clientEmail = agreement.email || agreement.clientEmail || "N/A";
  const stateCode = agreement.state || "RI";
  const clientNumber =
    agreement.clientNumber || agreement.clientId || "AW-MEMBER";

  const isRepresentative =
    agreement.signingTrack === "TRACK_B" ||
    (agreement.signerRole && agreement.signerRole !== "RESIDENT") ||
    Boolean(agreement.authorizedRepName);

  const signerLegalName =
    agreement.signerName ||
    agreement.repFullName ||
    agreement.authorizedRepName ||
    agreement.clientPrintedName ||
    clientName;

  const rawPlanName =
    agreement.planName || agreement.selectedPlan || "Peace of Mind Plan";
  const planName = rawPlanName
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const planPrice = agreement.planPrice ?? 495;
  const hasCleaning = agreement.hasCleaningAddon || false;

  // ==========================================
  // DOCUMENT HEADER
  // ==========================================
  doc.setFillColor(...navy);
  doc.roundedRect(margin, y, contentWidth, 15, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("AgeWellRI", margin + 4, y + 6.2);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(190, 220, 240);
  doc.text(
    `Client Service Agreement (${stateCode} Jurisdiction)`,
    margin + 4,
    y + 11.5,
  );

  // Top Right Status Badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 50, y + 2.5, 46, 10, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...(isExecuted ? greenText : mutedText));
  doc.text(
    isExecuted ? "✓ EXECUTED & ACTIVE" : "⏳ PENDING SIGNATURE",
    pageWidth - margin - 47,
    y + 6.8,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(...mutedText);
  doc.text(
    `Doc Ref: ${agreement.id?.slice(-8)?.toUpperCase() || "AW-AG"}`,
    pageWidth - margin - 47,
    y + 10.2,
  );

  y += 17.5;

  // Metadata Sub-bar
  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 6.5, 1, 1, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...darkText);
  doc.text(`Client ID: ${clientNumber}`, margin + 3.5, y + 4.2);
  doc.text(
    `Template Version: ${agreement.templateVersion || agreement.version || "v2.0"}`,
    margin + 60,
    y + 4.2,
  );
  doc.text(`Effective Date: ${formattedDate}`, margin + 120, y + 4.2);

  y += 9;

  // ==========================================
  // 1. Resident / Client Information
  // ==========================================
  drawSectionHeader("1. Resident / Client Profile & Residence Location");
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
  doc.text(clientName, margin + 3.5, y + 8);
  const fullAddress =
    `${agreement.address || ""}${agreement.city ? `, ${agreement.city}` : ""}${agreement.state ? `, ${agreement.state}` : ""} ${agreement.postalCode || ""}`.trim() ||
    `${stateCode}, USA`;
  doc.text(
    fullAddress.length > 48 ? fullAddress.slice(0, 48) + "..." : fullAddress,
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

  y += 26.5;

  // ==========================================
  // 2. Signer Role & Legal Authority
  // ==========================================
  drawSectionHeader("2. Signing Track & Legal Representation Authority");
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
      : "Primary Resident",
    margin + 120,
    y + 8,
  );

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("RELATIONSHIP TO CLIENT", margin + 3.5, y + 14);
  doc.text("SIGNER PHONE", margin + 60, y + 14);
  doc.text("LEGAL AUTHORITY DOCUMENT", margin + 120, y + 14);

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
    doc.text("N/A (Signed by Resident)", margin + 120, y + 18.5);
  }

  y += 26.5;

  // ==========================================
  // 3. Primary & Emergency Contacts
  // ==========================================
  drawSectionHeader("3. Primary Billing & Emergency Contacts");
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
    (isRepresentative ? signerLegalName : clientName);
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

  y += 22.5;

  // ==========================================
  // 4. Authorized Report Recipients
  // ==========================================
  const recipients = agreement.authorizedRecipients || [];
  if (recipients.length > 0) {
    drawSectionHeader(
      "4. Authorized Report Recipients (Post-Visit Updates & Photos)",
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

    y += recBoxH + 2.5;
  }

  // ==========================================
  // 5. Home Access Method & Specifications
  // ==========================================
  drawSectionHeader("5. Home Access Specifications & Entry Authorization");
  checkPageBreak(22);

  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 20, 1, 1, "FD");

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("SCHEDULED ENTRY METHOD", margin + 3.5, y + 4);

  doc.setFontSize(7.5);
  doc.setTextColor(...darkText);
  doc.text(formatAccessType(agreement.homeAccessType), margin + 3.5, y + 8.5);

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text(
    "SPECIAL ACCESS INSTRUCTIONS & SECURITY PROTOCOL",
    margin + 3.5,
    y + 13.5,
  );

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  const instructions =
    agreement.homeAccessInstructions ||
    "Standard entry protocol. Specialist will knock and verify identity prior to entering property.";
  doc.text(
    instructions.length > 95 ? instructions.slice(0, 95) + "..." : instructions,
    margin + 3.5,
    y + 17.5,
  );

  y += 22.5;

  // ==========================================
  // 6. Contracted Service Plan & Pricing
  // ==========================================
  drawSectionHeader("6. Contracted Service Plan & Pricing Structure");
  checkPageBreak(22);

  doc.setFillColor(...cardBg);
  doc.setDrawColor(...skyBlue);
  doc.roundedRect(margin, y, contentWidth, 20, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...lightNavy);
  doc.text(planName, margin + 4, y + 5.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...mutedText);
  doc.text(
    "• Proactive safety oversight visits, fall-prevention checks, and routine environmental hazard mitigation.",
    margin + 4,
    y + 10,
  );

  if (hasCleaning) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(...greenText);
    doc.text(
      "✓ Enrolled in Light Cleaning Add-On ($50/month • 6 additional visits/year)",
      margin + 4,
      y + 14.5,
    );
  } else {
    doc.text(
      "• First month billed on Commencement Date (1st of calendar month). $0.00 charged at signup.",
      margin + 4,
      y + 14.5,
    );
  }

  // Price Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(pageWidth - margin - 44, y + 3, 40, 14, 1, 1, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.setTextColor(...mutedText);
  doc.text("TOTAL MONTHLY FEE", pageWidth - margin - 41, y + 6.8);
  doc.setFontSize(11);
  doc.setTextColor(...lightNavy);
  doc.text(`$${planPrice}`, pageWidth - margin - 41, y + 12.5);
  doc.setFontSize(6);
  doc.setTextColor(...mutedText);
  doc.text("/ month", pageWidth - margin - 22, y + 12.5);

  y += 22.5;

  // ==========================================
  // 7. Scope of Services & Operational Provisions
  // ==========================================
  drawSectionHeader("7. Scope of Services & Operational Coverage");
  checkPageBreak(32);

  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 30, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...lightNavy);
  doc.text(
    "Scope of Non-Medical Maintenance & Safety Assistance:",
    margin + 3.5,
    y + 4.5,
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.2);
  doc.setTextColor(...darkText);

  const scopeText1 =
    "• Bedrooms & Living Areas: Walk pathways, clear electrical cords, secure throw rugs with non-skid backing, ensure reachable emergency lighting and phones, and perform HEPA vacuuming/dusting for allergen reduction.";
  const scopeText2 =
    "• Life Safety Systems: Regularly tests and cleans smoke detectors, carbon monoxide alarms, fire extinguishers, and emergency alert devices; checks water heater temperature to prevent accidental scalding.";
  const scopeText3 =
    "• Kitchen & Laundry: Reorganizes heavy items to waist-level safe reach; inspects appliances for safety hazards; audits moisture, mold, and clears dryer lint exhaust pathways.";
  const scopeText4 =
    "• Non-Medical Scope Notice: AgeWellRI is a residential maintenance and home safety coordination service. Specialists do not provide clinical nursing, physical therapy, medical triage, or continuous emergency dispatch.";

  const sLines1 = doc.splitTextToSize(scopeText1, contentWidth - 7);
  const sLines2 = doc.splitTextToSize(scopeText2, contentWidth - 7);
  const sLines3 = doc.splitTextToSize(scopeText3, contentWidth - 7);
  const sLines4 = doc.splitTextToSize(scopeText4, contentWidth - 7);

  let scopeY = y + 8.5;
  doc.text(sLines1, margin + 3.5, scopeY);
  scopeY += sLines1.length * 2.8 + 1;
  doc.text(sLines2, margin + 3.5, scopeY);
  scopeY += sLines2.length * 2.8 + 1;
  doc.text(sLines3, margin + 3.5, scopeY);
  scopeY += sLines3.length * 2.8 + 1;
  doc.text(sLines4, margin + 3.5, scopeY);

  y += 32.5;

  // ==========================================
  // 8. State Statutory Consumer Rights & Cancellation
  // ==========================================
  drawSectionHeader(
    `8. Statutory Consumer Protection & Cancellation Rights (${stateCode})`,
  );
  checkPageBreak(25);

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(margin, y, contentWidth, 23, 1, 1, "FD");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(153, 27, 27);
  doc.text(
    "NOTICE OF MANDATORY 3-BUSINESS-DAY RIGHT TO CANCEL",
    margin + 3.5,
    y + 4.5,
  );

  doc.setFontSize(6.2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(127, 29, 29);
  const statutoryText = `Under ${stateCode} Consumer Protection Regulations (R.I. Gen. Laws § 6-28-3), you may cancel this agreement at any time prior to midnight of the third business day after the date of execution without penalty or obligation.`;
  const splitStat = doc.splitTextToSize(statutoryText, contentWidth - 7);
  doc.text(splitStat, margin + 3.5, y + 9);

  if (agreement.cancellationDeadline) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.text(
      `Statutory Cancellation Deadline: ${agreement.cancellationDeadline} (${agreement.cancellationDeadlineRule || "3 business days"})`,
      margin + 3.5,
      y + 19,
    );
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.text(
      "Regular Cancellation: Cancel at any time with 30-day written notice prior to monthly billing cycle.",
      margin + 3.5,
      y + 19,
    );
  }

  y += 25.5;

  // ==========================================
  // 9. Mandatory Contract Authorizations (12.2, 12.3, 12.4 & E-SIGN)
  // ==========================================
  const authClauses = [
    {
      num: "1",
      title: "Emergency Right of Entry Authorization (Section 12.2)",
      tag: "AGREED & AUTHORIZED",
      desc: "Authorized AgeWellRI to enter the home during a scheduled visit if a technician has a reasonable belief that a medical emergency or safety crisis is occurring inside, use any available key/code, contact emergency services (911), and follow designated family contacts' instructions. AgeWellRI and technicians are held harmless for property damage (such as forced entry) or liabilities resulting from a good-faith emergency response — except in cases of gross negligence, recklessness, or willful misconduct.",
    },
    {
      num: "2",
      title: "Resident Autonomy & Refusal of Service Acknowledgment (Section 12.3)",
      tag: "AGREED & AUTHORIZED",
      desc: "Acknowledged that AgeWellRI technicians respect the dignity, comfort, and personal boundaries of all residents. If a resident refuses entry, objects to a checklist item, or asks a technician to leave an area, the technician will immediately respect that and stop that part of the service. Refusal is not a breach of contract by AgeWellRI, the standard visit fee applies, and AgeWellRI is not liable for accidents caused by unaddressed hazards — except in cases of gross negligence, recklessness, or willful misconduct.",
    },
    {
      num: "3",
      title: "Automatic Recurring Monthly Billing Authorization (Section 12.4)",
      tag: "AGREED & AUTHORIZED",
      desc: `Authorized AgeWellRI to automatically charge the saved payment method on file the flat monthly fee for the selected plan ($${planPrice}/month) on a recurring basis on the 1st of each calendar month. Cancellation can be completed anytime via client dashboard or by emailing agewellri@gmail.com with 30-day notice.`,
    },
    {
      num: "4",
      title: "Electronic Signature & Records Disclosure (E-SIGN / UETA)",
      tag: "CONFIRMED & AGREED",
      desc: "Acknowledged and agreed that the electronic signature below is legally binding and equivalent to a handwritten signature under the Electronic Signatures in Global and National Commerce Act (E-SIGN) and the Uniform Electronic Transactions Act (UETA).",
    },
  ];

  // Calculate wrapped lines and total height for Section 9
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.9);
  const preparedClauses = authClauses.map((clause) => {
    const splitDesc = doc.splitTextToSize(clause.desc, contentWidth - 9);
    const itemHeight = 4.2 + splitDesc.length * 2.8 + 2.2;
    return { ...clause, splitDesc, itemHeight };
  });

  const totalAuthBoxHeight =
    preparedClauses.reduce((sum, c) => sum + c.itemHeight, 0) + 3;

  drawSectionHeader(
    "9. Mandatory Legal Authorizations & Consents (Sections 12.2 - 12.4)",
  );
  checkPageBreak(totalAuthBoxHeight + 5);

  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, totalAuthBoxHeight, 1, 1, "FD");

  let authItemY = y + 3.8;
  for (const clause of preparedClauses) {
    // Clause Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.8);
    doc.setTextColor(...lightNavy);
    doc.text(`✓ ${clause.num}. ${clause.title}`, margin + 3.5, authItemY);

    // Right-aligned status badge
    doc.setFont("helvetica", "bold");
    doc.setFontSize(5.5);
    doc.setTextColor(...greenText);
    doc.text(`[${clause.tag}]`, pageWidth - margin - 4, authItemY, {
      align: "right",
    });

    authItemY += 3.6;

    // Full Legal Body Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.9);
    doc.setTextColor(...darkText);
    doc.text(clause.splitDesc, margin + 4.5, authItemY);

    authItemY += clause.splitDesc.length * 2.8 + 2.4;
  }

  y += totalAuthBoxHeight + 3.5;

  // ==========================================
  // 10. Execution & Dual Electronic Signatures
  // ==========================================
  drawSectionHeader("10. Execution & Dual Electronic Signatures");
  checkPageBreak(48);

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
      ? "AUTHORIZED REPRESENTATIVE SIGNATURE"
      : "CLIENT / RESIDENT SIGNATURE",
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
  const padH = 16;
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
        padY + 1.5,
        48,
        13,
      );
    } catch {
      doc.setFont("times", "italic");
      doc.setFontSize(13);
      doc.setTextColor(...lightNavy);
      doc.text(signerLegalName, padX + padW / 2, padY + 11, {
        align: "center",
      });
    }
  } else if (clientSigPng) {
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.setTextColor(...lightNavy);
    doc.text(clientSigPng, padX + padW / 2, padY + 11, {
      align: "center",
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text("[Awaiting Digital Signature]", padX + padW / 2, padY + 10, {
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
  doc.text(`Printed Name: ${signerLegalName}`, margin + 3.5, y + 26.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...mutedText);
  const repCapText = isRepresentative
    ? formatCapacity(
        agreement.representativeCapacity || agreement.legalAuthority,
      )
    : "Primary Resident (Self)";
  doc.text(`Role: ${repCapText}`, margin + 3.5, y + 30.5);
  doc.text(`Execution Date: ${formattedDate}`, margin + 3.5, y + 34.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(...greenText);
  doc.text(
    "✓ Verified Digital E-Signature (ESIGN / UETA Compliant)",
    margin + 3.5,
    y + 39,
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
  doc.text("AGEWELLRI PROVIDER COUNTER-SIGNATURE", providerX + 3.5, y + 4.5);
  doc.setFontSize(5.5);
  doc.text("✓ AUTHORIZED", providerX + sigBoxW - 3.5, y + 4.5, {
    align: "right",
  });

  // White Signature Canvas Pad for Provider
  const provPadX = providerX + 3.5;
  const provPadY = y + 6.5;
  const provPadW = sigBoxW - 7;
  const provPadH = 16;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(provPadX, provPadY, provPadW, provPadH, 1, 1, "FD");

  // Render Provider Signature SVG image inside the white canvas pad
  if (providerSigPng) {
    try {
      doc.addImage(
        providerSigPng,
        "PNG",
        provPadX + (provPadW - 48) / 2,
        provPadY + 1.5,
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
  doc.text(`Officer: ${AGEWELL_OFFICER_NAME}`, providerX + 3.5, y + 26.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...mutedText);
  doc.text(`Title: ${AGEWELL_OFFICER_TITLE}`, providerX + 3.5, y + 30.5);
  doc.text(`Organization: ${AGEWELL_COMPANY_NAME}`, providerX + 3.5, y + 34.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.5);
  doc.setTextColor(...greenText);
  doc.text(
    "✓ Verified Provider Counter-Signature On File",
    providerX + 3.5,
    y + 39,
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
    doc.text(AGEWELL_CONTACT_LINE, margin, pageHeight - 6);
    doc.text(
      `Doc Ref: ${agreement.id?.slice(-8)?.toUpperCase() || "AW-AG"} • Page ${p} of ${totalPages}`,
      pageWidth - margin - 35,
      pageHeight - 6,
    );
  }

  // Save PDF file
  const safeFilename = `AgeWellRI_Service_Agreement_${clientName.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  doc.save(safeFilename);
}
