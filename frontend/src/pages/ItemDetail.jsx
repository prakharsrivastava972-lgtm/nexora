import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import CompletionModal from "../components/CompletionModal";

function ItemDetail() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [resources, setResources] = useState([]);
  const [youtubeResources, setYoutubeResources] = useState([]);
  const [courseRoadmap, setCourseRoadmap] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showCompletion, setShowCompletion] = useState(false);
  const [topicVideos, setTopicVideos] = useState({});
  const [topicVideosLoading, setTopicVideosLoading] = useState({});
  const [expandedTopics, setExpandedTopics] = useState({});
  const [savedUrls, setSavedUrls] = useState({});

  const loadCourseRoadmap = function () {
    api.get("/courses/" + itemId + "/roadmap")
      .then(function (res) { setCourseRoadmap(res.data); })
      .catch(function () { setCourseRoadmap(null); });
  };

  const loadSavedResources = function () {
    api.get("/saved-resources")
      .then(function (res) {
        const map = {};
        (res.data || []).forEach(function (r) { map[r.video_url] = r.id; });
        setSavedUrls(map);
      })
      .catch(function () {});
  };

  useEffect(function () {
    api.get("/items/" + itemId)
      .then(function (res) { setItem(res.data); })
      .catch(function (err) { setError(err.response?.data?.detail || "Failed to load item"); });

    api.get("/items/" + itemId + "/resources")
      .then(function (res) { setResources(res.data.resources || []); })
      .catch(function () { setResources([]); });

    loadCourseRoadmap();
    loadSavedResources();
    setActiveTab("overview");
    setTopicVideos({});
    setExpandedTopics({});

    api.post("/interactions", { item_id: Number(itemId), event_type: "view" }).catch(function () {});
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
      if (eventType === "complete") {
        setShowCompletion(true);
      } else {
        alert("Recorded: " + eventType);
      }
    } catch (err) {
      alert("Failed to record interaction. Are you logged in?");
    }
  };

  const handleStartRoadmap = async function () {
    try {
      await api.post("/courses/" + itemId + "/roadmap");
      loadCourseRoadmap();
    } catch (err) {
      alert("Failed to start roadmap. Are you logged in?");
    }
  };

  const handleToggleTopic = async function (topicId) {
    try {
      await api.put("/courses/topic/" + topicId + "/toggle");
      loadCourseRoadmap();
    } catch (err) {
      alert("Failed to update topic.");
    }
  };

  const handleResetRoadmap = async function () {
    const confirmed = window.confirm("This will uncheck all topics in this course's roadmap and reset progress to 0%. Your roadmap itself won't be deleted. Continue?");
    if (!confirmed) return;
    try {
      await api.put("/courses/" + itemId + "/reset");
      loadCourseRoadmap();
    } catch (err) {
      alert("Failed to reset roadmap.");
    }
  };

  const handleToggleTopicVideos = function (topicId, topicName) {
    const isExpanded = expandedTopics[topicId];

    if (isExpanded) {
      setExpandedTopics(function (prev) { return { ...prev, [topicId]: false }; });
      return;
    }

    setExpandedTopics(function (prev) { return { ...prev, [topicId]: true }; });

    if (topicVideos[topicId]) return;

    setTopicVideosLoading(function (prev) { return { ...prev, [topicId]: true }; });
    api.get("/youtube/search", { params: { q: topicName, level: item.difficulty || "Beginner" } })
      .then(function (res) {
        setTopicVideos(function (prev) { return { ...prev, [topicId]: res.data.resources || [] }; });
      })
      .catch(function () {
        setTopicVideos(function (prev) { return { ...prev, [topicId]: [] }; });
      })
      .finally(function () {
        setTopicVideosLoading(function (prev) { return { ...prev, [topicId]: false }; });
      });
  };

  const handleToggleSaveResource = async function (label, url, topicName) {
    const existingId = savedUrls[url];
    try {
      if (existingId) {
        await api.delete("/saved-resources/" + existingId);
        setSavedUrls(function (prev) {
          const next = { ...prev };
          delete next[url];
          return next;
        });
      } else {
        const res = await api.post("/saved-resources", {
          item_id: Number(itemId),
          topic_name: topicName || null,
          video_label: label,
          video_url: url,
        });
        setSavedUrls(function (prev) { return { ...prev, [url]: res.data.id }; });
      }
    } catch (err) {
      alert("Failed to update saved resource. Are you logged in?");
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

  const roadmapStarted = courseRoadmap && courseRoadmap.has_roadmap;
  const roadmapFullyComplete = roadmapStarted && courseRoadmap.progress === 100;
  const roadmapHasProgress = roadmapStarted && courseRoadmap.progress > 0;
  const topicsCompletedCount = roadmapStarted ? courseRoadmap.topics.filter(function (t) { return t.completed; }).length : 0;
  const totalTopicsCount = roadmapStarted ? courseRoadmap.topics.length : 0;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "roadmap", label: "Roadmap" },
    { id: "resources", label: "Resources" },
    { id: "youtube", label: "YouTube" },
  ];

  const tabButtonClass = function (id) {
    return activeTab === id
      ? "px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white"
      : "px-4 py-2 text-sm font-medium rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700";
  };

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
            {roadmapStarted ? (
              <span className="bg-indigo-100 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 text-sm px-3 py-1 rounded-full">
                {courseRoadmap.progress}% complete
              </span>
            ) : null}
          </div>

          <div className="flex gap-2 mb-6 border-b border-slate-100 dark:border-slate-700 pb-3">
            {tabs.map(function (t) {
              return (
                <button key={t.id} onClick={function () { setActiveTab(t.id); }} className={tabButtonClass(t.id)}>
                  {t.label}
                </button>
              );
            })}
          </div>

          {activeTab === "overview" ? (
            <div>
              <h2 className="text-slate-900 dark:text-white font-semibold mb-2">Overview</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{item.description}</p>

              {skillsList.length > 0 ? (
                <div className="mb-2">
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
            </div>
          ) : null}

          {activeTab === "roadmap" ? (
            <div>
              {!roadmapStarted ? (
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                    Track your progress through this course with a personal checklist. You'll only be able to mark this course complete once every item below is checked off.
                  </p>
                  <button onClick={handleStartRoadmap} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded text-sm font-medium">
                    Start Roadmap
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 bg-slate-200 dark:bg-slate-600 rounded-full h-2 mr-4">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: courseRoadmap.progress + "%" }} />
                    </div>
                    {roadmapHasProgress ? (
                      <button onClick={handleResetRoadmap} className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 whitespace-nowrap underline">
                        Start From Beginning
                      </button>
                    ) : null}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
                    {courseRoadmap.progress}% complete
                    {roadmapFullyComplete ? " — all topics done, you can mark this course complete below" : ""}
                  </p>
                  <div className="space-y-2">
                    {courseRoadmap.topics.map(function (t) {
                      const isExpanded = expandedTopics[t.id];
                      const videos = topicVideos[t.id];
                      const isLoading = topicVideosLoading[t.id];
                      return (
                        <div key={t.id} className="bg-slate-50 dark:bg-slate-700/50 rounded overflow-hidden">
                          <div className="flex items-center gap-3 px-3 py-2">
                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={t.completed}
                                onChange={function () { handleToggleTopic(t.id); }}
                                className="w-4 h-4"
                              />
                              <span className={t.completed ? "text-slate-400 dark:text-slate-500 line-through text-sm" : "text-slate-900 dark:text-white text-sm"}>
                                {t.name}
                              </span>
                            </label>
                            <button
                              onClick={function () { handleToggleTopicVideos(t.id, t.name); }}
                              className="text-xs text-red-500 dark:text-red-400 hover:underline whitespace-nowrap"
                            >
                              📺 Videos
                            </button>
                          </div>
                          {isExpanded ? (
                            <div className="px-3 pb-3 space-y-1">
                              {isLoading ? (
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic">Loading videos...</p>
                              ) : videos && videos.length > 0 ? (
                                videos.map(function (v, i) {
                                  const isSaved = !!savedUrls[v.url];
                                  return (
                                    <div key={i} className="flex items-center justify-between bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded px-3 py-1.5 text-xs gap-2">
                                      <a href={v.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 truncate">
                                        <span className="text-slate-700 dark:text-slate-200">{v.label}</span>
                                      </a>
                                      <button
                                        onClick={function () { handleToggleSaveResource(v.label, v.url, t.name); }}
                                        className={isSaved ? "text-amber-500" : "text-slate-300 dark:text-slate-500 hover:text-amber-500"}
                                        title={isSaved ? "Unsave" : "Save"}
                                      >
                                        {isSaved ? "★" : "☆"}
                                      </button>
                                      <a href={v.url} target="_blank" rel="noopener noreferrer" className="text-red-500 dark:text-red-400 whitespace-nowrap">
                                        Search YouTube
                                      </a>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-xs text-slate-400 dark:text-slate-500 italic">No videos found.</p>
                              )}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {activeTab === "resources" ? (
            <div>
              {resources.length > 0 ? (
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
              ) : (
                <p className="text-slate-400 dark:text-slate-500 text-sm italic">
                  Curated resources coming soon for this course.
                </p>
              )}
            </div>
          ) : null}

          {activeTab === "youtube" ? (
            <div>
              {youtubeResources.length > 0 ? (
                <div className="space-y-2">
                  {youtubeResources.map(function (r, i) {
                    const isSaved = !!savedUrls[r.url];
                    return (
                      <div key={i} className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded px-4 py-2 text-sm gap-3">
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 truncate">
                          <span className="text-slate-900 dark:text-white">{r.label}</span>
                        </a>
                        <button
                          onClick={function () { handleToggleSaveResource(r.label, r.url, null); }}
                          className={isSaved ? "text-amber-500 text-lg" : "text-slate-300 dark:text-slate-500 hover:text-amber-500 text-lg"}
                          title={isSaved ? "Unsave" : "Save"}
                        >
                          {isSaved ? "★" : "☆"}
                        </button>
                        <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 text-xs whitespace-nowrap">
                          Search YouTube
                        </a>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-slate-400 dark:text-slate-500 text-sm italic">Loading video suggestions...</p>
              )}
            </div>
          ) : null}

          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <button onClick={function () { handleInteract("like"); }} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded font-medium">
              Like
            </button>
            <button onClick={function () { handleInteract("save"); }} className="flex-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white py-3 rounded font-medium">
              Save
            </button>
            <button
              onClick={function () { handleInteract("complete"); }}
              disabled={!roadmapFullyComplete}
              title={!roadmapFullyComplete ? "Complete every roadmap topic above first" : ""}
              className={roadmapFullyComplete
                ? "flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded font-medium"
                : "flex-1 bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 py-3 rounded font-medium cursor-not-allowed"}
            >
              Mark Complete
            </button>
          </div>
        </div>
      </div>

      <CompletionModal
        open={showCompletion}
        onClose={function () { setShowCompletion(false); }}
        courseTitle={item.title}
        topicsCompleted={topicsCompletedCount}
        totalTopics={totalTopicsCount}
        skills={skillsList}
      />
    </div>
  );
}

export default ItemDetail;
