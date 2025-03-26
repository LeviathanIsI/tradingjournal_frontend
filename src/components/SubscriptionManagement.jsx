import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ConfirmationDialog from "./ConfirmationDialog";
import {
  Activity,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

const SubscriptionManagement = () => {
  const { user, checkSubscriptionStatus, isSubscriptionLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false);
  const [newPlanType, setNewPlanType] = useState(null);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [reactivationPlanType, setReactivationPlanType] = useState(
    user?.subscription?.type || "monthly"
  );
  const [paymentMethod, setPaymentMethod] = useState("current");
  const loadingAttemptedRef = useRef(false);

  const planDetails = {
    monthly: {
      price: "$20",
      period: "month",
      billingFrequency: "Monthly billing",
    },
    yearly: {
      price: "$200",
      period: "year",
      billingFrequency: "Annual billing",
      savings: "Save $40/year",
    },
  };

  if (isSubscriptionLoading && !user?.subscription) {
    return (
      <div className="bg-white/90 dark:bg-gray-800/80 p-6 rounded-sm border border-gray-200 dark:border-gray-700/40 shadow-md backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700/50 rounded-full w-1/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700/50 rounded-full w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700/50 rounded-full w-3/4"></div>
        </div>
      </div>
    );
  }

  const handleUpdatePayment = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/create-portal-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error opening payment portal:", error);
      showToast("Failed to open payment portal. Please try again.", "error");
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/cancel-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        await checkSubscriptionStatus();
        showToast(
          "Your subscription has been cancelled and will end at the current billing period",
          "success"
        );
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      showToast("Failed to cancel subscription. Please try again.", "error");
    }
  };

  const handlePlanChange = async (newPlanType) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/update-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ planType: newPlanType }),
        }
      );

      const data = await response.json();

      if (data.success) {
        await checkSubscriptionStatus();
        showToast(`Successfully switched to ${newPlanType} plan`, "success");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error changing plan:", error);
      showToast("Failed to change plan. Please try again.", "error");
    }
  };

  const handleReactivateWithNewCard = async (planType) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/create-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            planType,
            isReactivation: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }

      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      showToast("Failed to create subscription. Please try again.", "error");
    }
  };

  const handleReactivate = async (planType) => {
    try {
      // Make sure planType is a string before sending
      const selectedPlanType =
        typeof planType === "string" ? planType : reactivationPlanType;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/reactivate-subscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ planType: selectedPlanType }),
        }
      );

      const data = await response.json();

      if (data.success) {
        await checkSubscriptionStatus();
        showToast(
          `Your subscription has been reactivated with the ${selectedPlanType} plan`,
          "success"
        );
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      showToast(
        "Failed to reactivate subscription. Please try again.",
        "error"
      );
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="bg-white/90 dark:bg-gray-800/80 p-6 rounded-sm border border-gray-200 dark:border-gray-700/40 shadow-md backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-5">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Subscription Details
          </h3>
        </div>

        <div className="space-y-5">
          {!user?.subscription?.active ? (
            // Inactive subscription state
            <>
              <div className="flex justify-between items-center p-3 bg-gray-50/80 dark:bg-gray-700/30 round-sm border border-gray-200/70 dark:border-gray-600/30">
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Status
                </span>
                <span className="inline-flex items-center px-2.5 py-1 round-sm text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300">
                  Inactive
                </span>
              </div>

              <div className="mt-4 p-5 bg-primary/10 rounded-sm border border-primary/20 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      Your subscription is currently inactive. Subscribe to
                      access all features.
                    </p>

                    <a
                      href="/pricing"
                      className="mt-4 w-full block px-4 py-2 text-sm text-center text-white bg-primary hover:bg-primary/90 
                      round-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors shadow hover:shadow-md"
                    >
                      View Plans
                    </a>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Active subscription content
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-4 bg-gray-50/80 dark:bg-gray-700/30 round-sm border border-gray-200/70 dark:border-gray-600/30">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Plan
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {user.subscription.type === "monthly"
                          ? "Monthly"
                          : "Yearly"}{" "}
                        Plan
                      </span>
                      <button
                        onClick={() => {
                          setNewPlanType(
                            user.subscription.type === "monthly"
                              ? "yearly"
                              : "monthly"
                          );
                          setShowPlanChangeDialog(true);
                        }}
                        className="text-sm text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary font-medium"
                      >
                        Switch to{" "}
                        {user.subscription.type === "monthly"
                          ? "Yearly"
                          : "Monthly"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/80 dark:bg-gray-700/30 round-sm border border-gray-200/70 dark:border-gray-600/30">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Status
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 round-sm text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                      Active
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/80 dark:bg-gray-700/30 round-sm border border-gray-200/70 dark:border-gray-600/30">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Next billing date
                    </span>
                    <span className="text-gray-900 dark:text-gray-100 font-medium">
                      {formatDate(user.subscription.currentPeriodEnd)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50/80 dark:bg-gray-700/30 round-sm border border-gray-200/70 dark:border-gray-600/30">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      Payment Method
                    </span>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-gray-100">
                        ••••{user?.subscription?.lastFourDigits || "****"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {user.subscription.paymentStatus === "failed" && (
                <div className="mt-5 p-5 bg-red-50/90 dark:bg-red-900/20 rounded-sm border border-red-200 dark:border-red-800/30 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-800 dark:text-red-300">
                        We weren't able to process your latest payment. Please
                        update your payment method to continue your
                        subscription.
                      </p>
                      <button
                        onClick={handleUpdatePayment}
                        className="mt-4 w-full px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 dark:hover:bg-red-500/90 
                        round-sm shadow hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-red-400/50"
                      >
                        Update Payment Method
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {user.subscription.cancelAtPeriodEnd ? (
                <div className="mt-5 p-5 bg-yellow-50/90 dark:bg-yellow-900/20 rounded-sm border border-yellow-200 dark:border-yellow-800/30 shadow-sm">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        Your subscription will end on{" "}
                        {formatDate(user.subscription.currentPeriodEnd)}
                      </p>
                      <button
                        onClick={() => setShowReactivateDialog(true)}
                        className="mt-4 w-full px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-600 dark:hover:bg-green-500/90 
                        round-sm shadow hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          <span>Reactivate Subscription</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700/40">
                  <button
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 
                    round-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400/50"
                  >
                    Cancel Subscription
                  </button>
                  <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Your subscription will continue until the end of the current
                    billing period
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        title="Cancel Subscription"
        footer={
          <>
            <button
              onClick={() => {
                handleCancelSubscription();
                setShowCancelDialog(false);
              }}
              className="w-full sm:w-auto px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 dark:bg-red-500/90 dark:hover:bg-red-500 round-sm shadow"
            >
              Yes, cancel subscription
            </button>
            <button
              onClick={() => setShowCancelDialog(false)}
              className="w-full sm:w-auto px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600/70 round-sm mt-3 sm:mt-0"
            >
              No, keep my subscription
            </button>
          </>
        }
      >
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to cancel your subscription? You'll continue to
          have access until {formatDate(user?.subscription?.currentPeriodEnd)}.
        </p>
      </ConfirmationDialog>

      <ConfirmationDialog
        isOpen={showPlanChangeDialog}
        onClose={() => setShowPlanChangeDialog(false)}
        title="Change Subscription Plan"
        footer={
          <>
            <button
              onClick={() => {
                handlePlanChange(newPlanType);
                setShowPlanChangeDialog(false);
              }}
              className="w-full sm:w-auto px-4 py-2 text-sm text-white bg-primary hover:bg-primary/90 dark:hover:bg-primary/80 round-sm shadow"
            >
              Confirm Change
            </button>
            <button
              onClick={() => setShowPlanChangeDialog(false)}
              className="w-full sm:w-auto px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600/70 round-sm mt-3 sm:mt-0"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            You're about to switch from a {user?.subscription?.type} plan to a{" "}
            {newPlanType} plan.
          </p>

          <div className="p-4 bg-gray-50/80 dark:bg-gray-700/30 round-sm border border-gray-200/70 dark:border-gray-600/30">
            <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">
              New Plan Details:
            </h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>
                • {planDetails[newPlanType]?.price} per{" "}
                {planDetails[newPlanType]?.period}
              </li>
              <li>• {planDetails[newPlanType]?.billingFrequency}</li>
              {newPlanType === "yearly" && (
                <li className="text-green-600 dark:text-green-400">
                  • {planDetails.yearly.savings}
                </li>
              )}
            </ul>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your new billing cycle will start immediately.
          </p>
        </div>
      </ConfirmationDialog>

      <ConfirmationDialog
        isOpen={showReactivateDialog}
        onClose={() => setShowReactivateDialog(false)}
        title="Reactivate Subscription"
        footer={
          <>
            <button
              onClick={() => {
                if (paymentMethod === "current") {
                  handleReactivate(reactivationPlanType);
                } else {
                  // Create new checkout session for new card
                  handleReactivateWithNewCard(reactivationPlanType);
                }
                setShowReactivateDialog(false);
              }}
              className="w-full sm:w-auto px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-600 dark:bg-green-500/90 dark:hover:bg-green-500 round-sm shadow"
            >
              Reactivate Subscription
            </button>
            <button
              onClick={() => setShowReactivateDialog(false)}
              className="w-full sm:w-auto px-4 py-2 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700/40 border border-gray-300 dark:border-gray-600/70 round-sm mt-3 sm:mt-0"
            >
              Cancel
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Your previous subscription was a {user?.subscription?.type} plan.
            Please select which plan you'd like to reactivate with:
          </p>

          <div className="space-y-3 bg-gray-50/80 dark:bg-gray-700/30 p-4 round-sm border border-gray-200/70 dark:border-gray-600/30">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="monthly"
                name="plan"
                value="monthly"
                checked={reactivationPlanType === "monthly"}
                onChange={(e) => setReactivationPlanType(e.target.value)}
                className="h-4 w-4 text-primary focus:ring-primary/50 rounded-full border-gray-300 dark:border-gray-600/70"
              />
              <label
                htmlFor="monthly"
                className="text-gray-700 dark:text-gray-300"
              >
                Monthly Plan - {planDetails.monthly.price}/month
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="yearly"
                name="plan"
                value="yearly"
                checked={reactivationPlanType === "yearly"}
                onChange={(e) => setReactivationPlanType(e.target.value)}
                className="h-4 w-4 text-primary focus:ring-primary/50 rounded-full border-gray-300 dark:border-gray-600/70"
              />
              <label
                htmlFor="yearly"
                className="text-gray-700 dark:text-gray-300"
              >
                Yearly Plan - {planDetails.yearly.price}/year
                <span className="ml-2 text-sm text-green-600 dark:text-green-400">
                  {planDetails.yearly.savings}
                </span>
              </label>
            </div>
          </div>

          <div className="mt-6 border-t pt-6 border-gray-200 dark:border-gray-700/40">
            <h4 className="font-medium mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Payment Method
            </h4>
            <div className="space-y-3 bg-gray-50/80 dark:bg-gray-700/30 p-4 round-sm border border-gray-200/70 dark:border-gray-600/30">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="current-card"
                  name="payment"
                  value="current"
                  checked={paymentMethod === "current"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary/50 rounded-full border-gray-300 dark:border-gray-600/70"
                />
                <label
                  htmlFor="current-card"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Use current card (••••
                  {user?.subscription?.lastFourDigits || "****"})
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="new-card"
                  name="payment"
                  value="new"
                  checked={paymentMethod === "new"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary/50 rounded-full border-gray-300 dark:border-gray-600/70"
                />
                <label
                  htmlFor="new-card"
                  className="text-gray-700 dark:text-gray-300"
                >
                  Use a new card
                </label>
              </div>
            </div>
          </div>

          <div className="p-4 bg-primary/10 round-sm border border-primary/20 mt-4">
            <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Selected Plan Details:
            </h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              <li>
                • {planDetails[reactivationPlanType].price} per{" "}
                {planDetails[reactivationPlanType].period}
              </li>
              <li>• {planDetails[reactivationPlanType].billingFrequency}</li>
              {reactivationPlanType === "yearly" && (
                <li className="text-green-600 dark:text-green-400">
                  • {planDetails.yearly.savings}
                </li>
              )}
            </ul>
          </div>
        </div>
      </ConfirmationDialog>
    </>
  );
};

export default SubscriptionManagement;
