import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function MyCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(function () {
    api.get("/my-courses")
      .then(function (res) { setCourses(res.data || []); })
      .catch(function (err) { setError(err.response?.data?.detail || "Failed to load your courses"); })
      .finally(function () { setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Courses</h1>
        <button onClick={function () { navigate("/dashboard"); }} className="text-indigo-600 dark:text-indigo-400 underline">
          Back to Dashboard
        </button>
      </div>

      {loading ? <p className="text-slate-500 dark:text-slate-400">Loading...</p> : null}
      {error ? <p className="text-red-500 dark:text-red-400">{error}</p> : null}

      {!loading && courses.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-2">You haven't started any course roadmaps yet.</p>
          <button onClick={function () { navigate("/dashboard"); }} className="text-indigo-600 dark:text-indigo-400 underline">
            Browse recommendations to get started
          </button>
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(function (c) {
          return (
            <div
              key={c.item_id}
              onClick={function () { navigate("/items/" + c.item_id); }}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors shadow-sm dark:shadow-none"
            >
              <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">{c.title}</h3>
              <span className="text-slate-500 dark:text-slate-400 text-sm mb-4 inline-block">{c.difficulty}</span>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: c.progress + "%" }} />
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{c.progress}% complete</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MyCourses;
