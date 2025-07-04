export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="bg-white rounded-lg shadow p-8 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
            <p className="text-gray-700">
              We collect information you provide directly to us, such as when you create an account, update your
              profile, or use our services. This includes your name, email address, and any other information you choose
              to provide.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
            <p className="text-gray-700">
              We use the information we collect to provide, maintain, and improve our services, process transactions,
              send you technical notices and support messages, and communicate with you about products, services, and
              promotional offers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Information Sharing</h2>
            <p className="text-gray-700">
              We do not sell, trade, or otherwise transfer your personal information to third parties without your
              consent, except as described in this policy or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Security</h2>
            <p className="text-gray-700">
              We implement appropriate security measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about this Privacy Policy, please contact us at privacy@crm.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
