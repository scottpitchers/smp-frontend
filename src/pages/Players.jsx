import React, { useState } from "react";
import {
  Plus,
  MonitorPlay,
  Wifi,
  WifiOff,
  Edit2,
  Eye,
  MoreHorizontal,
  X,
  Loader2,
} from "lucide-react";
import { mockPlayers } from "../data/mockData";

const API_URL = "REPLACE_WITH_YOUR_BACKEND_URL/api";

const Players = () => {
  const [players, setPlayers] = useState(mockPlayers);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [pairingCode, setPairingCode] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isPairing, setIsPairing] = useState(false);

  const handlePairDevice = async () => {
    if (!pairingCode || !newPlayerName) {
      alert("Please enter both pairing code and player name");
      return;
    }

    setIsPairing(true);
    try {
      const token = localStorage.getItem("smp_token");
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
        // In a real app, re-fetch players here
      } else {
        alert(data.error || "Pairing failed");
      }
    } catch (error) {
      alert("Error connecting to server. Please try again.");
    } finally {
      setIsPairing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Players</h1>
          <p className="text-gray-500 mt-1">
            Manage your registered display devices
          </p>
        </div>
        <button
          onClick={() => setShowPairingModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-md hover:shadow-lg active:scale-95 font-medium"
        >
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

        <div
          onClick={() => setShowPairingModal(true)}
          className="min-h-62.5 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-center p-6 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Add New Player
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-50">
            Register a new display device to your network
          </p>
        </div>
      </div>

      {showPairingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Pair New Player
              </h3>
              <button
                onClick={() => setShowPairingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  6-Digit Pairing Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-center text-2xl font-mono tracking-widest"
                  value={pairingCode}
                  onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Player Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lobby Entrance"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                />
              </div>
              <button
                onClick={handlePairDevice}
                disabled={isPairing}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPairing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Pairing...
                  </>
                ) : (
                  "Pair Device"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;
