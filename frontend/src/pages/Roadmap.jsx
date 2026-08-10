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
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [youtubeResources, setYoutubeResources] = useState({});
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
      await api.post("/roadmap/generate", { goal: goal, level: level, duration: duration, existing_skills: existingSkills });
      fetchRoadmap();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to generate roadmap");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleTopic = async (topicId) => {
    try {
      await api.put("/roadmap/topic/" + topicId + "/toggle");
      fetchRoadmap();
    } catch (err) {
      alert("Failed to update topic. Are you logged in?");
    }
  };

  const handleExpandTopic = async (topic) => {
    if (expandedTopic === topic.id) {
      setExpandedTopic(null);
      return;
    }
    setExpandedTopic(topic.id);
    if (!youtubeResources[topic.id]) {
      try {
        const res = await api.get("/youtube/search", { params: { q: topic.name, level: roadmap.level } });
        setYoutubeResources(function (prev) {
          const next = Object.assign({}, prev);
          next[topic.id] = res.data.resources;
          return next;
        });
      } catch (err) {
        setYoutubeResources(function (prev) {
          const next = Object.assign({}, prev);
          next[topic.id] = [];
          return next;
        });
      }
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

      {!roadmap || !roadmap.has_roadmap ? (
        <div className="max-w-xl bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm dark:shadow-none">
          <h2 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">
            Your personalized learning journey starts here.
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Tell us your goal, and we will build a structured roadmap for you.
          </p>

          <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Career Goal</label>
          <select value={goal} onChange={function (e) { setGoal(e.target.value); }} className="w-full mb-4 px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">
            {GOAL_OPTIONS.map(function (g) { return <option key={g} value={g}>{g}</option>; })}
          </select>

          <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Current Level</label>
          <select value={level} onChange={function (e) { setLevel(e.target.value); }} className="w-full mb-4 px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">
            {LEVELS.map(function (l) { return <option key={l} value={l}>{l}</option>; })}
          </select>

          <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Target Duration</label>
          <select value={duration} onChange={function (e) { setDuration(e.target.value); }} className="w-full mb-4 px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">
            {DURATIONS.map(function (d) { return <option key={d} value={d}>{d}</option>; })}
          </select>

          <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2">Existing Skills (comma-separated)</label>
          <input type="text" value={skillsInput} onChange={function (e) { setSkillsInput(e.target.value); }} placeholder="e.g. Python, SQL" className="w-full mb-6 px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white" />

          <button onClick={handleCreate} disabled={creating} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded font-semibold disabled:opacity-50">
            {creating ? "Generating..." : "Generate My Roadmap"}
          </button>
        </div>
      ) : (
        <div className="max-w-3xl">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 mb-8 shadow-sm dark:shadow-none">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{roadmap.goal}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{roadmap.level} level - {roadmap.duration}</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-2">
              <div className="bg-indigo-600 h-3 rounded-full transition-all" style={{ width: roadmap.progress + "%" }} />
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm">{roadmap.progress}% complete</p>
          </div>

          <div className="space-y-6">
            {roadmap.stages.map(function (stage, i) {
              const stageCompleted = stage.topics.filter(function (t) { return t.completed; }).length;
              const stageTotal = stage.topics.length;
              const stageProgress = stageTotal > 0 ? Math.round((stageCompleted / stageTotal) * 100) : 0;

              return (
                <div key={stage.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm dark:shadow-none">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-slate-900 dark:text-white font-semibold text-lg">{i + 1}. {stage.title}</h3>
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{stageProgress}% Complete</span>
                  </div>
                  <div className="flex gap-3 mb-4">
                    <span className="text-slate-500 dark:text-slate-400 text-xs">{stage.duration}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs">{stage.difficulty}</span>
                  </div>

                  <div className="space-y-2">
                    {stage.topics.map(function (topic) {
                      const resList = youtubeResources[topic.id] || [];
                      return (
                        <div key={topic.id}>
                          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600">
                            <div className="flex items-center gap-3">
                              <span onClick={function () { handleToggleTopic(topic.id); }} className={topic.completed ? "cursor-pointer text-emerald-500" : "cursor-pointer text-slate-400"}>
                                {topic.completed ? "[x]" : "[ ]"}
                              </span>
                              <span onClick={function () { handleToggleTopic(topic.id); }} className={topic.completed ? "cursor-pointer text-slate-400 dark:text-slate-500 line-through" : "cursor-pointer text-slate-900 dark:text-white"}>
                                {topic.name}
                              </span>
                              {topic.already_known ? (
                                <span className="text-xs bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">Already known</span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-3">
                              <button onClick={function () { handleExpandTopic(topic); }} className="text-xs text-indigo-600 dark:text-indigo-400 underline">
                                {expandedTopic === topic.id ? "Hide resources" : "YouTube resources"}
                              </button>
                              <span className="text-slate-400 dark:text-slate-500 text-xs">{topic.estimated_hours}h</span>
                            </div>
                          </div>

                          {expandedTopic === topic.id ? (
                            <div className="ml-4 mt-2 mb-2 space-y-2">
                              {resList.length === 0 ? (
                                <p className="text-slate-400 dark:text-slate-500 text-xs italic px-4">Loading resources...</p>
                              ) : (
                                resList.map(function (r, i) {
                                  return (
                                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded px-4 py-2 text-sm">
                                      <span className="text-slate-900 dark:text-white">{r.label}</span>
                                      <span className="text-red-600 dark:text-red-400 text-xs">Search YouTube</span>
                                    </a>
                                  );
                                })
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
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
