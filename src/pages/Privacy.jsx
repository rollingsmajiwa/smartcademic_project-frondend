import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-[#10002b] py-16 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="space-y-4 border-b border-[#c77dff]/40 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#c77dff]/20 border border-[#c77dff]/50 text-[#10002b] text-sm font-bold shadow-sm">
            SmartAcademic Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#10002b]">
            Privacy Policy
          </h1>
          <p className="text-[#10002b]/70 font-medium">
            Last updated: November 2026 | Protecting your institutional data and personal privacy.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-[#10002b]/85 leading-relaxed font-medium">
          
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#10002b]">1. Introduction</h2>
            <p>
              Welcome to SmartAcademic. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our institutional management platform, including our web application, geo-fenced attendance tracking, live examination modules, and Mwalimu AI assistant.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#10002b]">2. Information We Collect</h2>
            <p>To provide a secure and efficient academic environment, we process the following categories of data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-[#10002b]">Account & Profile Data:</strong> Name, institutional email address, hashed passwords, and Role-Based Access Control (RBAC) designations (Student, Teacher, Administrator).</li>
              <li><strong className="text-[#10002b]">Location Data:</strong> Real-time coarse/fine geolocation data strictly processed for geo-fenced attendance verification to ensure campus presence.</li>
              <li><strong className="text-[#10002b]">Academic Interactions:</strong> Submissions during Live Exams, queries submitted to Mwalimu AI, and attendance records governed by punctuality logic.</li>
              <li><strong className="text-[#10002b]">Technical Data:</strong> Secure JWT session tokens, browser type, IP addresses, and access timestamps to secure system endpoints.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#10002b]">3. How We Use Your Information</h2>
            <p>Your data is used strictly for operational excellence and institutional compliance:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Enforcing secure role-based access across administrative and learning portals.</li>
              <li>Verifying physical or designated perimeter presence through geo-fenced attendance logic.</li>
              <li>Powering personalized tutoring and revision insights via Mwalimu AI.</li>
              <li>Issuing secure, tokenized email invitations for institutional onboarding.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#10002b]">4. Data Security & Retention</h2>
            <p>
              We implement industry-standard encryption, token expiration protocols (such as 24-hour access tokens), and secure cloud storage infrastructure. Data is retained only as long as necessary to fulfill academic terms or as mandated by institutional policies.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#10002b]">5. Contact Us</h2>
            <p>
              If you have any questions regarding this Privacy Policy, please contact your institutional administrator or reach out directly through our support portal.
            </p>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="pt-8 border-t border-[#c77dff]/40 flex flex-wrap gap-4 items-center justify-between">
          <Link 
            to="/" 
            className="px-6 py-2.5 rounded-xl bg-[#c77dff] text-[#10002b] font-bold text-sm shadow-md hover:bg-[#10002b] hover:text-white transition-all"
          >
            Back to Home
          </Link>
          <Link 
            to="/terms" 
            className="text-sm font-bold text-[#10002b] hover:text-[#c77dff] transition-colors underline"
          >
            View Terms of Service
          </Link>
        </div>

      </div>
    </div>
  );
}