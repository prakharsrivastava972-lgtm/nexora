import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";
import NavSidebar from "../components/NavSidebar";

function Dashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [recommendations, setRecommendations] = useState([]);
  const [trending, setTrending] = useState([]);
  const [continueLearning, setContinueLearning] = useState([]);
  const [explore, setExplore] = useState([]);
  const [roadmapSummary, setRoadmapSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [navOpen, setNavOpen] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(function () {
    api.get("/auth/me")
      .then(function (meRes) {
        setUserName(meRes.data.name || "");
        return api.get("/recommendations/" + meRes.data.id);
      })
      .then(function (res) { setRecommendations(res.data); })
      .catch(function (err) { setError(err.response?.data?.detail || "Failed to load recommendations"); })
      .finally(function () { setLoading(false); });

    api.get("/trending").then(function (res) { setTrending(res.data); }).catch(function () {});
    api.get("/continue-learning").then(function (res) { setContinueLearning(res.data); }).catch(function () {});
    api.get("/explore").then(function (res) { setExplore(res.data); }).catch(function () {});
    api.get("/roadmap").then(function (res) { setRoadmapSummary(res.data); }).catch(function () {});
  }, []);

  const handleInteract = async function (itemId, eventType) {
    try {
      await api.post("/interactions", { item_id: itemId, event_type: eventType });
      alert("Recorded \"" + eventType + "\" on this item!");
    } catch (err) {
      alert("Failed to record interaction. Are you logged in?");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={function () { setNavOpen(true); }}
            className="text-2xl leading-none text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700"
            title="Menu"
          >
            ⋮
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {userName ? "Hello, " + userName + " \uD83D\uDC4B" : "Hello \uD83D\uDC4B"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back to NEXORA. Here's your personalized feed.</p>
          </div>
        </div>
        <button onClick={toggleTheme} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-1.5 rounded text-sm border border-slate-300 dark:border-slate-700">
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>

      {loading ? <p className="text-slate-500 dark:text-slate-400">Loading recommendations...</p> : null}
      {error ? <p className="text-red-500 dark:text-red-400">{error}</p> : null}

      {roadmapSummary && roadmapSummary.has_roadmap ? (
        <div
          onClick={function () { navigate("/roadmap"); }}
          className="mb-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 cursor-pointer hover:opacity-95 transition-opacity"
        >
          <p className="text-indigo-100 text-sm mb-1">Learning Roadmap</p>
          <h2 className="text-white text-xl font-bold mb-2">{roadmapSummary.goal}</h2>
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div className="bg-white h-2 rounded-full" style={{ width: roadmapSummary.progress + "%" }} />
          </div>
          <p className="text-indigo-100 text-sm">{roadmapSummary.progress}% complete - Continue your journey</p>
        </div>
      ) : (
        <div
          onClick={function () { navigate("/roadmap"); }}
          className="mb-12 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
        >
          <h2 className="text-slate-900 dark:text-white font-semibold mb-1">Start a Learning Roadmap</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Get a personalized, structured path toward your career goal.</p>
        </div>
      )}

      {continueLearning.length > 0 ? (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Continue Learning</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {continueLearning.map(function (item) {
              return (
                <div key={item.item_id} onClick={function () { navigate("/items/" + item.item_id); }} className="bg-white dark:bg-slate-800 rounded-xl p-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors border-l-4 border-emerald-500 shadow-sm dark:shadow-none">
                  <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{item.difficulty}</span>
                    {item.rating ? <span className="text-amber-500 dark:text-amber-400 text-sm">Rating: {item.rating}</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map(function (item) {
          return (
            <div key={item.item_id} onClick={function () { navigate("/items/" + item.item_id); }} className="bg-white dark:bg-slate-800 rounded-xl p-6 flex flex-col cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors shadow-sm dark:shadow-none">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-slate-900 dark:text-white font-semibold text-lg">{item.title}</h2>
                <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium whitespace-nowrap ml-2">
                  {Math.round(item.final_score * 100)}% Match
                </span>
              </div>
              <span className="text-slate-500 dark:text-slate-400 text-sm mb-3">{item.difficulty}</span>
              <div className="text-slate-600 dark:text-slate-300 text-sm mb-4 flex-1">
                <p className="font-medium mb-1">Why you're seeing this:</p>
                <ul className="space-y-1">
                  {item.why_recommended.map(function (reason, i) {
                    return (
                      <li key={i} className="flex gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400">Check</span>
                        <span>{reason}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex gap-2 mt-auto">
                <button onClick={function (e) { e.stopPropagation(); handleInteract(item.item_id, "like"); }} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded text-sm font-medium">Like</button>
                <button onClick={function (e) { e.stopPropagation(); handleInteract(item.item_id, "save"); }} className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white py-2 rounded text-sm font-medium">Save</button>
                <button onClick={function (e) { e.stopPropagation(); handleInteract(item.item_id, "dislike"); }} className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white py-2 rounded text-sm font-medium">Not Interested</button>
              </div>
            </div>
          );
        })}
      </div>

      {trending.length > 0 ? (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Trending Among Learners</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trending.map(function (item) {
              return (
                <div key={item.item_id} onClick={function () { navigate("/items/" + item.item_id); }} className="bg-white dark:bg-slate-800 rounded-xl p-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors shadow-sm dark:shadow-none">
                  <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{item.difficulty}</span>
                    {item.rating ? <span className="text-amber-500 dark:text-amber-400 text-sm">Rating: {item.rating}</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {explore.length > 0 ? (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Explore Something New</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {explore.map(function (item) {
              return (
                <div key={item.item_id} onClick={function () { navigate("/items/" + item.item_id); }} className="bg-white dark:bg-slate-800 rounded-xl p-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors shadow-sm dark:shadow-none border-l-4 border-purple-500">
                  <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">{item.difficulty}</span>
                    {item.rating ? <span className="text-amber-500 dark:text-amber-400 text-sm">Rating: {item.rating}</span> : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <NavSidebar open={navOpen} onClose={function () { setNavOpen(false); }} />
    </div>
  );
}

export default Dashboard;
