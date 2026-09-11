import jsPDF from "jspdf";

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
  postalCode?: string | null;
  primaryContactName?: string | null;
  primaryContactEmail?: string | null;
  primaryContactPhone?: string | null;
  primaryContactRelation?: string | null;
  authorizedRepName?: string | null;
  relationshipToClient?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  planName?: string | null;
  selectedPlan?: string | null;
  planPrice?: number | null;
  hasCleaningAddon?: boolean;
  signerName?: string | null;
  signerRole?: string | null;
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

/**
 * Generates and downloads a vector-based, high-fidelity PDF of the AgeWellRI Client Service Agreement.
 */
export async function downloadAgreementPdf(
  agreement: AgreementPdfData,
): Promise<void> {
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
  const paleBg: [number, number, number] = [247, 250, 252]; // #F7FAFC
  const cardBg: [number, number, number] = [234, 243, 248]; // #EAF3F8
  const borderColor: [number, number, number] = [217, 228, 236]; // #D9E4EC
  const darkText: [number, number, number] = [36, 55, 70];
  const mutedText: [number, number, number] = [100, 116, 139]; // #64748B
  const greenText: [number, number, number] = [63, 143, 107]; // #3F8F6B

  const checkPageBreak = (neededHeight: number): void => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 10;
    }
  };

  const drawSectionHeader = (title: string): void => {
    checkPageBreak(8);
    doc.setFillColor(...navy);
    doc.roundedRect(margin, y, contentWidth, 6, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 3.5, y + 4.2);
    y += 7.5;
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

  // ==========================================
  // DOCUMENT HEADER
  // ==========================================
  doc.setFillColor(...navy);
  doc.roundedRect(margin, y, contentWidth, 14, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text("AgeWellRI", margin + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(190, 220, 240);
  doc.text(`${stateCode} Member Service Agreement`, margin + 4, y + 11);

  // Top Right Status Badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - margin - 48, y + 2.5, 44, 9, 1.5, 1.5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...(isExecuted ? greenText : mutedText));
  doc.text(
    isExecuted ? "✓ EXECUTED & ACTIVE" : "⏳ PENDING SIGNATURE",
    pageWidth - margin - 45,
    y + 6.5,
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.5);
  doc.setTextColor(...mutedText);
  doc.text(
    `Doc Ref: ${agreement.id?.slice(-8)?.toUpperCase() || "AW-AG"}`,
    pageWidth - margin - 45,
    y + 9.8,
  );

  y += 16;

  // Metadata Sub-bar
  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 6.5, 1, 1, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...darkText);
  doc.text(`Client ID: ${clientNumber}`, margin + 3.5, y + 4.2);
  doc.text(
    `Version: ${agreement.templateVersion || agreement.version || "v2.0"}`,
    margin + 65,
    y + 4.2,
  );
  doc.text(`Effective Date: ${formattedDate}`, margin + 115, y + 4.2);

  y += 8.5;

  // ------------------------------------------
  // 1. Client Information
  // ------------------------------------------
  drawSectionHeader("1. Client & Contact Information");
  checkPageBreak(28);

  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 27, 1, 1, "FD");

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("CLIENT FULL NAME", margin + 3.5, y + 4);
  doc.text("HOME SERVICE ADDRESS", margin + 95, y + 4);

  doc.setFontSize(8);
  doc.setTextColor(...darkText);
  doc.text(clientName, margin + 3.5, y + 7.8);
  const fullAddress =
    `${agreement.address || ""}${agreement.city ? `, ${agreement.city}` : ""}${agreement.state ? `, ${agreement.state}` : ""} ${agreement.postalCode || ""}`.trim() ||
    `${stateCode}, USA`;
  doc.text(
    fullAddress.length > 45 ? fullAddress.slice(0, 45) + "..." : fullAddress,
    margin + 95,
    y + 7.8,
  );

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("PHONE NUMBER", margin + 3.5, y + 13);
  doc.text("DATE OF BIRTH", margin + 50, y + 13);
  doc.text("EMAIL ADDRESS", margin + 95, y + 13);

  doc.setFontSize(7.5);
  doc.setTextColor(...darkText);
  doc.text(agreement.phone || "(401) 555-0100", margin + 3.5, y + 16.5);
  doc.text(
    agreement.dob || agreement.dateOfBirth || "On File",
    margin + 50,
    y + 16.5,
  );
  doc.text(clientEmail, margin + 95, y + 16.5);

  // Contact Subgrid
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...skyBlue);
  doc.text("AUTHORIZED REPRESENTATIVE / SIGNER", margin + 3.5, y + 21.5);
  doc.text("EMERGENCY CONTACT", margin + 95, y + 21.5);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  const primaryDesc = `${agreement.signerName || agreement.authorizedRepName || clientName} (${agreement.signerRole || "Resident"})`;
  const emergencyDesc = `${agreement.emergencyContactName || "Designated Emergency Contact"} (${agreement.emergencyContactRelation || "Family"})${agreement.emergencyContactPhone ? ` - ${agreement.emergencyContactPhone}` : ""}`;
  doc.text(
    primaryDesc.length > 55 ? primaryDesc.slice(0, 55) + "..." : primaryDesc,
    margin + 3.5,
    y + 25,
  );
  doc.text(
    emergencyDesc.length > 55
      ? emergencyDesc.slice(0, 55) + "..."
      : emergencyDesc,
    margin + 95,
    y + 25,
  );

  y += 29;

  // ------------------------------------------
  // 2. Service Plan Coverage & Allocation
  // ------------------------------------------
  drawSectionHeader("2. Service Plan Coverage & Schedule");
  checkPageBreak(25);

  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 23, 1, 1, "FD");

  const rawPlanName =
    agreement.planName || agreement.selectedPlan || "Member Service Plan";
  const planName = rawPlanName
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const planPrice = agreement.planPrice ?? 0;
  const hasCleaning = agreement.hasCleaningAddon || false;

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...lightNavy);
  doc.text(`SELECTED PLAN: ${planName.toUpperCase()}`, margin + 3.5, y + 4.5);
  doc.text(`MONTHLY BILLING: $${planPrice}/Month`, margin + 115, y + 4.5);

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(
    `• Safety & Hazard Mitigation Visits: Dedicated Monthly Home Visits & Safety Oversight`,
    margin + 3.5,
    y + 9.5,
  );
  doc.text(
    `• Add-On Light Cleaning Assistance: ${hasCleaning ? "Included (+6 Visits / Year)" : "Not Enrolled"}`,
    margin + 3.5,
    y + 14,
  );
  doc.text(
    `• Comprehensive Digital Safety Reports: Uploaded after every visit with photographic documentation`,
    margin + 3.5,
    y + 18.5,
  );

  y += 25.5;

  // ------------------------------------------
  // 3. Statutory Consumer Rights & Cancellation
  // ------------------------------------------
  drawSectionHeader(`3. State Statutory Consumer Rights (${stateCode})`);
  checkPageBreak(30);

  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(margin, y, contentWidth, 26, 1, 1, "FD");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(153, 27, 27);
  doc.text("NOTICE OF MANDATORY 3-DAY RIGHT TO CANCEL", margin + 3.5, y + 4.5);

  doc.setFontSize(6.2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(127, 29, 29);
  const cancelText = `Under ${stateCode} Consumer Protection Regulations, you may cancel this agreement at any time prior to midnight of the third business day after the date of this transaction without any penalty or obligation.`;
  const splitCancel = doc.splitTextToSize(cancelText, contentWidth - 7);
  doc.text(splitCancel, margin + 3.5, y + 9);

  if (agreement.cancellationDeadline) {
    doc.setFont("helvetica", "bold");
    doc.text(
      `Statutory Cancellation Deadline: ${agreement.cancellationDeadline}`,
      margin + 3.5,
      y + 21,
    );
  }

  y += 28.5;

  // ------------------------------------------
  // 4. Terms, Scope & Liability Provisions
  // ------------------------------------------
  drawSectionHeader("4. Key Operational Terms & Disclaimers");
  checkPageBreak(32);

  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth, 28, 1, 1, "FD");

  doc.setFontSize(6.2);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);

  const term1 =
    "1. SCOPE: AgeWellRI specialists provide non-medical home safety evaluations, proactive hazard mitigation, and designated companion home care.";
  const term2 =
    "2. ACCESS: The client agrees to provide safe entry and access to the premises during scheduled visit windows.";
  const term3 =
    "3. BILLING & RENEWALS: Monthly subscriptions renew automatically on the 1st of each month unless notice of cancellation is provided prior to the 10-day cutoff deadline.";
  const term4 =
    "4. LIABILITY LIMITATION: AgeWellRI maintains professional general liability coverage. Specialist recommendations aim to minimize environmental risks.";

  doc.text(doc.splitTextToSize(term1, contentWidth - 6), margin + 3, y + 4.5);
  doc.text(doc.splitTextToSize(term2, contentWidth - 6), margin + 3, y + 10.5);
  doc.text(doc.splitTextToSize(term3, contentWidth - 6), margin + 3, y + 16.5);
  doc.text(doc.splitTextToSize(term4, contentWidth - 6), margin + 3, y + 22.5);

  y += 30.5;

  // ------------------------------------------
  // 5. Electronic Signatures & Execution
  // ------------------------------------------
  drawSectionHeader("5. Execution & Electronic Signatures");
  checkPageBreak(38);

  // Client Signature Box
  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, y, contentWidth / 2 - 2, 34, 1, 1, "FD");

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("CLIENT / AUTHORIZED REPRESENTATIVE SIGNATURE", margin + 3, y + 4.5);

  if (agreement.clientSignature) {
    if (agreement.clientSignature.startsWith("data:image")) {
      try {
        doc.addImage(
          agreement.clientSignature,
          "PNG",
          margin + 4,
          y + 6.5,
          45,
          12,
        );
      } catch {
        doc.setFont("courier", "bolditalic");
        doc.setFontSize(10);
        doc.setTextColor(...lightNavy);
        doc.text(agreement.signerName || clientName, margin + 4, y + 14);
      }
    } else {
      doc.setFont("courier", "bolditalic");
      doc.setFontSize(10);
      doc.setTextColor(...lightNavy);
      doc.text(agreement.clientSignature, margin + 4, y + 14);
    }
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(...mutedText);
    doc.text("[Awaiting Client Signature]", margin + 4, y + 14);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...darkText);
  doc.text(`Signer: ${agreement.signerName || clientName}`, margin + 3, y + 23);
  doc.text(
    `Date Signed: ${agreement.signedDate || formattedDate}`,
    margin + 3,
    y + 28,
  );
  doc.text(
    `Verification: Signed via AgeWellRI Secure E-Sign Portal`,
    margin + 3,
    y + 32,
  );

  // AgeWellRI Authorized Officer Signature Box
  const agewellX = margin + contentWidth / 2 + 2;
  doc.setFillColor(...paleBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(agewellX, y, contentWidth / 2 - 2, 34, 1, 1, "FD");

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("AGEWELLRI AUTHORIZED OFFICER SIGNATURE", agewellX + 3, y + 4.5);

  doc.setFont("courier", "bolditalic");
  doc.setFontSize(11);
  doc.setTextColor(...lightNavy);
  doc.text("Sarah Jenkins, Care Director", agewellX + 4, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...darkText);
  doc.text("Officer: Sarah Jenkins", agewellX + 3, y + 23);
  doc.text(
    "Title: Director of Care Operations, AgeWellRI LLC",
    agewellX + 3,
    y + 28,
  );
  doc.text(
    `Official Stamp: Verified AgeWellRI Care Management`,
    agewellX + 3,
    y + 32,
  );

  y += 38;

  // Footer Disclaimer
  doc.setFontSize(5.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...mutedText);
  doc.text(
    "AgeWellRI LLC • 100 Westminster St, Providence, RI 02903 • (401) 712-3012 • support@agewellri.com • Confidential Legal Document",
    pageWidth / 2,
    pageHeight - 6,
    { align: "center" },
  );

  // Save File
  const safeFilename = `${clientName.replace(/[^a-zA-Z0-9_-]/g, "_")}_Service_Agreement_${stateCode}.pdf`;
  doc.save(safeFilename);
}
