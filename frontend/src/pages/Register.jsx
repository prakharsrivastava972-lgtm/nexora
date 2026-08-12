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

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 overflow-hidden">
      <img
        src={nexoraLogo}
        alt=""
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] max-w-none opacity-10 pointer-events-none select-none"
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Join NEXORA</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Create your account and start your personalized learning journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 w-full">
          {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>}
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white outline-none"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-6 px-4 py-2 rounded bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white outline-none"
            required
          />
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded font-semibold">
            Register
          </button>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-4 text-center">
            Already have an account? <Link to="/login" className="text-indigo-600 dark:text-indigo-400">Log in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
