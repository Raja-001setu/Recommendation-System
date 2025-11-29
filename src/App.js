import React, { useState } from "react";
import "./index.css";

const PRODUCTS = [
  {
    id: 1,
    name: "Galaxy A15",
    category: "Phone",
    price: 25000,
    description:
      "Budget Android phone with good battery and decent gaming performance.",
  },
  {
    id: 2,
    name: "iPhone 15",
    category: "Phone",
    price: 75000,
    description:
      "Premium phone with excellent camera and top-tier performance.",
  },
  {
    id: 3,
    name: "Redmi Note Gaming",
    category: "Phone",
    price: 30000,
    description:
      "Mid-range phone focused on gaming with a fast processor and large battery.",
  },
  {
    id: 4,
    name: "Noise Smartwatch",
    category: "Watch",
    price: 6500,
    description:
      "Fitness-focused smartwatch with notifications and step tracking.",
  },
];

function App() {
  const [preferences, setPreferences] = useState("");
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendations = async (preferencesText) => {
    const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API key (REACT_APP_GEMINI_API_KEY).");
    }

const prompt = `
Act as a product recommendation engine.

User query: "${preferencesText}"

Products (JSON):
${JSON.stringify(PRODUCTS)}

Return only a JSON array of product IDs to recommend, e.g. [1, 3].
No explanation, no extra text.
`.trim();


    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY, // 🔑 pass key in header
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!res.ok) {
      const txt = await res.text();
      console.error("Gemini error:", txt);
      throw new Error("Gemini API error");
    }

    const data = await res.json();

    // Gemini puts the text here
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "[]";

    let ids;
    try {
      ids = JSON.parse(text);
    } catch {
      const match = text.match(/\[[\s\S]*\]/);
      ids = match ? JSON.parse(match[0]) : [];
    }

    if (!Array.isArray(ids)) ids = [];

    return ids;
  };

  const handleRecommend = async () => {
    if (!preferences.trim()) return;

    setLoading(true);
    setError("");
    setRecommended([]);

    try {
      const ids = await fetchRecommendations(preferences);
      const recos = PRODUCTS.filter((p) => ids.includes(p.id));
      setRecommended(recos);
    } catch (err) {
      console.error(err);
      setError("Failed to get recommendations. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>AI Product Recommendation</h1>

      <section className="input-section">
        <label htmlFor="preferences">
          Enter your preferences (e.g. "I want a phone under ₹40,000 for
          gaming"):
        </label>
        <textarea
          id="preferences"
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          rows={3}
          placeholder="Describe what you are looking for..."
        />
        <button
          onClick={handleRecommend}
          disabled={loading || !preferences.trim()}
        >
          {loading ? "Getting recommendations..." : "Get Recommendations"}
        </button>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="products-section">
        <h2>All Products</h2>
        <div className="product-list">
          {PRODUCTS.map((p) => (
            <div key={p.id} className="product-card">
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p>
                <strong>Category:</strong> {p.category}
              </p>
              <p>
                <strong>Price:</strong> ₹{p.price}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="recommendations-section">
        <h2>Recommended for You</h2>
        {loading && <p>Thinking based on your preferences...</p>}
        {!loading && recommended.length === 0 && !error && (
          <p>
            No recommendations yet. Enter your preferences and click the button.
          </p>
        )}
        <div className="product-list">
          {recommended.map((p) => (
            <div key={p.id} className="product-card recommended">
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <p>
                <strong>Category:</strong> {p.category}
              </p>
              <p>
                <strong>Price:</strong> ₹{p.price}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default App;
