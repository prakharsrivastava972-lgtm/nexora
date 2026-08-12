import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function NavSidebar({ open, onClose }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [continueLearning, setContinueLearning] = useState([]);

  useEffect(function () {
    if (!open) return;
    api.get("/auth/me").then(function (res) { setUser(res.data); }).catch(function () {});
    api.get("/recently-viewed").then(function (res) { setRecentlyViewed(res.data || []); }).catch(function () {});
    api.get("/continue-learning").then(function (res) { setContinueLearning(res.data || []); }).catch(function () {});
  }, [open]);

  useEffect(function () {
    function handleEsc(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return function () { document.removeEventListener("keydown", handleEsc); };
  }, [onClose]);

  const handleLogout = function () {
    localStorage.removeItem("nexora_token");
    navigate("/login");
  };

  const go = function (path) {
    navigate(path);
    onClose();
  };

  const initials = user && user.name
    ? user.name.split(" ").map(function (p) { return p[0]; }).slice(0, 2).join("").toUpperCase()
    : "?";

  const links = [
    { label: "Dashboard", icon: "🏠", path: "/dashboard" },
    { label: "Search", icon: "🔎", path: "/search" },
    { label: "My Courses", icon: "📚", path: "/my-courses" },
    { label: "Learning Roadmap", icon: "🗺️", path: "/roadmap" },
    { label: "Saved Items", icon: "⭐", path: "/saved" },
    { label: "Analytics", icon: "📊", path: "/analytics" },
    { label: "Platform Stats", icon: "📈", path: "/platform-stats" },
  ];

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-72 bg-white dark:bg-slate-800 h-full shadow-xl flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700">
              <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">NEXORA</span>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl leading-none">×</button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              {links.map(function (l) {
                return (
                  <button
                    key={l.path}
                    onClick={function () { go(l.path); }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span>{l.icon}</span>
                    <span className="text-sm font-medium">{l.label}</span>
                  </button>
                );
              })}

              {continueLearning.length > 0 ? (
                <div className="mt-4 px-5">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-2">Continue Learning</p>
                  <div className="space-y-1">
                    {continueLearning.slice(0, 4).map(function (item) {
                      return (
                        <button
                          key={item.item_id}
                          onClick={function () { go("/items/" + item.item_id); }}
                          className="w-full text-left text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-1.5 truncate block"
                        >
                          {item.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {recentlyViewed.length > 0 ? (
                <div className="mt-4 px-5">
                  <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-2">Recently Viewed</p>
                  <div className="space-y-1">
                    {recentlyViewed.slice(0, 4).map(function (item) {
                      return (
                        <button
                          key={item.item_id}
                          onClick={function () { go("/items/" + item.item_id); }}
                          className="w-full text-left text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 py-1.5 truncate block"
                        >
                          {item.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </nav>

            <div className="border-t border-slate-100 dark:border-slate-700 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-slate-900 dark:text-white text-sm font-medium truncate">{user ? user.name : "Loading..."}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs truncate">{user ? user.email : ""}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left text-red-500 dark:text-red-400 text-sm font-medium px-1 py-1 hover:underline"
              >
                🚪 Logout
              </button>
            </div>
          </div>
          <div className="flex-1 bg-black/30" onClick={onClose} />
        </div>
      ) : null}
    </>
  );
}

export default NavSidebar;
