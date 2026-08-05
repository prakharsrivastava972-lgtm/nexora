import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Dashboard() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Hardcoded user_id=1 for now — ideally comes from the logged-in user's JWT payload
    api.get("/recommendations/1")
      .then((res) => setRecommendations(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Failed to load recommendations"))
      .finally(() => setLoading(false));
  }, []);

  const handleInteract = async (itemId, eventType) => {
    try {
      await api.post("/interactions", { item_id: itemId, event_type: eventType });
      alert(`Recorded "${eventType}" on this item!`);
    } catch (err) {
      alert("Failed to record interaction. Are you logged in?");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Your Personalized Learning Feed</h1>
        <Link to="/analytics" className="text-indigo-400 underline">View Your Analytics</Link>
      </div>

      {loading && <p className="text-slate-400">Loading recommendations...</p>}
      {error && <p className="text-red-400">{error}</p>}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((item) => (
          <div key={item.item_id} className="bg-slate-800 rounded-xl p-6 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <Link to={`/item/${item.item_id}`}>
  <h2 className="text-white font-semibold text-lg hover:text-indigo-400 cursor-pointer">{item.title}</h2>
</Link>
              <span className="text-indigo-400 text-sm font-medium whitespace-nowrap ml-2">
                {Math.round(item.final_score * 100)}% Match
              </span>
            </div>
            <span className="text-slate-400 text-sm mb-3">{item.difficulty}</span>

            <div className="text-slate-300 text-sm mb-4 flex-1">
              <p className="font-medium mb-1">Why you're seeing this:</p>
              <ul className="space-y-1">
                {item.why_recommended.map((reason, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 mt-auto">
              <button
                onClick={() => handleInteract(item.item_id, "like")}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-sm font-medium"
              >
                Like
              </button>
              <button
                onClick={() => handleInteract(item.item_id, "save")}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={() => handleInteract(item.item_id, "dislike")}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded text-sm font-medium"
              >
                Not Interested
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;