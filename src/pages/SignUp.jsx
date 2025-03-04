// src/pages/SignUp.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Use login without rememberMe parameter
      login(data.data);
      navigate("/dashboard");
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
              <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                Security Question {num}
              </label>
              <select
                value={currentQuestion}
                onChange={(e) =>
                  handleQuestionChange(questionKey, e.target.value)
                }
                className="w-full px-3 py-2 bg-white dark:bg-gray-500/50 border border-gray-300 dark:border-gray-600/70 
                text-gray-900 dark:text-gray-100 rounded-sm focus:border-blue-500 focus:ring-blue-400"
                required
              >
                <option value="">Select a question</option>
                {dropdownOptions.map((question) => (
                  <option key={question} value={question}>
                    {question}
                  </option>
                ))}
              </select>
            </div>

            {currentQuestion && (
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">
                  Answer
                </label>
                <input
                  type="text"
                  value={formData.securityQuestions[questionKey].answer}
                  onChange={(e) =>
                    handleAnswerChange(questionKey, e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-gray-500/50 border border-gray-300 dark:border-gray-600/70 
                  text-gray-900 dark:text-gray-100 rounded-sm focus:border-blue-500 focus:ring-blue-400"
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
    // Add the expireAt2AM parameter to the Google auth URL
    window.location.href = `${
      import.meta.env.VITE_API_URL
    }/api/auth/google?expireAt2AM=true`;
  };

  return (
    <div className="min-h-screen pt-16 px-4 sm:px-6 bg-white dark:bg-gray-700/60 flex items-center justify-center py-8 sm:py-12">
      <div className="w-full max-w-md bg-white dark:bg-gray-600/30 p-6 rounded-sm border border-gray-200 dark:border-gray-600/50 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8 text-gray-900 dark:text-gray-100 text-center">
          Create your account
        </h2>

        {error && (
          <div
            className="bg-red-50 dark:bg-red-700/30 border border-red-100 dark:border-red-600/50 
          text-red-700 dark:text-red-300 px-3 sm:px-4 py-2 sm:py-3 rounded-sm mb-6"
          >
            <span className="block text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Account Information Section */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100">
              Account Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username
                </label>
                <input
                  name="username"
                  type="text"
                  required
                  className="block w-full rounded-sm border border-gray-300 dark:border-gray-600/70 px-3 py-2 
                  text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-500/50 shadow-sm 
                  focus:border-blue-500 focus:ring-blue-400 text-sm"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-sm border border-gray-300 dark:border-gray-600/70 px-3 py-2 
                  text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-500/50 shadow-sm 
                  focus:border-blue-500 focus:ring-blue-400 text-sm"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    required
                    className="block w-full rounded-sm border border-gray-300 dark:border-gray-600/70 px-3 py-2 
                    text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-500/50 shadow-sm 
                    focus:border-blue-500 focus:ring-blue-400 text-sm"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    className="block w-full rounded-sm border border-gray-300 dark:border-gray-600/70 px-3 py-2 
                    text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-500/50 shadow-sm 
                    focus:border-blue-500 focus:ring-blue-400 text-sm"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Questions Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="border-t border-gray-200 dark:border-gray-600/50 pt-4 sm:pt-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 sm:mb-4">
                Security Questions
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
                Choose three different security questions to help protect your
                account
              </p>
              {renderSecurityQuestions()}
            </div>
          </div>

          <div className="pt-4 sm:pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 dark:bg-blue-500/90 text-white py-2.5 sm:py-3 rounded-sm 
              hover:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 shadow-sm text-sm font-medium"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        {/* Google Sign Up */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full bg-red-500 dark:bg-red-500/90 text-white py-2.5 sm:py-3 rounded-sm 
            hover:bg-red-600 dark:hover:bg-red-500 shadow-sm text-sm font-medium flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 mr-2"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#FFF"
                d="M24 10.605c5.303 0 8.978 2.298 11.038 4.219l8.266-8.062C38.896 2.734 32.095 0 24 0 14.64 0 6.558 5.377 2.53 13.295l9.493 7.375C14.396 14.657 18.855 10.605 24 10.605z"
              ></path>
              <path
                fill="#FFF"
                d="M47.102 24.482c0-1.996-.187-3.396-.571-4.889H24v9.636h13.122c-.279 1.486-1.118 3.721-3.172 5.21l9.19 7.133C46.756 37.321 47.102 31.051 47.102 24.482z"
              ></path>
              <path
                fill="#FFF"
                d="M10.122 28.429C9.649 27.036 9.387 25.547 9.387 24c0-1.548.262-3.036.736-4.429l-9.489-7.375C.215 14.976 0 19.398 0 24c0 4.601.215 9.023.633 10.822l9.489-6.393z"
              ></path>
              <path
                fill="#FFF"
                d="M24 48c6.442 0 11.845-2.123 15.79-5.772l-9.188-7.133c-2.533 1.703-5.785 2.7-6.602 2.7-5.145 0-9.603-3.438-11.181-8.082l-9.494 7.375C7.275 45.092 15.094 48 24 48z"
              ></path>
            </svg>
            Sign up with Google
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
