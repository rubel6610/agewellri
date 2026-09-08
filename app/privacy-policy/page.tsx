import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/legal-layout";
import { Phone, Mail, Calendar, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "AgeWellRI Privacy Policy",
  description:
    "Privacy Policy for AgeWellRI in-home safety oversight services for older adults in Rhode Island.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout activeDocument="privacy">
      <article className="space-y-8 sm:space-y-10 text-[#243746]">
        {/* Document Header */}
        <header className="border-b border-[#D9E4EC] pb-6 sm:pb-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF3F8] text-[#294B68] text-xs font-bold border border-[#5E8FB2]/20">
            <ShieldCheck className="w-4 h-4 text-[#5E8FB2]" />
            <span>Official Legal Policy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#243746] tracking-tight leading-tight">
            AgeWellRI Privacy Policy
          </h1>

          <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-[#64748B]">
            <Calendar className="w-4 h-4 text-[#5E8FB2]" />
            <span>Last updated: 9/1/2026</span>
          </div>
        </header>

        {/* Introduction */}
        <div className="prose prose-slate max-w-none text-base sm:text-lg text-[#243746] leading-relaxed">
          <p>
            AgeWellRI (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;) provides in-home safety oversight services for
            older adults in Rhode Island. Because our work takes us into your home and involves personal information
            about you and your family, we take privacy seriously. This policy explains what information we collect, how
            we use and protect it, and the choices you have.
          </p>
        </div>

        {/* Section: Information We Collect */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            Information We Collect
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            To provide our services, we collect:
          </p>
          <ul className="space-y-3 text-base sm:text-lg text-[#243746] leading-relaxed list-disc list-outside pl-6 marker:text-[#294B68]">
            <li>
              <strong>Contact and account information</strong> — names, home address, phone numbers, and email addresses for
              the resident and the family members or contacts you authorize.
            </li>
            <li>
              <strong>Home access information</strong> — if you authorize keypad or smart-lock entry, the entry code you
              provide.
            </li>
            <li>
              <strong>Safety assessment information</strong> — notes, findings, safety scores, and photographs of your home
              taken during visits to document hazards and safety conditions.
            </li>
            <li>
              <strong>Payment information</strong> — billing details needed to process your monthly subscription (handled
              through our payment processor).
            </li>
            <li>
              <strong>Communications</strong> — messages, requests, and complaints you send us.
            </li>
          </ul>
          <p className="text-base sm:text-lg text-[#64748B] leading-relaxed bg-[#F7FAFC] p-4 rounded-xl border border-[#D9E4EC]">
            We limit what we collect to what we need to deliver the service. Our photographs are of the home and its safety
            conditions — not of the resident&apos;s person, medical information, or unrelated personal belongings.
          </p>
        </section>

        {/* Section: How We Collect It */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            How We Collect It
          </h2>
          <ul className="space-y-3 text-base sm:text-lg text-[#243746] leading-relaxed list-disc list-outside pl-6 marker:text-[#294B68]">
            <li>
              <strong>When you sign up</strong> — through our online signup and client portal.
            </li>
            <li>
              <strong>During visits</strong> — our specialist records safety findings and photographs in the Age Safe® America
              platform, which we use to generate your safety reports.
            </li>
            <li>
              <strong>Through your account</strong> — as you update your information, authorized recipients, or preferences.
            </li>
          </ul>
        </section>

        {/* Section: Why We Collect It */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            Why We Collect It
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            We use your information solely to:
          </p>
          <ul className="space-y-3 text-base sm:text-lg text-[#243746] leading-relaxed list-disc list-outside pl-6 marker:text-[#294B68]">
            <li>Schedule and perform your safety visits,</li>
            <li>Create and deliver your safety reports and photos,</li>
            <li>Process your subscription payments,</li>
            <li>Communicate with you and your authorized recipients, and</li>
            <li>Improve and administer our services.</li>
          </ul>
          <p className="text-base sm:text-lg font-semibold text-[#294B68]">
            We do not sell your information, and we do not share it with third-party marketing companies.
          </p>
        </section>

        {/* Section: Who We Share It With */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            Who We Share It With
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            We share your information only:
          </p>
          <ul className="space-y-3 text-base sm:text-lg text-[#243746] leading-relaxed list-disc list-outside pl-6 marker:text-[#294B68]">
            <li>
              <strong>With your Authorized Recipients</strong> — the family members, caregivers, or contacts you designate to
              receive your safety reports and photos.
            </li>
            <li>
              <strong>With service providers who help us operate</strong> — such as the Age Safe® America platform (used to
              create and store reports and photos) and our payment processor (used to process billing). These providers handle
              your information under their own terms and security practices.
            </li>
            <li>
              <strong>In an emergency</strong> — as described in your Service Agreement, if we reasonably believe a medical or
              safety emergency is occurring.
            </li>
            <li>
              <strong>When required by law</strong> — for example, in response to a valid legal request.
            </li>
          </ul>
        </section>

        {/* Section: Third-Party Platforms */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            Third-Party Platforms
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            Some of your information — including safety reports and photographs — is created, processed, and stored using the
            Age Safe® America platform, and reports are stored in our client portal. Your information handled through these
            platforms is also subject to those providers&apos; own privacy and security practices. We encourage you to review
            the Age Safe® America platform&apos;s terms where applicable.
          </p>
        </section>

        {/* Section: How We Store and Protect Your Information */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            How We Store and Protect Your Information
          </h2>
          <ul className="space-y-3 text-base sm:text-lg text-[#243746] leading-relaxed list-disc list-outside pl-6 marker:text-[#294B68]">
            <li>
              Information is stored in access-controlled systems, and access is limited to AgeWellRI personnel who need it to
              serve your account.
            </li>
            <li>
              Entry codes are stored in a secure, access-controlled field in our client portal — never in your signed agreement —
              and are accessible only to the personnel assigned to your visits.
            </li>
            <li>
              We use reasonable administrative and technical safeguards to protect your information. No system is perfectly
              secure, but we take steps designed to keep your information safe.
            </li>
            <li>
              Where we deliver reports by email at your request, please note that email is not a fully secure medium.
            </li>
          </ul>
        </section>

        {/* Section: How Long We Keep It */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            How Long We Keep It
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            We retain your reports, photographs, and account information for the duration of your service relationship and
            for a reasonable period afterward to meet legal, tax, and recordkeeping obligations, after which it is deleted or
            de-identified in the ordinary course. Entry codes and similar access credentials are deleted promptly after you
            cancel service or remove keypad/smart-lock access.
          </p>
        </section>

        {/* Section: Your Rights and Choices */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            Your Rights and Choices
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            You may, at any time:
          </p>
          <ul className="space-y-3 text-base sm:text-lg text-[#243746] leading-relaxed list-disc list-outside pl-6 marker:text-[#294B68]">
            <li>Access the personal information we hold about you,</li>
            <li>Correct or update your information (including your list of Authorized Recipients),</li>
            <li>Request deletion of your personal information, subject to any legal or recordkeeping obligations, and</li>
            <li>Manage who receives your reports through your client portal.</li>
          </ul>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            To exercise any of these, contact us using the details below.
          </p>
        </section>

        {/* Section: Children's Privacy */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            Children&apos;s Privacy
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            Our services are directed to adults. We do not knowingly collect personal information from children.
          </p>
        </section>

        {/* Section: Changes to This Policy */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            Changes to This Policy
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            We may update this policy from time to time. If we make material changes, we will post the updated policy here
            and update the &ldquo;Last updated&rdquo; date above.
          </p>
        </section>

        {/* Section: Contact Us */}
        <section className="space-y-4 pt-4 border-t border-[#D9E4EC]">
          <h2 className="text-xl sm:text-2xl font-bold text-[#243746] border-l-4 border-[#294B68] pl-3.5">
            Contact Us
          </h2>
          <p className="text-base sm:text-lg text-[#243746] leading-relaxed">
            If you have questions or requests about your privacy, contact:
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
