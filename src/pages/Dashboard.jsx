"use client";
import React, { useState, useEffect } from "react";
import { MonitorPlay, Wifi, FileVideo, Calendar } from "lucide-react";
import { mockPlayers, mockContent, mockSchedules } from "../data/mockData";

const API_URL =
  import.meta.env.VITE_API_URL || "https://smp-api-i5f5.onrender.com";

const Dashboard = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const token = localStorage.getItem("smp_token");
        const response = await fetch(`${API_URL}/api/admin/players`, {
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
    fetchPlayers();
  }, []);
  const stats = [
    {
      label: "Total Players",
      value: mockPlayers.length,
      icon: MonitorPlay,
      color: "blue",
      gradient: "from-blue-500 to-blue-600",
      textColor: "text-blue-100",
    },
    {
      label: "Online",
      value: mockPlayers.filter((p) => p.status === "online").length,
      icon: Wifi,
      color: "green",
      gradient: "from-green-500 to-green-600",
      textColor: "text-green-100",
    },
    {
      label: "Content Items",
      value: mockContent.length,
      icon: FileVideo,
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
      textColor: "text-purple-100",
    },
    {
      label: "Schedules",
      value: mockSchedules.length,
      icon: Calendar,
      color: "orange",
      gradient: "from-orange-500 to-orange-600",
      textColor: "text-orange-100",
    },
  ];

  return (
    // <div className="space-y-8">
    //   <div>
    //     <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
    //     <p className="text-gray-500 mt-1">Overview of your signage network</p>
    //   </div>

    //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    //     {stats.map((stat, index) => (
    //       <div
    //         key={index}
    //         className={`rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow ${
    //           stat.color === "blue"
    //             ? "bg-linear-to-br from-blue-500 to-blue-600"
    //             : stat.color === "green"
    //             ? "bg-linear-to-br from-green-500 to-green-600"
    //             : stat.color === "purple"
    //             ? "bg-linear-to-br from-purple-500 to-purple-600"
    //             : "bg-linear-to-br from-orange-500 to-orange-600"
    //         }`}
    //       >
    //         <div className="flex items-center justify-between">
    //           <div>
    //             <p
    //               className={`text-sm font-medium opacity-90 ${stat.textColor}`}
    //             >
    //               {stat.label}
    //             </p>
    //             <p className="text-4xl font-bold mt-2">{stat.value}</p>
    //           </div>
    //           <div className="p-3 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
    //             <stat.icon className="w-8 h-8 opacity-90" />
    //           </div>
    //         </div>
    //       </div>
    //     ))}
    //   </div>

    //   <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
    //     <h3 className="text-xl font-bold mb-6 text-gray-800">
    //       Recent Activity
    //     </h3>
    //     <div className="space-y-4">
    //       <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
    //         <div className="w-3 h-3 bg-green-500 rounded-full mt-2 ring-4 ring-green-100"></div>
    //         <div className="flex-1">
    //           <p className="font-semibold text-gray-900">System initialized</p>
    //           <p className="text-sm text-gray-500 mt-1">
    //             All systems operational
    //           </p>
    //         </div>
    //         <span className="text-xs font-medium text-gray-400">Just now</span>
    //       </div>
    //       <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
    //         <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 ring-4 ring-blue-100"></div>
    //         <div className="flex-1">
    //           <p className="font-semibold text-gray-900">User logged in</p>
    //           <p className="text-sm text-gray-500 mt-1">
    //             Admin user accessed the dashboard
    //           </p>
    //         </div>
    //         <span className="text-xs font-medium text-gray-400">2 min ago</span>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Players</p>
              <p className="text-3xl font-bold mt-2">{players.length}</p>
            </div>
            <MonitorPlay className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Online</p>
              <p className="text-3xl font-bold mt-2">
                {mockPlayers.filter((p) => p.status === "online").length}
              </p>
            </div>
            <Wifi className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Content Items</p>
              <p className="text-3xl font-bold mt-2">{mockContent.length}</p>
            </div>
            <FileVideo className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Schedules</p>
              <p className="text-3xl font-bold mt-2">{mockSchedules.length}</p>
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
};

export default Dashboard;
