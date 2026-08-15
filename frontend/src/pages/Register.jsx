import { GoogleLogin } from '@react-oauth/google';
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import nexoraLogo from "../assets/nexora-logo.png";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/login?justRegistered=true");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      const res = await api.post("/auth/google", {
        id_token: credentialResponse.credential,
      });
      localStorage.setItem("nexora_token", res.data.access_token);

      try {
        const prefsRes = await api.get("/preferences");
        if (!prefsRes.data.has_onboarded) {
          navigate("/onboarding");
        } else {
          navigate("/dashboard");
        }
      } catch {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Google authentication failed");
    }
  };

  return (
    <div className="min-h-screen page-enter flex flex-col lg:flex-row bg-[#FAF9F6] dark:bg-slate-950">

      {/* 60% — brand panel */}
      <div className="w-full lg:w-[60%] relative overflow-hidden bg-[#12172B] flex items-center justify-center py-16 lg:py-0 min-h-[320px] lg:min-h-screen">

        {/* ambient glow */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-amber-500/10 blur-3xl" />

        {/* roadmap path graphic — echoes the product's own Roadmap feature */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.35]"
          viewBox="0 0 400 600"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path
            d="M 60 40 C 160 90, 40 180, 140 220 C 240 260, 80 340, 180 390 C 280 440, 140 500, 260 540"
            stroke="#E8A33D"
            strokeOpacity="0.25"
            strokeWidth="2"
            strokeDasharray="2 10"
            strokeLinecap="round"
          />
          <circle cx="60" cy="40" r="5" fill="#E8A33D" fillOpacity="0.9" />
          <circle cx="140" cy="220" r="5" fill="#E8A33D" fillOpacity="0.6" />
          <circle cx="180" cy="390" r="7" fill="#E8A33D" fillOpacity="0.9" />
          <circle cx="180" cy="390" r="12" fill="none" stroke="#E8A33D" strokeOpacity="0.5" strokeWidth="1.5" className="animate-pulse" />
          <circle cx="260" cy="540" r="5" fill="none" stroke="#E8A33D" strokeOpacity="0.4" strokeWidth="1.5" />
        </svg>

        <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-lg">
          <img
            src={nexoraLogo}
            alt="NEXORA"
            className="w-56 lg:w-64 mb-10 select-none drop-shadow-[0_0_30px_rgba(232,163,61,0.15)]"
          />
          <h1 className="font-serif text-4xl lg:text-5xl font-semibold text-white leading-tight mb-5">
            Start your<br />learning journey.
          </h1>
          <p className="text-slate-400 text-base lg:text-lg leading-relaxed">
            Create your account and get a roadmap built around your goals.
          </p>
        </div>
      </div>

      {/* 40% — register card */}
      <div className="w-full lg:w-[40%] flex items-center justify-center px-6 py-12 lg:py-0">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">Join NEXORA</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Create your account to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="w-full">
            {error && (
              <p className="text-red-600 dark:text-red-400 text-sm mb-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition"
              required
            />

            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-4 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition"
              required
            />

            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-6 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition"
              required
            />

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-[#12172B] py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-amber-500/20"
            >
              Register
            </button>

            <div className="relative my-6 flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-700 w-full"></div>
              <span className="bg-[#FAF9F6] dark:bg-slate-950 px-3 text-xs text-slate-400">OR</span>
            </div>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError("Google Sign-In failed")}
              />
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm mt-8 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-[#12172B] dark:text-amber-400 font-medium hover:underline">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;