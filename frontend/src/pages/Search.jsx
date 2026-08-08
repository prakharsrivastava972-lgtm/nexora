import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const params = { q: query };
      if (difficulty) params.difficulty = difficulty;
      const res = await api.get("/search", { params });
      setResults(res.data);
    } catch (err) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Search Courses</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8 flex-wrap">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, skill, or topic..."
          className="flex-1 min-w-[240px] px-4 py-2 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none border border-slate-300 dark:border-slate-700 focus:border-indigo-500"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="px-4 py-2 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none border border-slate-300 dark:border-slate-700"
        >
          <option value="">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
          <option value="Mixed">Mixed</option>
        </select>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded font-medium"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-slate-500 dark:text-slate-400">Searching...</p>}

      {searched && !loading && results.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400">No courses found. Try a different search term.</p>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((item) => (
          <div
            key={item.item_id}
            onClick={() => navigate(`/items/${item.item_id}`)}
            className="bg-white dark:bg-slate-800 rounded-xl p-6 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors shadow-sm dark:shadow-none"
          >
            <h3 className="text-slate-900 dark:text-white font-semibold text-lg mb-2">{item.title}</h3>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-sm">{item.difficulty}</span>
              {item.rating && <span className="text-amber-500 dark:text-amber-400 text-sm">★ {item.rating}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;