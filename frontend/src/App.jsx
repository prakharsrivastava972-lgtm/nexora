import Roadmap from "./pages/Roadmap";
import Onboarding from "./pages/Onboarding";
import SavedItems from "./pages/SavedItems";
import PlatformStats from "./pages/PlatformStats";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Search from "./pages/Search";
import ItemDetail from "./pages/ItemDetail";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/saved" element={<SavedItems />} />
          <Route path="/platform-stats" element={<PlatformStats />} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/search" element={<Search />} />
          <Route path="/items/:itemId" element={<ItemDetail />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;