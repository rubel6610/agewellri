import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/legal/legal-layout";
import { Phone, Mail, Calendar, FileText, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "AgeWellRI Terms of Use",
  description:
    "Terms of Use for accessing and using the AgeWellRI website and client portal.",
};

export default function TermsOfUsePage() {
  return (
    <LegalLayout activeDocument="terms">
      <article className="space-y-8 sm:space-y-10 text-[#243746]">
        {/* Document Header */}
        <header className="border-b border-[#D9E4EC] pb-6 sm:pb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3F8] text-[#294B68] text-xs font-bold border border-[#5E8FB2]/20">
            <FileText className="w-4 h-4 text-[#5E8FB2]" />
            <span>Official Terms</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#243746] tracking-tight leading-tight">
            AgeWellRI Terms of Use
          </h1>

          <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-[#64748B]">
            <Calendar className="w-4 h-4 text-[#5E8FB2]" />
            <span>Last updated: 9/1/2026</span>
          </div>
        </header>

        {/* Introduction */}
        <div className="prose prose-slate max-w-none text-base sm:text-lg text-[#243746] leading-relaxed">
          <p>
            Welcome to AgeWellRI. These Terms of Use (&ldquo;Terms&rdquo;) govern your access to and use of our website
            and client portal (the &ldquo;Site&rdquo;). By creating an account or using the Site, you agree to these Terms.
            If you do not agree, please do not use the Site.
          </p>
        </div>

        {/* Service Agreement Clarification Note */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#EAF3F8] border border-[#5E8FB2]/30 flex items-start gap-3 text-base sm:text-lg text-[#243746]">
          <Info className="w-6 h-6 text-[#294B68] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Please note:</strong> These Terms cover your use of our website and account. They are separate from our
            Service Agreement, which is the contract that governs the home safety services you receive and which you will
            review and sign separately when you enroll in a plan.
          </p>
        </div>

        {/* Section 1: Eligibility and Accounts */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            1. Eligibility and Accounts
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            You must be at least 18 years old to create an account. You agree to provide accurate, current, and complete
            information when creating your account, and to keep it updated. You are responsible for maintaining the
            confidentiality of your login credentials and for activity that occurs under your account. Notify us promptly if
            you believe your account has been accessed without authorization.
          </p>
        </section>

        {/* Section 2: Use of the Site */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            2. Use of the Site
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            You agree to use the Site only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul className="space-y-3 text-base sm:text-lg text-[#243746] leading-relaxed list-disc list-outside pl-6 marker:text-[#294B68]">
            <li>Use the Site in any way that violates applicable law;</li>
            <li>Attempt to gain unauthorized access to the Site, other users&apos; accounts, or our systems;</li>
            <li>Interfere with or disrupt the operation of the Site;</li>
            <li>Copy, reproduce, or distribute Site content without permission; or</li>
            <li>Use the Site to transmit harmful, fraudulent, or misleading content.</li>
          </ul>
        </section>

        {/* Section 3: Our Content */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            3. Our Content
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            The content on the Site — including text, graphics, logos, and the AgeWellRI name — is owned by AgeWellRI or
            its licensors and is protected by applicable intellectual property laws. You may use the Site for your own
            personal, non-commercial purposes in connection with our services, but you may not otherwise copy, modify, or
            distribute our content without our written permission.
          </p>
        </section>

        {/* Section 4: Your Information */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            4. Your Information
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            Your use of the Site is also governed by our{" "}
            <Link
              href="/privacy-policy"
              className="font-bold text-[#5E8FB2] hover:text-[#294B68] underline focus-visible:outline-2 focus-visible:outline-[#5E8FB2] rounded"
            >
              Privacy Policy
            </Link>
            , which explains how we collect, use, and protect your information. By using the Site, you acknowledge our Privacy
            Policy.
          </p>
        </section>

        {/* Section 5: Third-Party Services */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            5. Third-Party Services
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            The Site may rely on or link to third-party services and platforms (such as our reporting and payment providers).
            We are not responsible for the content, practices, or availability of third-party services, and your use of them
            may be subject to their own terms.
          </p>
        </section>

        {/* Section 6: Site Availability and Changes */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            6. Site Availability and Changes
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            We work to keep the Site available and accurate, but we do not guarantee that it will be uninterrupted,
            error-free, or always current. We may modify, suspend, or discontinue any part of the Site at any time. We may
            also update these Terms from time to time; if we make material changes, we will post the updated Terms here and
            update the &ldquo;Last updated&rdquo; date above. Your continued use of the Site after changes take effect
            constitutes acceptance of the updated Terms.
          </p>
        </section>

        {/* Section 7: Disclaimers */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            7. Disclaimers
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            The Site is provided &ldquo;as is&rdquo; and &ldquo;as available.&rdquo; To the fullest extent permitted by law,
            AgeWellRI disclaims all warranties regarding the Site, whether express or implied, including warranties of
            merchantability, fitness for a particular purpose, and non-infringement. This section concerns the website only;
            the terms governing our services, including any service-related disclaimers and limitations, are set out in the
            Service Agreement.
          </p>
        </section>

        {/* Section 8: Limitation of Liability */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            8. Limitation of Liability
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            To the fullest extent permitted by law, AgeWellRI is not liable for any indirect, incidental, or consequential
            damages arising from your use of, or inability to use, the Site. This limitation concerns the website only and
            does not affect the terms of the Service Agreement.
          </p>
        </section>

        {/* Section 9: Governing Law */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            9. Governing Law
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            These Terms are governed by the laws of the State of Rhode Island, without regard to its conflict-of-laws rules.
          </p>
        </section>

        {/* Section 10: Contact Us */}
        <section className="space-y-4 pt-4 border-t border-[#D9E4EC]">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            10. Contact Us
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            Questions about these Terms? Contact us:
          </p>
          <div className="bg-[#EAF3F8] p-6 rounded-2xl border border-[#D9E4EC] space-y-3 text-base sm:text-lg">
            <p className="font-extrabold text-[#294B68] text-lg sm:text-xl">AgeWellRI</p>
            <p className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#5E8FB2] shrink-0" />
              <span>Phone: </span>
              <a
                href="tel:(401) 212-3002"
                className="font-bold text-[#294B68] hover:text-[#1E374D] underline focus-visible:outline-2 focus-visible:outline-[#5E8FB2] rounded"
              >
                (401) 212-3002
              </a>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#5E8FB2] shrink-0" />
              <span>Email: </span>
              <a
                href="mailto:agewellri@gmail.com"
                className="font-bold text-[#294B68] hover:text-[#1E374D] underline focus-visible:outline-2 focus-visible:outline-[#5E8FB2] rounded"
              >
                agewellri@gmail.com
              </a>
            </p>
          </div>
        </section>
      </article>
    </LegalLayout>
  );
}
