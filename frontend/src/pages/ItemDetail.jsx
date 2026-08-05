import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

function ItemDetail() {
  const { itemId } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/items/${itemId}`)
      .then((res) => setItem(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Failed to load item"))
      .finally(() => setLoading(false));
  }, [itemId]);

  const handleInteract = async (eventType) => {
    try {
      await api.post("/interactions", { item_id: parseInt(itemId), event_type: eventType });
      alert(`Recorded "${eventType}"!`);
    } catch (err) {
      alert("Failed to record interaction. Are you logged in?");
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-white p-8">Loading...</div>;
  if (error) return <div className="min-h-screen bg-slate-900 text-red-400 p-8">{error}</div>;

  const skillsList = item.skills ? item.skills.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <Link to="/dashboard" className="text-indigo-400 underline mb-6 inline-block">← Back to Dashboard</Link>

      <div className="bg-slate-800 rounded-xl p-8 max-w-3xl">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-white">{item.title}</h1>
          {item.rating && (
            <span className="text-amber-400 text-lg whitespace-nowrap ml-4">★ {item.rating.toFixed(1)}</span>
          )}
        </div>

        <div className="flex gap-3 mb-6">
          <span className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-sm">{item.difficulty}</span>
          {item.category && (
            <span className="bg-slate-700 text-slate-200 px-3 py-1 rounded-full text-sm">{item.category}</span>
          )}
        </div>

        <h2 className="text-white font-semibold mb-2">Overview</h2>
        <p className="text-slate-300 mb-6 leading-relaxed">{item.description}</p>

        {skillsList.length > 0 && (
          <>
            <h2 className="text-white font-semibold mb-2">Skills Covered</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {skillsList.map((skill, i) => (
                <span key={i} className="bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </>
        )}

        <div className="flex gap-3 mt-8">
          <button
            onClick={() => handleInteract("like")}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded font-medium"
          >
            Like
          </button>
          <button
            onClick={() => handleInteract("save")}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded font-medium"
          >
            Save
          </button>
          <button
            onClick={() => handleInteract("complete")}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded font-medium"
          >
            Mark Complete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;