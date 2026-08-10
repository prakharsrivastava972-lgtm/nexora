import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

function ItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [resources, setResources] = useState([]);
  const [youtubeResources, setYoutubeResources] = useState([]);
  const [error, setError] = useState("");

  useEffect(function () {
    api.get("/items/" + itemId)
      .then(function (res) { setItem(res.data); })
      .catch(function (err) { setError(err.response?.data?.detail || "Failed to load item"); });

    api.get("/items/" + itemId + "/resources")
      .then(function (res) { setResources(res.data.resources || []); })
      .catch(function () { setResources([]); });
  }, [itemId]);

  useEffect(function () {
    if (item && item.title) {
      api.get("/youtube/search", { params: { q: item.title, level: item.difficulty || "Beginner" } })
        .then(function (res) { setYoutubeResources(res.data.resources || []); })
        .catch(function () { setYoutubeResources([]); });
    }
  }, [item]);

  const handleInteract = async function (eventType) {
    try {
      await api.post("/interactions", { item_id: Number(itemId), event_type: eventType });
      alert("Recorded: " + eventType);
    } catch (err) {
      alert("Failed to record interaction. Are you logged in?");
    }
  };

  if (error) {
    return <div className="max-w-3xl mx-auto p-8 text-red-500">{error}</div>;
  }

  if (!item) {
    return <div className="max-w-3xl mx-auto p-8 text-slate-600 dark:text-slate-300">Loading...</div>;
  }

  const skillsList = item.skills
    ? item.skills.replace(/[\[\]']/g, "").split(",").map(function (s) { return s.trim(); }).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={function () { navigate(-1); }} className="text-indigo-600 dark:text-indigo-400 mb-6 inline-block">
          Back
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm dark:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{item.title}</h1>
            {item.rating ? (
              <span className="text-amber-500 dark:text-amber-400 font-medium whitespace-nowrap ml-4">
                Rating: {item.rating}
              </span>
            ) : null}
          </div>

          <div className="flex gap-3 mb-6">
            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm px-3 py-1 rounded-full">
              {item.difficulty}
            </span>
            {item.category ? (
              <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm px-3 py-1 rounded-full">
                {item.category}
              </span>
            ) : null}
          </div>

          <h2 className="text-slate-900 dark:text-white font-semibold mb-2">Overview</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{item.description}</p>

          {skillsList.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-slate-900 dark:text-white font-semibold mb-2">Skills Covered</h2>
              <div className="flex flex-wrap gap-2">
                {skillsList.map(function (skill, i) {
                  return (
                    <span key={i} className="bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 text-sm px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}

          {resources.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-slate-900 dark:text-white font-semibold mb-2">Learning Resources</h2>
              <div className="space-y-2">
                {resources.map(function (r, i) {
                  return (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded px-4 py-2 text-sm">
                      <span className="text-slate-900 dark:text-white">{r.title}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 text-xs">{r.type}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-6 italic">
              Curated resources coming soon for this course.
            </p>
          )}

          {youtubeResources.length > 0 ? (
            <div className="mb-6">
              <h2 className="text-slate-900 dark:text-white font-semibold mb-2">YouTube Videos</h2>
              <div className="space-y-2">
                {youtubeResources.map(function (r, i) {
                  return (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded px-4 py-2 text-sm">
                      <span className="text-slate-900 dark:text-white">{r.label}</span>
                      <span className="text-red-600 dark:text-red-400 text-xs">Search YouTube</span>
                    </a>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="flex gap-3 mt-8">
            <button onClick={function () { handleInteract("like"); }} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded font-medium">
              Like
            </button>
            <button onClick={function () { handleInteract("save"); }} className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white py-3 rounded font-medium">
              Save
            </button>
            <button onClick={function () { handleInteract("complete"); }} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded font-medium">
              Mark Complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;
