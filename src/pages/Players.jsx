import React, { useState } from "react";
import {
  Plus,
  MonitorPlay,
  Wifi,
  WifiOff,
  Edit2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { mockPlayers } from "../data/mockData";

const Players = () => {
  const [players] = useState(mockPlayers);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Players</h1>
          <p className="text-gray-500 mt-1">
            Manage your registered display devices
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-md hover:shadow-lg active:scale-95 font-medium">
          <Plus className="w-5 h-5" />
          Pair New Player
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {players.map((player) => (
          <div
            key={player.id}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 hover:border-blue-100"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                    player.status === "online"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  <MonitorPlay className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                    {player.name}
                  </h3>
                  <p className="text-sm text-gray-500">{player.location}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Status</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                    player.status === "online"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {player.status === "online" ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  {player.status === "online" ? "Online" : "Offline"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Current Content</span>
                <span className="font-medium text-gray-900">
                  {player.content}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Uptime</span>
                <span className="font-medium text-gray-900">
                  {player.uptime}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition font-medium text-sm">
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition font-medium text-sm">
                <Eye className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        ))}

        {/* Add Player Card Mockup */}
        <div className="min-h-[250px] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Add New Player
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-[200px]">
            Register a new display device to your network
          </p>
        </div>
      </div>
    </div>
  );
};

export default Players;
