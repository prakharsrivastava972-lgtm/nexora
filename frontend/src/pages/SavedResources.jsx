import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function SavedResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadResources = function () {
    api.get("/saved-resources")
      .then(function (res) { setResources(res.data || []); })
      .catch(function (err) { setError(err.response?.data?.detail || "Failed to load saved resources"); })
      .finally(function () { setLoading(false); });
  };

  useEffect(function () {
    loadResources();
  }, []);

  const handleUnsave = async function (id) {
    try {
      await api.delete("/saved-resources/" + id);
      loadResources();
    } catch (err) {
      alert("Failed to remove saved resource.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Saved Resources</h1>
        <button onClick={function () { navigate("/dashboard"); }} className="text-indigo-600 dark:text-indigo-400 underline">
          Back to Dashboard
        </button>
      </div>

      {loading ? <p className="text-slate-500 dark:text-slate-400">Loading...</p> : null}
      {error ? <p className="text-red-500 dark:text-red-400">{error}</p> : null}

      {!loading && resources.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            You haven't saved any YouTube resources yet. Click the ☆ next to any video to save it here.
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {resources.map(function (r) {
          return (
            <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center justify-between shadow-sm dark:shadow-none">
              <div className="min-w-0 flex-1">
                <a href={r.video_url} target="_blank" rel="noopener noreferrer" className="text-slate-900 dark:text-white font-medium hover:text-indigo-600 dark:hover:text-indigo-400 truncate block">
                  {r.video_label}
                </a>
                {r.topic_name ? (
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Topic: {r.topic_name}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-3 ml-4">
                <button
                  onClick={function () { navigate("/items/" + r.item_id); }}
                  className="text-indigo-600 dark:text-indigo-400 text-sm underline whitespace-nowrap"
                >
                  View Course
                </button>
                <button
                  onClick={function () { handleUnsave(r.id); }}
                  className="text-amber-500 text-xl"
                  title="Unsave"
                >
                  ★
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SavedResources;
