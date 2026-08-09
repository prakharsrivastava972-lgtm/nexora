import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const GOAL_OPTIONS = [
  "Machine Learning Engineer", "Data Scientist", "Full Stack Developer",
  "Cybersecurity Analyst", "Cloud Engineer",
];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DURATIONS = ["3 months", "6 months", "12 months"];

function Roadmap() {
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [goal, setGoal] = useState(GOAL_OPTIONS[0]);
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("6 months");
  const [skillsInput, setSkillsInput] = useState("");

  const fetchRoadmap = () => {
    setLoading(true);
    api.get("/roadmap")
      .then((res) => setRoadmap(res.data))
      .catch(() => setRoadmap({ has_roadmap: false }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    const existingSkills = skillsInput.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      await api.post("/roadmap/generate", { goal, level, duration, existing_skills: existingSkills });
      fetchRoadmap();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to generate roadmap");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTopic = async (topicId) => {
    try {
      await api.put(`/roadmap/topic/${topicId}/toggle`);
      fetchRoadmap();
    } catch (err) {
      alert("Failed to update topic. Are you logged in?");
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Learning Roadmap</h1>
        <Link to="/dashboard" className="text-indigo-600 dark:text-indigo-400 underline">Back to Dashboard</Link>
      </div>

      {!roadmap?.has_roadmap ? (
        <div className="max-w-xl bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm dark:shadow-none">
          <h2 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">
            Your personalized learning journey starts here.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Tell us your goal, and we will build a structured roadmap for you.
          </p>

          <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Career Goal</label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            {GOAL_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>

          <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Current Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>

          <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Target Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
          >
            {DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>

          <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">
            Existing Skills (comma-separated)
          </label>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="e.g. Python, SQL"
            className="w-full mb-6 px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
          />

          <button
            onClick={handleCreate}
            disabled={creating}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded font-semibold disabled:opacity-50"
          >
            {creating ? "Generating..." : "Generate My Roadmap"}
          </button>
        </div>
      ) : (
        <div className="max-w-3xl">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-8 shadow-sm dark:shadow-none">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{roadmap.goal}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              {roadmap.level} level - {roadmap.duration}
            </p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
              <div
                className="bg-indigo-600 h-3 rounded-full transition-all"
                style={{ width: `${roadmap.progress}%` }}
              />
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm">{roadmap.progress}% complete</p>
          </div>

          <div className="space-y-6">
            {roadmap.stages.map((stage, i) => {
              const stageCompleted = stage.topics.filter((t) => t.completed).length;
              const stageTotal = stage.topics.length;
              const stageProgress = stageTotal > 0 ? Math.round((stageCompleted / stageTotal) * 100) : 0;

              return (
                <div key={stage.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-slate-900 dark:text-white font-semibold text-lg">
                      {i + 1}. {stage.title}
                    </h3>
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{stageProgress}% Complete</span>
                  </div>
                  <div className="flex gap-3 mb-4">
                    <span className="text-slate-500 dark:text-slate-400 text-xs">{stage.duration}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">{stage.difficulty}</span>
                  </div>

                  <div className="space-y-2">
                    {stage.topics.map((topic) => (
                      <div
                        key={topic.id}
                        onClick={() => handleToggleTopic(topic.id)}
                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded px-4 py-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600"
                      >
                        <div className="flex items-center gap-3">
                          <span className={topic.completed ? "text-emerald-500" : "text-slate-400"}>
                            {topic.completed ? "[x]" : "[ ]"}
                          </span>
                          <span className={
                            topic.completed
                              ? "text-slate-400 dark:text-slate-500 line-through"
                              : "text-slate-900 dark:text-white"
                          }>
                            {topic.name}
                          </span>
                          {topic.already_known && (
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                              Already known
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 dark:text-slate-500 text-xs">{topic.estimated_hours}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Roadmap;
