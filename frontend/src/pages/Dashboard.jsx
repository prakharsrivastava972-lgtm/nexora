import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl text-white font-bold">Welcome to your Dashboard 🎉</h1>
      <Link to="/analytics" className="text-indigo-400 underline">View Your Analytics</Link>
    </div>
  );
}

export default Dashboard;