import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

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
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-xl w-full max-w-sm shadow-lg dark:shadow-none">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Create your NEXORA account</h1>
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
  );
}

export default Register;