// src/components/SecurityQuestions.jsx
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

const SecurityQuestions = ({ securityData, onSuccess, onError }) => {
  const [answers, setAnswers] = useState({
    answer1: "",
    answer2: "",
    answer3: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: securityData.userId,
            answers,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify answers");
      }

      onSuccess(data.data.resetToken);
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-gray-800/80 p-5 rounded-lg border border-gray-200 dark:border-gray-700/40 shadow-md backdrop-blur-sm">
      <div className="mb-5 flex justify-center">
        <div className="p-3 bg-primary/10 rounded-full">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
      </div>

      <h2 className="text-xl font-semibold text-center text-gray-900 dark:text-gray-100 mb-5">
        Security Verification
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              {securityData.questions.question1}
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-700/40 
              border border-gray-300 dark:border-gray-600/70 
              text-gray-900 dark:text-gray-100 
              rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              value={answers.answer1}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, answer1: e.target.value }))
              }
              placeholder="Your answer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              {securityData.questions.question2}
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-700/40 
              border border-gray-300 dark:border-gray-600/70 
              text-gray-900 dark:text-gray-100 
              rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              value={answers.answer2}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, answer2: e.target.value }))
              }
              placeholder="Your answer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              {securityData.questions.question3}
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 bg-white dark:bg-gray-700/40 
              border border-gray-300 dark:border-gray-600/70 
              text-gray-900 dark:text-gray-100 
              rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary/60"
              value={answers.answer3}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, answer3: e.target.value }))
              }
              placeholder="Your answer"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 px-4 rounded-md 
            shadow hover:shadow-md dark:hover:bg-primary/80 disabled:opacity-50 
            font-medium transition-all"
          >
            {loading ? "Verifying..." : "Verify Answers"}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
            Please provide exact answers to your security questions
          </p>
        </div>
      </form>
    </div>
  );
};

export default SecurityQuestions;
