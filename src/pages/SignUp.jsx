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
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

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
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
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
                fill="#4285F4"
                d="M46.1,24.6c0-1.6-0.1-3.1-0.4-4.6H24v9.3h12.6c-0.6,3-2.3,5.5-4.7,7.2v6h7.6C43.7,38.9,46.1,32.4,46.1,24.6z"
              ></path>
              <path
                fill="#34A853"
                d="M24,46c6.5,0,11.9-2.1,15.9-5.6L32.3,34c-2.3,1.5-5.2,2.4-8.3,2.4c-6.4,0-11.8-4.3-13.7-10.1H2.7v6.2C6.8,40,14.9,46,24,46z"
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
