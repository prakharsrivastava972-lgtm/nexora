import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CoursesSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function () {
    if (!open) return;
    setLoading(true);
    api.get("/my-courses")
      .then(function (res) { setCourses(res.data || []); })
      .catch(function () { setCourses([]); })
      .finally(function () { setLoading(false); });
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-80 bg-white dark:bg-slate-800 h-full shadow-xl p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">My Courses</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none">
            ×
          </button>
        </div>

        {loading ? <p className="text-slate-500 dark:text-slate-400 text-sm">Loading...</p> : null}

        {!loading && courses.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 text-sm italic">
            No courses started yet. Open a course and click "Start Roadmap" to begin tracking it here.
          </p>
        ) : null}

        <div className="space-y-3">
          {courses.map(function (c) {
            return (
              <div
                key={c.item_id}
                onClick={function () { navigate("/items/" + c.item_id); onClose(); }}
                className="cursor-pointer bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg p-3 transition-colors"
              >
                <p className="text-slate-900 dark:text-white text-sm font-medium mb-1 line-clamp-2">{c.title}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-2">{c.difficulty}</p>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5">
                  <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: c.progress + "%" }} />
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{c.progress}% complete</p>
              </div>
            );
          })}
        </div>

        <button
          onClick={function () { navigate("/my-courses"); onClose(); }}
          className="mt-6 w-full text-indigo-600 dark:text-indigo-400 text-sm underline"
        >
          View full My Courses page
        </button>
      </div>
    </div>
  );
}

export default CoursesSidebar;
