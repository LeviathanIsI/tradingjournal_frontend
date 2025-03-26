import { Link } from "react-router-dom";
import {
  Shield,
  ArrowLeft,
  Calendar,
  UserCheck,
  CreditCard,
  Lock,
  MessageCircle,
  FileText,
  AlertTriangle,
  Database,
  Key,
} from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="bg-white/90 dark:bg-gray-800/80 p-6 sm:p-8 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Privacy Policy
            </h1>
          </div>

          <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Last Updated: February 26, 2025</span>
          </div>

          <div className="prose prose-sm sm:prose max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-gray-600 dark:prose-p:text-gray-300">
            <p className="lead text-base">
              At Rivyl, we respect your privacy and are committed to protecting
              it. This Privacy Policy explains how we collect, use, and
              safeguard your information while using our trading journal
              platform.
            </p>

            <h2 className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <UserCheck className="h-5 w-5 text-primary" />
              Information We Collect
            </h2>
            <p>
              We collect personal information such as your name, email address,
              and trading data when you use our platform. This includes:
            </p>
            <ul>
              <li>Trade entries, exit points, and position sizes</li>
              <li>Notes, patterns, and strategies for each trade</li>
              <li>Performance metrics and trade statistics</li>
              <li>Trading journal entries and reflections</li>
              <li>Account preferences and dashboard customizations</li>
              <li>AI-assisted analysis data and user interactions</li>
            </ul>

            <h2 className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <FileText className="h-5 w-5 text-primary" />
              How We Use Your Information
            </h2>
            <p>We use your information to:</p>
            <ul>
              <li>
                Provide our comprehensive trading journal and analytics services
              </li>
              <li>Process subscription payments and manage your account</li>
              <li>Improve user experience and develop new features</li>
              <li>Ensure the security and integrity of our platform</li>
              <li>
                Generate pattern recognition insights and performance metrics
              </li>
              <li>Deliver AI-powered trade analyses and recommendations</li>
              <li>
                Support community features for traders who opt-in to sharing
              </li>
            </ul>

            <h2 className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Lock className="h-5 w-5 text-primary" />
              Data Security
            </h2>
            <p>
              We implement appropriate security measures to protect your
              personal information and trading data. Your trading data is
              private and not shared with other users unless you explicitly
              choose to share it through our community features. We utilize
              encryption, secure authentication, and regular security audits to
              protect your information.
            </p>

            <h2 className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <CreditCard className="h-5 w-5 text-primary" />
              Subscription Information
            </h2>
            <p>
              When you subscribe to our service, we collect payment information
              through our secure payment processor. We do not store complete
              credit card details on our servers. Subscription status and
              history are maintained for account management purposes. We offer
              various subscription tiers including free and premium plans with
              different feature sets.
            </p>

            <h2 className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Database className="h-5 w-5 text-primary" />
              AI Features Data Usage
            </h2>
            <p>
              Our AI-powered features analyze your trading data to provide
              personalized insights, pattern recognition, and performance
              enhancement suggestions. This data processing is performed
              securely and is only used to improve your specific trading
              experience. AI credits may be allocated based on your subscription
              tier, and usage is tracked to ensure fair service delivery.
            </p>

            <h2 className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <MessageCircle className="h-5 w-5 text-primary" />
              Contact Us
            </h2>
            <p>
              If you have any questions about our Privacy Policy, please contact
              us on Discord or email us at privacy@rivyl.app.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/40">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 dark:hover:text-primary/90 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const TermsOfService = () => {
  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="bg-white/90 dark:bg-gray-800/80 p-6 sm:p-8 rounded-sm border border-gray-200 dark:border-gray-700/60 shadow-md backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-full">
              <FileText className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold">
              Terms of Service
            </h1>
          </div>

          <div className="flex items-center gap-2 mb-6 text-gray-500 dark:text-gray-400 text-sm">
            <Calendar className="h-4 w-4" />
            <span>Last Updated: February 26, 2025</span>
          </div>

          <div className="prose prose-sm sm:prose max-w-none dark:prose-invert prose-headings:font-semibold prose-p:text-gray-600 dark:prose-p:text-gray-300">
            <p className="lead text-base">
              By accessing or using Rivyl, you agree to abide by these Terms of
              Service. If you do not agree with any part of these terms, please
              do not use our trading journal platform.
            </p>

            <h2 className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <UserCheck className="h-5 w-5 text-accent" />
              Use of Services
            </h2>
            <p>
              You must comply with all applicable laws while using Rivyl. We
              reserve the right to terminate accounts that violate our terms or
              engage in fraudulent activity. Our platform provides comprehensive
              trade tracking, analysis tools, and AI-powered insights to help
              traders improve their performance.
            </p>

            <h2 className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <CreditCard className="h-5 w-5 text-accent" />
              Subscriptions and Payments
            </h2>
            <p>Our service offers multiple subscription tiers including:</p>
            <ul>
              <li>Free tier with basic tracking features</li>
              <li>Monthly premium plan ($20/month) with advanced analytics</li>
              <li>Annual premium plan ($200/year) with full feature access</li>
              <li>
                Special AI credit packages for enhanced AI-powered features
              </li>
            </ul>
            <p>
              Subscriptions automatically renew unless canceled before the
              renewal date. You can manage your subscription settings, including
              cancellation, in your account profile. If you cancel your
              subscription, you will continue to have access until the end of
              your current billing period. No refunds are provided for partial
              billing periods.
            </p>

            <h2 className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <AlertTriangle className="h-5 w-5 text-accent" />
              Limitation of Liability
            </h2>
            <p>
              Rivyl is not responsible for any financial losses incurred while
              using our platform. Users assume full responsibility for their
              trading decisions. Our service is for journaling, analytics, and
              educational purposes only and does not provide specific trading
              advice or recommendations. AI-powered insights should be
              considered as supplementary information, not definitive trading
              guidance.
            </p>

            <h2 className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Database className="h-5 w-5 text-accent" />
              Data Storage and AI Features
            </h2>
            <p>
              We store your trading data and journal entries to provide our
              services. You retain ownership of your data, and we commit to
              protecting your privacy as outlined in our Privacy Policy. Our AI
              features analyze your trading patterns to provide personalized
              insights, but these are for educational purposes only. AI features
              may consume credits based on your subscription tier.
            </p>

            <h2 className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <Key className="h-5 w-5 text-accent" />
              Account Security
            </h2>
            <p>
              You are responsible for maintaining the security of your account
              credentials. We offer security features like Google
              authentication, security questions, and session management, but
              you must take reasonable precautions to protect your account. All
              sessions automatically expire at 2AM daily for enhanced security.
            </p>

            <h2 className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
              <MessageCircle className="h-5 w-5 text-accent" />
              Contact Us
            </h2>
            <p>
              For any questions regarding our Terms of Service or to get help
              with our trading journal platform, reach out to us at
              support@rivyl.app or through our Discord community.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/40">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 dark:hover:text-accent/90 font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export { PrivacyPolicy, TermsOfService };
