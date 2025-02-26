import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto py-16">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          Last Updated: February 26, 2025
        </p>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          At Rivyl, we respect your privacy and are committed to protecting it.
          This Privacy Policy explains how we collect, use, and safeguard your
          information.
        </p>
        <h2 className="mt-6 text-xl font-semibold">Information We Collect</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          We collect personal information such as your name, email address, and
          trading data when you use our platform.
        </p>
        <h2 className="mt-6 text-xl font-semibold">
          How We Use Your Information
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          We use your information to provide our services, improve user
          experience, and ensure the security of our platform.
        </p>
        <h2 className="mt-6 text-xl font-semibold">Contact Us</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          If you have any questions about our Privacy Policy, please contact us
          on Discord.
        </p>
      </div>
    </div>
  );
};

const TermsOfService = () => {
  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto py-16">
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
          You must comply with all applicable laws while using Rivyl. We reserve
          the right to terminate accounts that violate our terms.
        </p>
        <h2 className="mt-6 text-xl font-semibold">Limitation of Liability</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Rivyl is not responsible for any financial losses incurred while using
          our platform. Users assume full responsibility for their trading
          decisions.
        </p>
        <h2 className="mt-6 text-xl font-semibold">Contact Us</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          For any questions regarding our Terms of Service, reach out to us at
          support@rivyl.app.
        </p>
      </div>
    </div>
  );
};

export { PrivacyPolicy, TermsOfService };
