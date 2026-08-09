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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm dark:shadow-none">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to NEXORA</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Tell us what you're interested in so we can personalize your recommendations.
        </p>

        <h2 className="text-slate-900 dark:text-white font-semibold mb-3">Select your interests</h2>
        <div className="flex flex-wrap gap-2 mb-8">
          {INTEREST_OPTIONS.map((interest) => {
            const selected = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={
                  selected
                    ? "px-4 py-2 rounded-full text-sm bg-indigo-600 text-white"
                    : "px-4 py-2 rounded-full text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }
              >
                {interest}
              </button>
            );
          })}
        </div>

        <h2 className="text-slate-900 dark:text-white font-semibold mb-3">Your skill level</h2>
        <div className="flex gap-2 mb-8">
          {SKILL_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setSkillLevel(level)}
              className={
                skillLevel === level
                  ? "flex-1 py-2 rounded bg-indigo-600 text-white font-medium"
                  : "flex-1 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
              }
            >
              {level}
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Continue to Dashboard"}
        </button>
      </div>
    </div>
  );
}

export default Onboarding;
