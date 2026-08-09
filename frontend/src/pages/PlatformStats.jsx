import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function PlatformStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/platform/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Failed to load platform stats"));
  }, []);

  if (error) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-red-500 dark:text-red-400 p-8">{error}</div>;
  }

  if (!stats) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Platform Analytics</h1>
        <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 underline">Back to Dashboard</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Users</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total_users}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Courses</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total_items}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Total Interactions</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total_interactions}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Interaction Types</h2>
          <ul className="space-y-2">
            {stats.event_breakdown.map((e, i) => (
              <li key={i} className="flex justify-between text-slate-600 dark:text-slate-300">
                <span className="capitalize">{e.event_type}</span>
                <span className="text-indigo-600 dark:text-indigo-400">{e.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Most Popular Courses</h2>
          <ul className="space-y-2">
            {stats.top_items.map((item, i) => (
              <li key={i} className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{item.title}</span>
                <span className="text-indigo-600 dark:text-indigo-400">{item.interaction_count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PlatformStats;
