import { useNavigate } from "react-router-dom";

function CompletionModal({ open, onClose, courseTitle, topicsCompleted, totalTopics, skills }) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Congratulations!</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-6">You completed <span className="font-semibold">{courseTitle}</span>.</p>

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Completion</span>
            <span className="text-slate-900 dark:text-white font-medium">100%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Topics completed</span>
            <span className="text-slate-900 dark:text-white font-medium">{topicsCompleted} / {totalTopics}</span>
          </div>
          {skills.length > 0 ? (
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-2">Skills gained</p>
              <div className="flex flex-wrap gap-2">
                {skills.map(function (s, i) {
                  return (
                    <span key={i} className="bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-1 rounded-full">
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded font-medium">
            Review Course
          </button>
          <button onClick={function () { navigate("/my-courses"); }} className="w-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white py-2.5 rounded font-medium">
            Start Another Course
          </button>
          <button onClick={function () { navigate("/dashboard"); }} className="w-full text-indigo-600 dark:text-indigo-400 py-2 text-sm underline">
            Explore Recommendations
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletionModal;
