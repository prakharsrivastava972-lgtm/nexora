import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

function Analytics() {
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const axisColor = theme === "dark" ? "#94a3b8" : "#475569";

  useEffect(() => {
    api.get("/auth/me")
      .then((meRes) => api.get(`/users/${meRes.data.id}/analytics`))
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Failed to load analytics"));
  }, []);

  if (error) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-red-500 dark:text-red-400 p-8">{error}</div>;
  if (!data) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-8">Loading...</div>;

  const eventData = Object.entries(data.event_type_breakdown).map(([name, value]) => ({ name, value }));
  const difficultyData = Object.entries(data.difficulty_breakdown).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Your Analytics</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Total interactions: {data.total_interactions}</p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Interaction Types</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={eventData} dataKey="value" nameKey="name" outerRadius={80} label>
                {eventData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
          <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Difficulty Breakdown</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={difficultyData}>
              <XAxis dataKey="name" stroke={axisColor} />
              <YAxis stroke={axisColor} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mt-8 shadow-sm dark:shadow-none">
        <h2 className="text-slate-900 dark:text-white font-semibold mb-4">Most Interacted Items</h2>
        <ul className="text-slate-600 dark:text-slate-300 space-y-2">
          {data.most_interacted_items.map((item, i) => (
            <li key={i} className="flex justify-between">
              <span>{item.title}</span>
              <span className="text-indigo-600 dark:text-indigo-400">{item.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Analytics;