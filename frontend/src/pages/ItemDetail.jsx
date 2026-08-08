import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function ItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/items/${itemId}`)
      .then((res) => setItem(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Failed to load item"));
  }, [itemId]);

  const handleInteract = async (eventType) => {
    try {
      await api.post("/interactions", { item_id: Number(itemId), event_type: eventType });
      alert(`Recorded "${eventType}"!`);
    } catch (err) {
      alert("Failed to record interaction. Are you logged in?");
    }
  };

  if (error) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-red-500 dark:text-red-400 p-8">{error}</div>;
  if (!item) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-8">Loading...</div>;

  const skillsList = item.skills
    ? item.skills.replace(/[\[\]']/g, "").split(",").map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <button onClick={() => navigate(-1)} className="text-indigo-600 dark:text-indigo-400 mb-6 inline-block">← Back</button>

      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm dark:shadow-none">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{item.title}</h1>
          {item.rating && (
            <span className="text-amber-500 dark:text-amber-400 font-medium whitespace-nowrap ml-4">★ {item.rating}</span>
          )}
        </div>

        <div className="flex gap-3 mb-6">
          <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm px-3 py-1 rounded-full">{item.difficulty}</span>
          {item.category && (
            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm px-3 py-1 rounded-full">{item.category}</span>
          )}
        </div>

        <h2 className="text-slate-900 dark:text-white font-semibold mb-2">Overview</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{item.description}</p>

        {skillsList.length > 0 && (
          <>
            <h2 className="text-slate-900 dark:text-white font-semibold mb-2">Skills Covered</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {skillsList.map((skill, i) => (
                <span key={i} className="bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 text-sm px-3 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => handleInteract("like")}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded font-medium"
          >
            Like
          </button>
          <button
            onClick={() => handleInteract("save")}
            className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white py-3 rounded font-medium"
          >
            Save
          </button>
          <button
            onClick={() => handleInteract("complete")}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded font-medium"
          >
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;