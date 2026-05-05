import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { Home, BookOpen, MessageCircle, Calendar, LayoutGrid } from "lucide-react";
import { AuthProvider, useAuth } from "@/context/AuthContext.jsx";
import { AppProvider } from "@/context/AppContext.jsx";
import { initRouter } from "./lib/router.jsx";
import colors from "@/constants/colors.js";

import LoginScreen from "@/app/(auth)/login.jsx";
import RegisterScreen from "@/app/(auth)/register.jsx";
import Dashboard from "@/app/(tabs)/index.jsx";
import AcademicsScreen from "@/app/(tabs)/academics.jsx";
import MentorScreen from "@/app/(tabs)/mentor.jsx";
import PlannerScreen from "@/app/(tabs)/planner.jsx";
import MoreScreen from "@/app/(tabs)/more.jsx";
import QuizScreen from "@/app/quiz/index.jsx";
import SkillsScreen from "@/app/skills/index.jsx";
import AIChatScreen from "@/app/ai-chat/index.jsx";
import CareerScreen from "@/app/career/index.jsx";
import BootcampScreen from "@/app/bootcamp/index.jsx";
import NetworkScreen from "@/app/network/index.jsx";
import GrowthScreen from "@/app/growth/index.jsx";
import ProfileScreen from "@/app/profile/index.jsx";
import AdminLoginScreen from "@/app/admin/login.jsx";
import AdminDashboard from "@/app/admin/dashboard.jsx";

const C = colors.light;

const TABS = [
  { path: "/", label: "Home", Icon: Home },
  { path: "/academics", label: "Academics", Icon: BookOpen },
  { path: "/mentor", label: "Mentor", Icon: MessageCircle },
  { path: "/planner", label: "Planner", Icon: Calendar },
  { path: "/more", label: "More", Icon: LayoutGrid },
];

function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <nav style={{
      display: "flex",
      borderTop: `1px solid ${C.border}`,
      backgroundColor: C.card,
      flexShrink: 0,
    }}>
      {TABS.map(({ path, label, Icon }) => {
        const active = pathname === path;
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "8px 4px 10px",
              border: "none",
              background: "none",
              cursor: "pointer",
              color: active ? C.primary : C.mutedForeground,
              gap: 3,
              transition: "color 0.15s",
            }}
          >
            <Icon size={22} />
            <span style={{
              fontSize: 11,
              fontWeight: active ? 600 : 400,
              fontFamily: "'Inter', sans-serif",
              lineHeight: 1,
            }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function FullScreen({ children }) {
  return (
    <div style={{
      height: "100dvh",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      backgroundColor: C.background,
    }}>
      {children}
    </div>
  );
}

function TabLayout({ element }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100dvh",
      overflow: "hidden",
      backgroundColor: C.background,
    }}>
      <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        {element}
      </div>
      <TabBar />
    </div>
  );
}

function LoadingScreen() {
  return (
    <FullScreen>
      <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{
          width: 36, height: 36,
          border: `3px solid ${C.primary}40`,
          borderTop: `3px solid ${C.primary}`,
          borderRadius: "50%",
          animation: "rn-spin 0.8s linear infinite",
        }} />
      </div>
    </FullScreen>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={!user ? <FullScreen><LoginScreen /></FullScreen> : <Navigate to="/" replace />} />
      <Route path="/register" element={!user ? <FullScreen><RegisterScreen /></FullScreen> : <Navigate to="/" replace />} />
      <Route path="/admin/login" element={<FullScreen><AdminLoginScreen /></FullScreen>} />
      <Route path="/admin/dashboard" element={<FullScreen><AdminDashboard /></FullScreen>} />
      <Route path="/quiz" element={user ? <FullScreen><QuizScreen /></FullScreen> : <Navigate to="/login" replace />} />
      <Route path="/skills" element={user ? <FullScreen><SkillsScreen /></FullScreen> : <Navigate to="/login" replace />} />
      <Route path="/ai-chat" element={user ? <FullScreen><AIChatScreen /></FullScreen> : <Navigate to="/login" replace />} />
      <Route path="/career" element={user ? <FullScreen><CareerScreen /></FullScreen> : <Navigate to="/login" replace />} />
      <Route path="/bootcamp" element={user ? <FullScreen><BootcampScreen /></FullScreen> : <Navigate to="/login" replace />} />
      <Route path="/network" element={user ? <FullScreen><NetworkScreen /></FullScreen> : <Navigate to="/login" replace />} />
      <Route path="/growth" element={user ? <FullScreen><GrowthScreen /></FullScreen> : <Navigate to="/login" replace />} />
      <Route path="/profile" element={user ? <FullScreen><ProfileScreen /></FullScreen> : <Navigate to="/login" replace />} />
      <Route path="/" element={user ? <TabLayout element={<Dashboard />} /> : <Navigate to="/login" replace />} />
      <Route path="/academics" element={user ? <TabLayout element={<AcademicsScreen />} /> : <Navigate to="/login" replace />} />
      <Route path="/mentor" element={user ? <TabLayout element={<MentorScreen />} /> : <Navigate to="/login" replace />} />
      <Route path="/planner" element={user ? <TabLayout element={<PlannerScreen />} /> : <Navigate to="/login" replace />} />
      <Route path="/more" element={user ? <TabLayout element={<MoreScreen />} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
}

function AppInner() {
  const navigate = useNavigate();
  useEffect(() => { initRouter(navigate); }, [navigate]);
  return (
    <AuthProvider>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </AuthProvider>
  );
}

export default function App() {
  return <BrowserRouter><AppInner /></BrowserRouter>;
}
