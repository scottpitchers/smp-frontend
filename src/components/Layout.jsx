import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MonitorPlay,
  FileVideo,
  Calendar,
  LogOut,
  User,
  ChevronDown,
  ChevronRight,
  Layout as LayoutIcon,
  ListVideo
} from "lucide-react";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    "Media Library": false,
  });

  const toggleMenu = (label) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("smp_token");
    localStorage.removeItem("smp_user");
    navigate("/login");
  };

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/players", icon: MonitorPlay, label: "Players" },
    { path: "/content", icon: FileVideo, label: "Content" },
    { path: "/schedules", icon: Calendar, label: "Schedules" },
    { 
      path: "/media-library", 
      icon: FileVideo, 
      label: "Media Library",
      // subItems: [
      //   { path: "/media-library/all", label: "All Media" },
      //   // { path: "/media-library/folders", label: "Folders" },
      // ]
    },
    // { path: "/players", icon: MonitorPlay, label: "Screens" },
    // { path: "/layouts", icon: LayoutIcon, label: "Layouts" },
    // { path: "/playlists", icon: ListVideo, label: "Playlists" },
  ];

  const user = JSON.parse(localStorage.getItem("smp_user") || "{}");

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed inset-y-0 left-0 z-10 overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <MonitorPlay className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-lg">SMP CMS</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      location.pathname.startsWith(item.path)
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    {expandedMenus[item.label] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  {expandedMenus[item.label] && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((sub) => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={({ isActive }) =>
                            `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            }`
                          }
                        >
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              )}
            </div>
          ))}
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
                {user.company || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email || "admin@example.com"}
              </p>
            </div>
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

      {/* Main Content */}
      <main className="flex-1 ml-64 p-6 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto animation-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
