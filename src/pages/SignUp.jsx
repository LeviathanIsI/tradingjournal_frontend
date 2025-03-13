// src/pages/SignUp.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  UserPlus,
  Mail,
  Lock,
  AlertTriangle,
  Shield,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "In what city were you born?",
  "What was your first car?",
  "What elementary school did you attend?",
  "What is your mother's maiden name?",
  "What was the name of your favorite teacher?",
  "What is the name of the street you grew up on?",
  "What was your childhood nickname?",
  "What is your father's middle name?",
  "What was the first concert you attended?",
];

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    securityQuestions: {
      question1: {
        question: "",
        answer: "",
      },
      question2: {
        question: "",
        answer: "",
      },
      question3: {
        question: "",
        answer: "",
      },
    },
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [availableQuestions, setAvailableQuestions] =
    useState(SECURITY_QUESTIONS);

  const getSelectedQuestions = () => [
    formData.securityQuestions.question1.question,
    formData.securityQuestions.question2.question,
    formData.securityQuestions.question3.question,
  ];

  // Handle question selection
  const handleQuestionChange = (questionNumber, selectedQuestion) => {
    const oldQuestion = formData.securityQuestions[questionNumber].question;

    setFormData((prev) => ({
      ...prev,
      securityQuestions: {
        ...prev.securityQuestions,
        [questionNumber]: {
          ...prev.securityQuestions[questionNumber],
          question: selectedQuestion,
        },
      },
    }));

    // Update available questions
    setAvailableQuestions((prev) => {
      const newQuestions = [...prev];
      if (oldQuestion) {
        newQuestions.push(oldQuestion); // Add back the old question
      }
      if (selectedQuestion) {
        const index = newQuestions.indexOf(selectedQuestion);
        if (index > -1) {
          newQuestions.splice(index, 1); // Remove the newly selected question
        }
      }
      return newQuestions.sort();
    });
  };

  // Handle answer changes
  const handleAnswerChange = (questionNumber, answer) => {
    setFormData((prev) => ({
      ...prev,
      securityQuestions: {
        ...prev.securityQuestions,
        [questionNumber]: {
          ...prev.securityQuestions[questionNumber],
          answer,
        },
      },
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate security questions
    const securityQuestionsComplete = Object.values(
      formData.securityQuestions
    ).every((q) => q.question && q.answer);

    if (!securityQuestionsComplete) {
      setError("Please complete all security questions and answers");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            // Add expiry at 2 AM next day flag
            expireAt2AM: true,
            // Mark as new user for special handling
            isNewUser: true,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Set isNewUser flag to ensure proper handling in login process
      data.data.isNewUser = true;

      // Login the user - login() will handle the redirect to dashboard
      await login(data.data);

      // No need to navigate here as login() will handle it
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSecurityQuestions = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((num) => {
        const questionKey = `question${num}`;
        const currentQuestion =
          formData.securityQuestions[questionKey].question;

        // Get available questions for this dropdown
        const dropdownOptions = [...availableQuestions];
        if (currentQuestion) {
          dropdownOptions.push(currentQuestion);
        }
        dropdownOptions.sort();

        return (
          <div key={questionKey} className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Security Question {num}
              </label>
              <div className="relative">
                <select
                  value={currentQuestion}
                  onChange={(e) =>
                    handleQuestionChange(questionKey, e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600/70 
                  text-gray-900 dark:text-gray-100 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/30 
                  shadow-sm appearance-none pr-8"
                  required
                >
                  <option value="">Select a question</option>
                  {dropdownOptions.map((question) => (
                    <option key={question} value={question}>
                      {question}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {currentQuestion && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Answer
                </label>
                <input
                  type="text"
                  value={formData.securityQuestions[questionKey].answer}
                  onChange={(e) =>
                    handleAnswerChange(questionKey, e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600/70 
                  text-gray-900 dark:text-gray-100 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/30 shadow-sm"
                  required
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const handleGoogleSignup = () => {
    // Add the expireAt2AM parameter to the Google auth URL and flag new user
    window.location.href = `${
      import.meta.env.VITE_API_URL
    }/api/auth/google?expireAt2AM=true&isNewUser=true`;
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12">
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-800/80 p-6 sm:p-8 rounded-lg border border-gray-200 dark:border-gray-700/60 shadow-md backdrop-blur-sm mx-4">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 dark:bg-primary/20 rounded-full mb-4">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Create your account
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Start tracking your trading performance today
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-red-700 dark:text-red-300 px-4 py-3 rounded-md flex items-start gap-3 shadow-sm">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Account Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-1 w-5 bg-primary rounded-full"></div>
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                Account Information
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    <UserPlus className="h-4 w-4" />
                  </span>
                  <input
                    name="username"
                    type="text"
                    required
                    className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600/70 px-3 py-2 
                    text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700/50 shadow-sm 
                    focus:border-primary focus:ring-2 focus:ring-primary/30 text-sm"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Your username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600/70 px-3 py-2 
                    text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700/50 shadow-sm 
                    focus:border-primary focus:ring-2 focus:ring-primary/30 text-sm"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      name="password"
                      type="password"
                      required
                      className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600/70 px-3 py-2 
                      text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700/50 shadow-sm 
                      focus:border-primary focus:ring-2 focus:ring-primary/30 text-sm"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      className="block w-full pl-10 rounded-md border border-gray-300 dark:border-gray-600/70 px-3 py-2 
                      text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700/50 shadow-sm 
                      focus:border-primary focus:ring-2 focus:ring-primary/30 text-sm"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Questions Section */}
          <div className="space-y-4">
            <div className="border-t border-gray-200 dark:border-gray-700/40 pt-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-1 w-5 bg-secondary rounded-full"></div>
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                  Security Questions
                </h3>
              </div>

              <div className="bg-blue-50/80 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800/40 mb-5 flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Choose three different security questions to help protect your
                  account and recover access if needed.
                </p>
              </div>

              {renderSecurityQuestions()}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-md 
              disabled:opacity-50 shadow-sm text-sm font-medium flex items-center justify-center transition-colors"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700/40"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/90 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign Up */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full bg-white hover:bg-gray-50 dark:bg-gray-700/50 dark:hover:bg-gray-700/70 text-gray-900 dark:text-gray-100 py-3 rounded-md 
            shadow-sm text-sm font-medium flex items-center justify-center border border-gray-300 dark:border-gray-600/70 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
              <path fill="none" d="M1 1h22v22H1z" />
            </svg>
            Sign up with Google
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-primary hover:text-primary/80 dark:hover:text-primary/90 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
