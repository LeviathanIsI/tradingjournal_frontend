// src/components/SecurityQuestions.jsx
import { useState } from "react";

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
        "${import.meta.env.VITE_API_URL}/api/auth/forgot-password/verify",
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
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1 text-black">
            {securityData.questions.question1}
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 bg-white border border-gray-300 text-black rounded"
            value={answers.answer1}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, answer1: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-black">
            {securityData.questions.question2}
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 bg-white border border-gray-300 text-black rounded"
            value={answers.answer2}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, answer2: e.target.value }))
            }
          />
        </div>

        <div>
          <label className="block text-sm mb-1 text-black">
            {securityData.questions.question3}
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 bg-white border border-gray-300 text-black rounded"
            value={answers.answer3}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, answer3: e.target.value }))
            }
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify Answers"}
        </button>
      </div>
    </form>
  );
};

export default SecurityQuestions;
