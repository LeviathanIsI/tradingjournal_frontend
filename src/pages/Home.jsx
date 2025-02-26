import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen pt-16 bg-white dark:bg-gray-900">
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
              track your performance, and become a better trader.
            </p>
            <div className="mt-8 sm:mt-10 flex items-center justify-center gap-x-4 sm:gap-x-6">
              <Link
                to="/signup"
                className="rounded-md bg-blue-600 px-4 sm:px-3.5 py-2.5 text-sm sm:text-base font-semibold text-white 
                  shadow-sm hover:bg-blue-700 dark:hover:bg-blue-500 w-full sm:w-auto max-w-[200px]"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16 sm:py-24">
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
                  title: "Comprehensive Trading",
                  description:
                    "Track entries, exits, position sizes, and strategies. Add notes to document your thought process.",
                },
                {
                  title: "Performance Analytics",
                  description:
                    "View detailed statistics and charts. Analyze your win rate, average returns, and risk metrics.",
                },
                {
                  title: "Journal & Reports",
                  description:
                    "Keep detailed notes on your trades and generate comprehensive reports to track your progress.",
                },
              ].map((feature, index) => (
                <div key={index} className="flex flex-col p-4 sm:p-6">
                  <div className="text-base sm:text-lg font-semibold leading-7 text-gray-900 dark:text-gray-100">
                    {feature.title}
                  </div>
                  <div className="mt-2 flex flex-auto flex-col text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-400">
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-6 text-center">
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          <Link to="/privacy-policy" className="hover:underline mx-2">
            Privacy Policy
          </Link>
          |
          <Link to="/terms-of-service" className="hover:underline mx-2">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Home;
