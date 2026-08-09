import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function SavedItems() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/saved-items")
      .then((res) => setItems(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Please log in to view saved items"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Saved Items</h1>
        <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 underline">Back to Dashboard</Link>
      </div>

      {loading && <p className="text-slate-500 dark:text-slate-400">Loading...</p>}
      {error && <p className="text-red-500 dark:text-red-400">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400">
          You have not saved any courses yet. Click "Save" on any recommendation to add it here.
        </p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.item_id}
            onClick={() => navigate(`/items/${item.item_id}`)}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors shadow-sm dark:shadow-none"
          >
            <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">{item.title}</h3>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm">{item.difficulty}</span>
              {item.rating && <span className="text-amber-500 dark:text-amber-400 text-sm">★ {item.rating}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedItems;
