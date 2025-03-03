import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-16 bg-white dark:bg-gray-800/70">
      {/* Hero section */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="py-20 sm:py-32 lg:py-40">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Track Your Trades,
              <br />
              Improve Your
              <br />
              Performance
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
              A comprehensive trading journal to help you analyze your trades,
              track your performance, and identify winning patterns with
              advanced analytics.
            </p>
            <div className="mt-8 sm:mt-10 flex items-center justify-center gap-x-4 sm:gap-x-6">
              <Link
                to="/signup"
                className="rounded-md bg-blue-500 dark:bg-blue-500/90 px-4 sm:px-3.5 py-2.5 text-sm sm:text-base font-semibold text-white 
                  shadow-sm hover:bg-blue-600 dark:hover:bg-blue-500 w-full sm:w-auto max-w-[200px]"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="bg-gray-50 dark:bg-gray-700/50 py-16 sm:py-24 border-t border-gray-200 dark:border-gray-600/50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-sm sm:text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">
              Track Better
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 px-4">
              Everything you need to analyze your trades
            </p>
          </div>

          <div className="mt-12 sm:mt-16 lg:mt-20">
            <div className="grid grid-cols-1 gap-y-8 sm:gap-y-12 lg:gap-y-16 lg:grid-cols-3 lg:gap-x-8">
              {/* Feature Cards */}
              {[
                {
                  title: "Comprehensive Trading Journal",
                  description:
                    "Track both stock and options trades with detailed metrics. Log entries, exits, position sizes, and implement your trading strategies with notes.",
                },
                {
                  title: "Advanced Performance Analytics",
                  description:
                    "Visualize your trading performance with hourly analysis, P/L charts, and win-rate tracking. Identify your most profitable trading hours and patterns.",
                },
                {
                  title: "Professional Tools & Reports",
                  description:
                    "Generate comprehensive reports, review trades with detailed notes, and track your account growth over time. Includes time-based filtering and trade type analysis.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col p-4 sm:p-6 bg-white dark:bg-gray-700/60 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm mx-4"
                >
                  <div className="text-base sm:text-lg font-semibold leading-7 text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </div>
                  <div className="mt-2 flex flex-auto flex-col text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300">
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription section */}
      <div className="py-16 sm:py-24 bg-white dark:bg-gray-700/60 border-t border-gray-200 dark:border-gray-600/50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm sm:text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">
              Pricing
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Simple, transparent pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 dark:bg-gray-600/30 p-6 rounded-md border border-gray-200 dark:border-gray-600/50 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Monthly Plan
              </h3>
              <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
                $10
                <span className="text-base font-normal text-gray-600 dark:text-gray-400">
                  /month
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Full access to all trading analytics</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Unlimited trade entries</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Stock and options trading</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Performance dashboards</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="block w-full text-center rounded-md bg-blue-500 dark:bg-blue-500/90 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Start monthly plan
                </Link>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-md border border-blue-200 dark:border-blue-400/30 shadow-sm relative">
              <div className="absolute top-0 right-0 bg-green-500 dark:bg-green-500/90 text-white text-xs px-2 py-1 rounded-bl-md font-medium">
                SAVE 16%
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Yearly Plan
              </h3>
              <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100">
                $100
                <span className="text-base font-normal text-gray-600 dark:text-gray-400">
                  /year
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>All monthly features</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Save $20 per year</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Priority customer support</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Early access to new features</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="block w-full text-center rounded-md bg-blue-500 dark:bg-blue-500/90 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Start yearly plan
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community section */}
      <div className="bg-gray-50 dark:bg-gray-600/30 py-16 sm:py-24 border-t border-gray-200 dark:border-gray-600/50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-sm sm:text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">
              Community
            </h2>
            <p className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Join fellow traders
            </p>
            <p className="mt-4 text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Connect with other traders, share insights, and learn from the
              community. Discuss trading strategies and market trends.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-700/40 py-6 text-center border-t border-gray-200 dark:border-gray-600/50">
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          <Link to="/privacy-policy" className="hover:underline mx-2">
            Privacy Policy
          </Link>
          |
          <Link to="/terms-of-service" className="hover:underline mx-2">
            Terms of Service
          </Link>
          |
          <Link to="/profile" className="hover:underline mx-2">
            My Account
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
