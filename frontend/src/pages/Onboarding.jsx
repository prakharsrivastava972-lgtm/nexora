import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const INTEREST_OPTIONS = [
  "Artificial Intelligence", "Machine Learning", "Data Science",
  "Web Development", "Cybersecurity", "Cloud Computing",
  "Python", "Java", "C/C++", "Data Structures",
  "Generative AI", "Computer Vision", "NLP", "SQL", "Excel",
];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];

function Onboarding() {
  const navigate = useNavigate();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [skillLevel, setSkillLevel] = useState("Beginner");
  const [saving, setSaving] = useState(false);

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (selectedInterests.length === 0) {
      alert("Please select at least one interest.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/preferences", { interests: selectedInterests, skill_level: skillLevel });
      navigate("/dashboard");
    } catch (err) {
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen page-enter bg-[#FAF9F6] dark:bg-slate-950 flex items-center justify-center p-6 lg:p-8">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl p-8 lg:p-10 shadow-sm border border-slate-100 dark:border-slate-800">

        {/* roadmap-style step marker — echoes the brand's path motif */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="w-2 h-2 rounded-full bg-amber-500/40" />
          <span className="w-2 h-2 rounded-full bg-amber-500/40" />
          <span className="text-xs text-slate-400 ml-2 tracking-wide">SET UP YOUR PATH</span>
        </div>

        <h1 className="font-serif text-3xl font-semibold text-slate-900 dark:text-white mb-2">
          Welcome to NEXORA
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          Tell us what you're interested in so we can personalize your recommendations.
        </p>

        <h2 className="text-slate-900 dark:text-white font-semibold mb-3 text-sm uppercase tracking-wide">
          Select your interests
        </h2>
        <div className="flex flex-wrap gap-2 mb-8">
          {INTEREST_OPTIONS.map((interest) => {
            const selected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={
                  selected
                    ? "px-4 py-2 rounded-full text-sm font-medium bg-amber-500 text-[#12172B] transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
                    : "px-4 py-2 rounded-full text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-amber-400 hover:text-slate-900 dark:hover:text-white transition-all duration-200 hover:scale-[1.05] active:scale-[0.95]"
                }
              >
                {interest}
              </button>
            );
          })}
        </div>

        <h2 className="text-slate-900 dark:text-white font-semibold mb-3 text-sm uppercase tracking-wide">
          Your skill level
        </h2>
        <div className="flex gap-2 mb-8">
          {SKILL_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setSkillLevel(level)}
              className={
                skillLevel === level
                  ? "flex-1 py-3 rounded-xl bg-amber-500 text-[#12172B] font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  : "flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-amber-400 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              }
            >
              {level}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-[#12172B] hover:bg-[#1c2340] text-white py-3.5 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-sm"
        >
          {saving ? "Saving..." : "Continue to Dashboard"}
        </button>
      </div>
    </div>
  );
}

export default Onboarding;