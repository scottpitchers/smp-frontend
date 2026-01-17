// src/components/Players.jsx
import React, { useState } from "react";
import { Plus, Edit2, Eye, Wifi, WifiOff } from "lucide-react";
import { MonitorPlay } from "lucide-react";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [pairingCode, setPairingCode] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");

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
  return (
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
};

export default Players;
