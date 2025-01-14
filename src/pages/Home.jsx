// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="w-screen min-h-[calc(100vh-64px)] bg-white">
      {/* Hero section */}
      <div className="w-full px-4 pt-14">
        <div className="w-full py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Track Your Trades,
              <br />
              Improve Your
              <br />
              Performance
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              A comprehensive trading journal to help you analyze your trades,
              track your performance, and become a better trader.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/signup"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature section */}
      <div className="w-full bg-gray-50 py-24 sm:py-32">
        <div className="w-full px-4 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">
              Track Better
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Everything you need to analyze your trades
            </p>
          </div>

          <div className="mt-16 sm:mt-20 lg:mt-24">
            <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Comprehensive Trading
                </div>
                <div className="mt-2 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p>
                    Track entries, exits, position sizes, and strategies. Add
                    notes and screenshots to document your thought process.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Performance Analytics
                </div>
                <div className="mt-2 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p>
                    View detailed statistics and charts. Analyze your win rate,
                    average returns, and risk metrics.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col">
                <div className="text-base font-semibold leading-7 text-gray-900">
                  Journal & Reports
                </div>
                <div className="mt-2 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p>
                    Keep detailed notes on your trades and generate
                    comprehensive reports to track your progress.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
