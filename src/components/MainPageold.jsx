// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  MonitorPlay,
  FileVideo,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Edit2,
  Eye,
  Wifi,
  WifiOff,
  User,
  LogOut,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = "REPLACE_WITH_YOUR_BACKEND_URL/api";

const SMP_CMS = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [authData, setAuthData] = useState({
    email: "",
    password: "",
    company: "",
  });
  const [token, setToken] = useState(localStorage.getItem("smp_token") || "");

  const [players, setPlayers] = useState([]);
  const [content] = useState([
    {
      id: "c1",
      name: "Welcome Video",
      type: "video",
      url: "https://example.com/welcome.mp4",
      duration: "30s",
      size: "15 MB",
    },
    {
      id: "c2",
      name: "Promo Slideshow",
      type: "playlist",
      items: 5,
      duration: "2m",
      size: "8 MB",
    },
    {
      id: "c3",
      name: "Menu Board",
      type: "image",
      url: "https://example.com/menu.jpg",
      duration: "static",
      size: "2 MB",
    },
  ]);
  const [schedules] = useState([
    {
      id: "s1",
      name: "Morning Content",
      content: "Welcome Video",
      time: "08:00-12:00",
      days: "Mon-Fri",
      players: 2,
    },
    {
      id: "s2",
      name: "Lunch Menu",
      content: "Menu Board",
      time: "11:00-14:00",
      days: "Daily",
      players: 1,
    },
  ]);

  const [showPairingModal, setShowPairingModal] = useState(false);
  const [pairingCode, setPairingCode] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("smp_token");
    localStorage.removeItem("smp_user");
    navigate("/login");
  };

  useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      fetchPlayers();
    }
  }, [token]);

  const handleAuth = async () => {
    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authData),
      });

      const data = await response.json();

      if (data.success && data.token) {
        setToken(data.token);
        localStorage.setItem("smp_token", data.token);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        alert(`${isLogin ? "Login" : "Registration"} successful!`);
      } else {
        alert(data.error || "Authentication failed");
      }
    } catch (error) {
      alert("Error connecting to server. Using demo mode.");
      setIsAuthenticated(true);
      setShowAuthModal(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/players`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.players) {
        setPlayers(data.players);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    }
  };

  const handlePairDevice = async () => {
    if (!pairingCode || !newPlayerName) {
      alert("Please enter both pairing code and player name");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/pair-device`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pairing_code: pairingCode,
          player_name: newPlayerName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Player paired successfully!");
        setShowPairingModal(false);
        setPairingCode("");
        setNewPlayerName("");
        fetchPlayers();
      } else {
        alert(data.error || "Pairing failed");
      }
    } catch (error) {
      alert("Error pairing device. Please try again.");
    }
  };

  const DashboardView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Players</p>
              <p className="text-3xl font-bold mt-2">{players.length}</p>
            </div>
            <MonitorPlay className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Online</p>
              <p className="text-3xl font-bold mt-2">
                {players.filter((p) => p.status === "online").length}
              </p>
            </div>
            <Wifi className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Content Items</p>
              <p className="text-3xl font-bold mt-2">{content.length}</p>
            </div>
            <FileVideo className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Schedules</p>
              <p className="text-3xl font-bold mt-2">{schedules.length}</p>
            </div>
            <Calendar className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium">System initialized</p>
              <p className="text-sm text-gray-500">Just now</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="font-medium">Dashboard loaded successfully</p>
              <p className="text-sm text-gray-500">Just now</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PlayersView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Players</h2>
        <button
          onClick={() => setShowPairingModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Pair New Player
        </button>
      </div>

      {players.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MonitorPlay className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Players Yet</h3>
          <p className="text-gray-500 mb-4">
            Pair your first player to get started
          </p>
          <button
            onClick={() => setShowPairingModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Pair New Player
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {players.map((player) => (
            <div
              key={player.id || player.player_id}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      player.status === "online" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    <MonitorPlay
                      className={`w-6 h-6 ${
                        player.status === "online"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{player.name}</h3>
                    <p className="text-sm text-gray-500">
                      {player.location || "No location"}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    player.status === "online"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {player.status === "online" ? (
                    <Wifi className="w-3 h-3 inline mr-1" />
                  ) : (
                    <WifiOff className="w-3 h-3 inline mr-1" />
                  )}
                  {player.status}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Content:</span>
                  <span className="font-medium">
                    {player.content || "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium">{player.uptime || "0h"}</span>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-sm">
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ContentView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Library</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" />
          Upload Content
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
          >
            <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <FileVideo className="w-16 h-16 text-white opacity-80" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{item.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium capitalize">{item.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{item.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="font-medium">{item.size}</span>
                </div>
              </div>
              <button className="w-full mt-4 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
                Assign to Player
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SchedulesView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Schedules</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" />
          New Schedule
        </button>
      </div>

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{schedule.name}</h3>
                  <p className="text-sm text-gray-500">
                    Content: {schedule.content}
                  </p>
                  <p className="text-sm text-gray-500">
                    Time: {schedule.time} · Days: {schedule.days} · Players:{" "}
                    {schedule.players}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (!isAuthenticated && !showAuthModal) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <MonitorPlay className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg">SMP CMS</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              activeTab === "dashboard"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("players")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              activeTab === "players"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <MonitorPlay className="w-4 h-4" />
            Players
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              activeTab === "content"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FileVideo className="w-4 h-4" />
            Content
          </button>
          <button
            onClick={() => setActiveTab("schedules")}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
              activeTab === "schedules"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Schedules
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
          Settings and Analytics coming soon
        </div>
        <div className="border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors mb-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">
                Admin User
              </p>
              <p className="text-xs text-gray-500 truncate">
                admin@example.com
              </p>
            </div>
            {/* <Settings className="w-4 h-4 text-gray-400" /> */}
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 mb-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 p-6">
        {activeTab === "dashboard" && <DashboardView />}
        {activeTab === "players" && <PlayersView />}
        {activeTab === "content" && <ContentView />}
        {activeTab === "schedules" && <SchedulesView />}
      </main>
    </div>
  );
};

export default SMP_CMS;
