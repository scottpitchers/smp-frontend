// src/pages/Players.jsx
import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Eye,
  Wifi,
  WifiOff,
  MonitorPlay,
  X,
  Loader2,
  ListVideo,
  ChevronRight,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://smp-api-i5f5.onrender.com";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [showPairingModal, setShowPairingModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [pairingCode, setPairingCode] = useState("");
  const [newPlayerName, setNewPlayerName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [assignTab, setAssignTab] = useState("playlist"); // "playlist" | "layout"

  const token = localStorage.getItem("smp_token");

  const fetchPlayers = async () => {
    setFetchLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch players
      try {
        const playersRes = await fetch(`${API_URL}/api/admin/players`, {
          headers,
        });
        if (playersRes.ok) {
          const data = await playersRes.json();
          if (data.players) setPlayers(data.players);
        } else {
          console.error("Players fetch failed with status:", playersRes.status);
        }
      } catch (err) {
        console.error("Error fetching players:", err);
      }

      // Fetch playlists separately so it doesn't break players if endpoint is missing
      try {
        const playlistsRes = await fetch(`${API_URL}/api/admin/playlists`, {
          headers,
        });
        if (playlistsRes.ok) {
          const data = await playlistsRes.json();
          setPlaylists(Array.isArray(data) ? data : data.playlists || []);
        } else {
          console.warn(
            "Playlists fetch failed with status:",
            playlistsRes.status,
          );
        }
      } catch (err) {
        console.warn("Playlists endpoint might not be ready yet:", err);
        // Fallback to empty array if fetch fails (e.g. CORS or 404)
        setPlaylists([]);
      }

      // Fetch layouts
      try {
        const layoutsRes = await fetch(`${API_URL}/api/admin/layouts`, {
          headers,
        });
        if (layoutsRes.ok) {
          const data = await layoutsRes.json();
          setLayouts(data.layouts || []);
        } else {
          console.warn("Layouts fetch failed with status:", layoutsRes.status);
        }
      } catch (err) {
        console.warn("Layouts endpoint failed:", err);
        setLayouts([]);
      }
    } catch (error) {
      console.error("Critical error in fetchPlayers:", error);
    } finally {
      setFetchLoading(false);
    }
  };

  const openAssignModal = (player) => {
    setSelectedPlayer(player);
    setAssignTab("playlist");
    setShowAssignModal(true);
  };

  const handleAssignPlaylist = async (playlistId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/players/${selectedPlayer.id || selectedPlayer.player_id}/assign-playlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ playlist_id: playlistId }),
        },
      );

      if (response.ok) {
        alert("Playlist assigned successfully!");
        setShowAssignModal(false);
        fetchPlayers();
      } else {
        alert("Assignment failed");
      }
    } catch (error) {
      alert("Error assigning playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLayout = async (layoutId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/players/${selectedPlayer.id || selectedPlayer.player_id}/assign-layout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ layout_id: layoutId }),
        },
      );

      if (response.ok) {
        alert("Layout assigned successfully!");
        setShowAssignModal(false);
        fetchPlayers();
      } else {
        alert("Assignment failed");
      }
    } catch (error) {
      alert("Error assigning layout");
    } finally {
      setLoading(false);
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
      const response = await fetch(`${API_URL}/api/admin/pair-device`, {
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

      {fetchLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl shadow-sm">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading players...</p>
        </div>
      ) : players.length === 0 ? (
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
                <button
                  onClick={() => openAssignModal(player)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium cursor-pointer"
                >
                  <ListVideo className="w-4 h-4" />
                  Assign Playlist
                </button>
                {/* <div className="flex gap-2 mt-4">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-sm">
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
              </div> */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ListVideo className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Assign Content
                  </h3>
                  <p className="text-xs text-gray-500">
                    Select screen layout or playlist for {selectedPlayer?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-2 cursor-pointer hover:bg-gray-200 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/30 px-6 py-2">
              <button
                onClick={() => setAssignTab("playlist")}
                className={`flex-1 py-2 text-center text-sm font-bold border-b-2 transition-all ${
                  assignTab === "playlist"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                Playlists
              </button>
              <button
                onClick={() => setAssignTab("layout")}
                className={`flex-1 py-2 text-center text-sm font-bold border-b-2 transition-all ${
                  assignTab === "layout"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                Screen Layouts
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {assignTab === "playlist" ? (
                  playlists.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">
                        No playlists found. Create one first!
                      </p>
                    </div>
                  ) : (
                    playlists.map((playlist) => (
                      <button
                        key={playlist.id}
                        onClick={() => handleAssignPlaylist(playlist.id)}
                        disabled={loading}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition group"
                      >
                        <div className="text-left">
                          <p className="font-bold text-gray-900 group-hover:text-blue-700">
                            {playlist.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {playlist.items?.length || 0} items
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                      </button>
                    ))
                  )
                ) : (
                  layouts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">
                        No layouts found. Create one first!
                      </p>
                    </div>
                  ) : (
                    layouts.map((layout) => (
                      <button
                        key={layout.id}
                        onClick={() => handleAssignLayout(layout.id)}
                        disabled={loading}
                        className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition group"
                      >
                        <div className="text-left">
                          <p className="font-bold text-gray-900 group-hover:text-blue-700">
                            {layout.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {layout.zones?.length || 0} zones • {layout.aspect_ratio}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500" />
                      </button>
                    ))
                  )
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowAssignModal(false)}
                className="w-full cursor-pointer py-3 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
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
                        e.target.value.replace(/\D/g, "").slice(0, 6),
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
