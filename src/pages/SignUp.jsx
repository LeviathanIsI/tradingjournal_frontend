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
      const response = await fetch("${import.meta.env.VITE_API_URL}/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

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
      <h3 className="text-sm font-semibold text-black">Security Questions</h3>
      <p className="text-xs text-gray-500">
        Choose three different security questions
      </p>

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
              <label className="block text-sm mb-1 text-black">
                Security Question {num}
              </label>
              <select
                value={currentQuestion}
                onChange={(e) =>
                  handleQuestionChange(questionKey, e.target.value)
                }
                className="w-full px-3 py-2 bg-white border border-gray-300 text-black rounded"
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
                <label className="block text-sm mb-1 text-black">Answer</label>
                <input
                  type="text"
                  value={formData.securityQuestions[questionKey].answer}
                  onChange={(e) =>
                    handleAnswerChange(questionKey, e.target.value)
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-300 text-black rounded"
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
    window.location.href = "${import.meta.env.VITE_API_URL}/api/auth/google";
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex items-center justify-center py-12">
      <div className="w-full max-w-md px-8">
        <h2 className="text-2xl font-semibold mb-8 text-black text-center">
          Create your account
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
            <span className="block text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Account Information Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">
              Account Information
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-black shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Questions Section */}
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Security Questions
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Choose three different security questions to help protect your
                account
              </p>
              {renderSecurityQuestions()}
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 shadow-sm text-sm font-medium"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
        {/* 🚀 Google Sign Up */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 shadow-sm text-sm font-medium flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 48 48"
              version="1.1"
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
      </div>
    </div>
  );
};

export default SignUp;
