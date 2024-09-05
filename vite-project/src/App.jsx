import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

const App = () => {
  const [context, setContext] = useState("");
  const [screenshots, setScreenshots] = useState([]);
  const [instructions, setInstructions] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (context.trim()) formData.append("context", context);

    // Append all the screenshots
    screenshots.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const response = await fetch(
        "http://localhost:3000/api/generate-instructions",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      setInstructions(result);
    } catch (error) {
      console.error("Error in fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setScreenshots(Array.from(e.target.files));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      {/* Main container with limited width */}
      <div className="relative w-full max-w-3xl p-8 space-y-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-semibold text-center text-gray-800">
          Upload Screenshots and Generate Test Instructions
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Context:
            </label>
            <textarea
              className="w-full p-3 mt-1 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              rows="4"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe the feature or functionality to test..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Upload Screenshots:
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              required
              className="w-full p-3 mt-1 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <button
              type="submit"
              className={`w-full py-2 px-4 mt-4 text-white bg-green-600 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading
                ? "Generating Instructions..."
                : "Generate Test Instructions"}
            </button>
          </div>
        </form>
        {instructions && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Generated Test Instructions
            </h2>
            {/* Render the markdown-formatted instructions */}
            <ReactMarkdown className="prose prose-lg text-gray-700">
              {instructions}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
