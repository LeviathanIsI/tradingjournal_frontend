import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-700/60 text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto py-16">
        <div className="bg-white dark:bg-gray-600/30 p-6 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Last Updated: February 26, 2025
          </p>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            At Rivyl, we respect your privacy and are committed to protecting
            it. This Privacy Policy explains how we collect, use, and safeguard
            your information.
          </p>
          <h2 className="mt-6 text-xl font-semibold">Information We Collect</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            We collect personal information such as your name, email address,
            and trading data when you use our platform. This includes trade
            entries, notes, and performance data that you input through our
            trading journal.
          </p>

          <h2 className="mt-6 text-xl font-semibold">
            How We Use Your Information
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            We use your information to:
          </p>
          <ul className="list-disc ml-6 mt-2 text-gray-600 dark:text-gray-300">
            <li className="mt-1">
              Provide our trading journal and analytics services
            </li>
            <li className="mt-1">
              Process subscription payments and manage your account
            </li>
            <li className="mt-1">
              Improve user experience and develop new features
            </li>
            <li className="mt-1">
              Ensure the security and integrity of our platform
            </li>
          </ul>

          <h2 className="mt-6 text-xl font-semibold">Data Security</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            We implement appropriate security measures to protect your personal
            information and trading data. Your trading data is private and not
            shared with other users unless you explicitly choose to share it
            through our community features.
          </p>

          <h2 className="mt-6 text-xl font-semibold">
            Subscription Information
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            When you subscribe to our service, we collect payment information
            through our secure payment processor. We do not store complete
            credit card details on our servers. Subscription status and history
            are maintained for account management purposes.
          </p>

          <h2 className="mt-6 text-xl font-semibold">Contact Us</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            If you have any questions about our Privacy Policy, please contact
            us on Discord or email us at privacy@rivyl.app.
          </p>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600/50">
            <Link
              to="/"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const TermsOfService = () => {
  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-700/60 text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto py-16">
        <div className="bg-white dark:bg-gray-600/30 p-6 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm">
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Last Updated: February 26, 2025
          </p>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            By accessing or using Rivyl, you agree to abide by these Terms of
            Service. If you do not agree with any part of these terms, please do
            not use our services.
          </p>

          <h2 className="mt-6 text-xl font-semibold">Use of Services</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            You must comply with all applicable laws while using Rivyl. We
            reserve the right to terminate accounts that violate our terms or
            engage in fraudulent activity.
          </p>

          <h2 className="mt-6 text-xl font-semibold">
            Subscriptions and Payments
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Our service offers monthly ($10/month) and yearly ($100/year)
            subscription plans. Subscriptions automatically renew unless
            canceled before the renewal date. You can manage your subscription
            settings, including cancellation, in your account profile.
          </p>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            If you cancel your subscription, you will continue to have access
            until the end of your current billing period. No refunds are
            provided for partial billing periods.
          </p>

          <h2 className="mt-6 text-xl font-semibold">
            Limitation of Liability
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Rivyl is not responsible for any financial losses incurred while
            using our platform. Users assume full responsibility for their
            trading decisions. Our service is for journaling and analysis
            purposes only and does not provide trading advice or
            recommendations.
          </p>

          <h2 className="mt-6 text-xl font-semibold">Data Storage</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            We store your trading data and journal entries to provide our
            services. You retain ownership of your data, and we commit to
            protecting your privacy as outlined in our Privacy Policy.
          </p>

          <h2 className="mt-6 text-xl font-semibold">Account Security</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            You are responsible for maintaining the security of your account
            credentials. We offer security features like Google authentication,
            but you must take reasonable precautions to protect your account.
          </p>

          <h2 className="mt-6 text-xl font-semibold">Contact Us</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            For any questions regarding our Terms of Service, reach out to us at
            support@rivyl.app.
          </p>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600/50">
            <Link
              to="/"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PrivacyPolicy, TermsOfService };
