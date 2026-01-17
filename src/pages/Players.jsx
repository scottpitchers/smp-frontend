// src/pages/Players.jsx
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Eye, Wifi, WifiOff, MonitorPlay, X } from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "REPLACE_WITH_YOUR_BACKEND_URL/api";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [pairingCode, setPairingCode] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("smp_token");

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

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handlePairDevice = async () => {
    if (!pairingCode || !newPlayerName) {
      alert("Please enter both pairing code and player name");
      return;
    }

    setLoading(true);
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
          location: location,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Player paired successfully!");
        setShowPairingModal(false);
        setPairingCode("");
        setNewPlayerName("");
        setLocation("");
        fetchPlayers();
      } else {
        alert(data.error || "Pairing failed");
      }
    } catch (error) {
      alert("Error pairing device. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Players</h2>
        <button
          onClick={() => setShowPairingModal(true)}
          className="flex items-center gap-2 bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
            className="bg-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
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
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
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

      {/* Pairing Modal */}
      {showPairingModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MonitorPlay className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Pair New Player
                  </h3>
                  <p className="text-xs text-gray-500">
                    Connect a new device to your network
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPairingModal(false)}
                className="p-2 cursor-pointer hover:bg-gray-200 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    Pairing Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code (e.g. 123456)"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 font-mono tracking-wider text-center text-lg"
                    value={pairingCode}
                    onChange={(e) =>
                      setPairingCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    maxLength={6}
                  />
                  <p className="mt-1.5 text-[11px] text-gray-500 ml-1">
                    Enter the 6-digit code currently visible on your display
                    screen.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    Player Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lobby Entrance, Suite 405"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. London, UK"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPairingModal(false)}
                  className="flex-1 cursor-pointer px-4 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePairDevice}
                  disabled={loading}
                  className="flex-[1.5] cursor-pointer bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:bg-blue-300 disabled:shadow-none inline-flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Pairing...</span>
                    </>
                  ) : (
                    "Pair Device"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Players;
