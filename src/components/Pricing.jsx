// src/components/Pricing.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

const Pricing = () => {
  const { user } = useAuth();

  const handleSubscribe = async (planType) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/create-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ planType }),
        }
      );

      const data = await response.json();

      if (data.success) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Subscription error:", error);
      // You might want to add error handling UI here
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="sm:flex sm:flex-col sm:align-center">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100">
          Pricing Plans
        </h1>
        <p className="mt-5 text-xl text-center text-gray-500 dark:text-gray-400">
          Choose the plan that best fits your needs
        </p>
      </div>

      <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
        {/* Monthly Plan */}
        <div className="border border-gray-200 dark:border-gray-600/50 rounded-md shadow-sm p-6 bg-white dark:bg-gray-700/60">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Monthly
          </h2>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-300">
            Perfect for getting started
          </p>
          <p className="mt-8">
            <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              $10
            </span>
            <span className="text-base font-medium text-gray-500 dark:text-gray-300">
              /month
            </span>
          </p>
          <button
            onClick={() => handleSubscribe("monthly")}
            className="mt-8 block w-full bg-blue-500 dark:bg-blue-500/90 text-white rounded-sm py-2 font-medium hover:bg-blue-600 dark:hover:bg-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:ring-offset-2"
          >
            Subscribe Monthly
          </button>
        </div>

        {/* Yearly Plan */}
        <div className="border border-gray-200 dark:border-gray-600/50 rounded-md shadow-sm p-6 bg-white dark:bg-gray-700/60">
          <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Yearly
          </h2>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-300">
            Save with yearly billing
          </p>
          <p className="mt-8">
            <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              $100
            </span>
            <span className="text-base font-medium text-gray-500 dark:text-gray-300">
              /year
            </span>
          </p>
          <button
            onClick={() => handleSubscribe("yearly")}
            className="mt-8 block w-full bg-blue-500 dark:bg-blue-500/90 text-white rounded-sm py-2 font-medium hover:bg-blue-600 dark:hover:bg-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:ring-offset-2"
          >
            Subscribe Yearly
          </button>
        </div>
      </div>

      <div className="mt-10 text-center">
        <p className="text-base text-gray-500 dark:text-gray-400">
          All plans include all features and unlimited trades
        </p>
      </div>
    </div>
  );
};

export default Pricing;
