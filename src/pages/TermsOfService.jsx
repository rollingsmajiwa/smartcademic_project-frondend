import React from 'react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-[#10002b] py-16 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="space-y-4 border-b border-[#c77dff]/40 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#c77dff]/20 border border-[#c77dff]/50 text-[#10002b] text-sm font-bold shadow-sm">
            SmartAcademic Legal
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#10002b]">
            Terms of Service
          </h1>
          <p className="text-[#10002b]/70 font-medium">
            Last updated: November 2026 | Rules and guidelines for using the SmartAcademic platform.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-[#10002b]/85 leading-relaxed font-medium">
          
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#10002b]">1. Acceptance of Terms</h2>
            <p>
              By accessing or using SmartAcademic, you agree to be bound by these Terms of Service. If you are using the platform on behalf of an educational institution, you represent that you have the authority to bind that institution to these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#10002b]">2. Platform Modules & Usage</h2>
            <p>SmartAcademic provides specialized digital tools for educational institutions, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-[#10002b]">Geo-Fenced Attendance:</strong> Users agree not to spoof, bypass, or manipulate location settings when logging attendance.</li>
              <li><strong className="text-[#10002b]">Live Exams & Socratic AI (Mwalimu AI):</strong> Automated evaluation and AI assistance are provided as academic aids. Users must adhere to institutional honor codes during assessments.</li>
              <li><strong className="text-[#10002b]">Role-Based Access Control (RBAC):</strong> Access privileges must not be shared, compromised, or exploited outside assigned user roles.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#10002b]">3. Account Security & Credentials</h2>
            <p>
              Users are responsible for maintaining the confidentiality of their login credentials and tokenized access links. Sessions are regulated by security tokens (such as 24-hour access token lifetimes); unauthorized access attempts will result in immediate session revocation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#10002b]">4. Intellectual Property</h2>
            <p>
              All software architecture, UI layouts, branding elements, and system logic associated with SmartAcademic are the exclusive property of the platform developers and licensors.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-[#10002b]">5. Limitation of Liability</h2>
            <p>
              SmartAcademic is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted server uptime or error-free assessment processing during high-traffic institutional exams.
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
            to="/privacy" 
            className="text-sm font-bold text-[#10002b] hover:text-[#c77dff] transition-colors underline"
          >
            View Privacy Policy
          </Link>
        </div>

      </div>
    </div>
  );
}