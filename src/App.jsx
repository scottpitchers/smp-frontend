import React, { useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Players from "./pages/Players";
import Content from "./pages/Content";
import Schedules from "./pages/Schedules";
import Login from "./pages/Login";
import SMP_CMS from "./components/MainPage";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("smp_token");

  // Simple check for simulation. In a real app, verify token validity.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const currentRoute = useLocation().pathname;
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("smp_token");
    if (token) {
      if (currentRoute === "/login") {
        navigate("/");
      }
    } else {
      if (currentRoute !== "/login") {
        navigate("/login");
      }
    }
  }, []);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="players" element={<Players />} />
        <Route path="content" element={<Content />} />
        <Route path="schedules" element={<Schedules />} />
      </Route>

      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
