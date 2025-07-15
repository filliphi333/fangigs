'use client';
export default function TermsOfUse() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-extrabold mb-6 text-center bg-gradient-to-r from-blue-600 to-pink-600 text-transparent bg-clip-text">
        Terms of Use
      </h1>

      <p className="text-gray-700 mb-6">Last updated: July 15, 2025</p>

      <p className="text-gray-700 mb-6">
        By using FanGigs (“we”, “our”, “us”), you agree to these Terms of Use. Please read them carefully before using the site.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">1. Eligibility</h2>
      <p className="text-gray-700 mb-6">
        You must be at least 18 years old to create an account or participate in any activities on this platform.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">2. User Accounts</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>You are responsible for the security of your account.</li>
        <li>Do not share your login credentials with others.</li>
        <li>You may not impersonate another person or create a fake profile.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">3. Content Guidelines</h2>
      <p className="text-gray-700 mb-4">You agree not to post or upload content that:</p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Is illegal, hateful, or abusive</li>
        <li>Violates intellectual property rights</li>
        <li>Involves minors or non-consensual acts</li>
        <li>Includes spam, scams, or misleading info</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">4. Payments & Transactions</h2>
      <p className="text-gray-700 mb-6">
        Users are responsible for negotiating and fulfilling their own payment terms. FanGigs is not responsible for enforcing private agreements unless explicitly stated.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">5. Termination</h2>
      <p className="text-gray-700 mb-6">
        We may suspend or terminate your access at any time for violating these terms or engaging in suspicious, illegal, or harmful behavior.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">6. Intellectual Property</h2>
      <p className="text-gray-700 mb-6">
        All platform content, branding, and code is the property of FanGigs unless otherwise noted. You may not use it without permission.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">7. Limitation of Liability</h2>
      <p className="text-gray-700 mb-6">
        FanGigs is not responsible for any damages, disputes, or losses resulting from interactions, job arrangements, or platform usage.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">8. Changes to Terms</h2>
      <p className="text-gray-700 mb-6">
        We reserve the right to update these terms at any time. Continued use of the platform constitutes acceptance of the new terms.
      </p>

      <h2 className="text-2xl font-bold mt-10 mb-4">9. Contact</h2>
      <p className="text-gray-700 mb-6">
        If you have questions, contact us at <strong>support@fangigs.com</strong>.
      </p>
    </main>
  );
}
