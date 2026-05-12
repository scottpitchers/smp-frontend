import React, { useState, useEffect } from "react";
import {
  Plus,
  ListVideo,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  Copy,
  Play,
  Monitor,
  Clock,
  ChevronRight,
  GripVertical,
  X,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  Film,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_URL || "https://smp-api-i5f5.onrender.com";

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" or "builder"
  const [searchQuery, setSearchQuery] = useState("");

  // Builder State
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [playlistItems, setPlaylistItems] = useState([]);
  const [playlistName, setPlaylistName] = useState("");
  const [playlistDesc, setPlaylistDesc] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showPlayerAssign, setShowPlayerAssign] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  // Preview State
  const [previewing, setPreviewing] = useState(false);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("smp_token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Playlists
      try {
        const playlistsRes = await fetch(`${API_URL}/api/admin/playlists`, {
          headers,
        });
        if (playlistsRes.ok) {
          const data = await playlistsRes.json();
          setPlaylists(Array.isArray(data) ? data : data.playlists || []);
        }
      } catch (err) {
        console.warn("Playlists fetch failed:", err);
        setPlaylists([]);
      }

      // Fetch Media
      try {
        const mediaRes = await fetch(`${API_URL}/api/admin/media`, { headers });
        if (mediaRes.ok) {
          const data = await mediaRes.json();
          const items = Array.isArray(data) ? data : data.media || [];
          setMediaLibrary(
            items.map((m) => ({
              ...m,
              name: m.original_filename || m.filename || "Unknown",
              type: m.mime_type || m.file_type || "unknown",
            })),
          );
        }
      } catch (err) {
        console.error("Media fetch failed:", err);
      }

      // Fetch Players
      try {
        const playersRes = await fetch(`${API_URL}/api/admin/players`, {
          headers,
        });
        if (playersRes.ok) {
          const data = await playersRes.json();
          setPlayers(data.players || []);
        }
      } catch (err) {
        console.error("Players fetch failed:", err);
      }
    } catch (error) {
      console.error("Critical error in fetchData:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Builder Logic ---

  const startNewPlaylist = () => {
    setEditingPlaylist(null);
    setPlaylistName("");
    setPlaylistDesc("");
    setPlaylistItems([]);
    setSelectedPlayers([]);
    setView("builder");
  };

  const editPlaylist = (playlist) => {
    setEditingPlaylist(playlist);
    setPlaylistName(playlist.name);
    setPlaylistDesc(playlist.description || "");
    setPlaylistItems(playlist.items || []);
    setSelectedPlayers(playlist.assigned_players || []);
    setView("builder");
  };

  const addMediaToPlaylist = (media) => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      media_id: media.id,
      name: media.name,
      url: media.url,
      type: media.type,
      duration: media.type.includes("video") ? 0 : 20, // 0 for video (use natural duration), 20s default for images
    };
    setPlaylistItems([...playlistItems, newItem]);
  };

  const removePlaylistItem = (index) => {
    const newItems = [...playlistItems];
    newItems.splice(index, 1);
    setPlaylistItems(newItems);
  };

  const updateItemDuration = (index, duration) => {
    const newItems = [...playlistItems];
    newItems[index].duration = parseInt(duration) || 0;
    setPlaylistItems(newItems);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("index", index);
  };

  const handleDrop = (e, targetIndex) => {
    const sourceIndex = e.dataTransfer.getData("index");
    const newItems = [...playlistItems];
    const [movedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);
    setPlaylistItems(newItems);
  };

  const savePlaylist = async () => {
    if (!playlistName) return alert("Please enter a playlist name");

    setLoading(true);
    try {
      const token = localStorage.getItem("smp_token");
      const method = editingPlaylist ? "PUT" : "POST";
      const url = editingPlaylist
        ? `${API_URL}/api/admin/playlists/${editingPlaylist.id}`
        : `${API_URL}/api/admin/playlists`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: playlistName,
          description: playlistDesc,
          items: playlistItems,
          assigned_players: selectedPlayers,
        }),
      });

      if (res.ok) {
        fetchData();
        setView("list");
      }
    } catch (error) {
      console.error("Error saving playlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletePlaylist = async (id) => {
    if (!window.confirm("Are you sure you want to delete this playlist?"))
      return;

    try {
      const token = localStorage.getItem("smp_token");
      const res = await fetch(`${API_URL}/api/admin/playlists/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting playlist:", error);
    }
  };

  const duplicatePlaylist = (playlist) => {
    setEditingPlaylist(null);
    setPlaylistName(`${playlist.name} (Copy)`);
    setPlaylistDesc(playlist.description);
    setPlaylistItems([...playlist.items]);
    setSelectedPlayers([]);
    setView("builder");
  };

  // --- Preview Logic ---
  useEffect(() => {
    let timer;
    if (previewing && playlistItems.length > 0) {
      const currentItem = playlistItems[currentPreviewIndex];
      const duration =
        currentItem.duration > 0 ? currentItem.duration * 1000 : 5000; // fallback 5s for videos if duration is 0

      timer = setTimeout(() => {
        setCurrentPreviewIndex((prev) => (prev + 1) % playlistItems.length);
      }, duration);
    }
    return () => clearTimeout(timer);
  }, [previewing, currentPreviewIndex, playlistItems]);

  // --- Rendering ---

  const filteredPlaylists = playlists.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (view === "builder") {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("list")}
              className="p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {editingPlaylist ? "Edit Playlist" : "Create Playlist"}
              </h1>
              <p className="text-sm text-gray-500">
                Construct your content sequence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewing(true)}
              disabled={playlistItems.length === 0}
              className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 ${playlistItems.length === 0 ? "cursor-not-allowed" : "cursor-pointer"} rounded-lg hover:bg-gray-50 transition shadow-sm font-medium disabled:opacity-50`}
            >
              <Play className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={savePlaylist}
              className="flex items-center cursor-pointer gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md font-medium"
            >
              <Save className="w-4 h-4" />
              Save Playlist
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <h2 className="font-semibold text-gray-900">Playlist Info</h2>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="e.g. Morning Specials"
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  value={playlistDesc}
                  onChange={(e) => setPlaylistDesc(e.target.value)}
                  placeholder="Optional description..."
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition resize-none"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-gray-900">
                  Player Assignment
                </h2>
                <button
                  onClick={() => setShowPlayerAssign(true)}
                  className="text-sm text-blue-600 hover:underline font-medium cursor-pointer"
                >
                  Manage
                </button>
              </div>
              <div className="space-y-2">
                {selectedPlayers.length === 0 ? (
                  <p className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border border-dashed border-gray-200">
                    No players assigned yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {selectedPlayers.map((player_id) => {
                      const player = players.find(
                        (p) => p.player_id === player_id,
                      );
                      return (
                        <span
                          key={player_id}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100"
                        >
                          {player?.name || "Unknown Player"}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">
                Content Sequence ({playlistItems.length})
              </h2>
              <button
                onClick={() => setShowMediaPicker(true)}
                className="flex items-center gap-2 cursor-pointer text-sm bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Media
              </button>
            </div>

            <div className="space-y-2">
              {playlistItems.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                  <ListVideo className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your playlist is empty.</p>
                  <button
                    onClick={() => setShowMediaPicker(true)}
                    className="mt-4 text-blue-600 font-medium hover:underline cursor-pointer"
                  >
                    Browse media library
                  </button>
                </div>
              ) : (
                playlistItems.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, index)}
                    className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 group hover:border-blue-300 transition-all cursor-move"
                  >
                    <GripVertical className="w-5 h-5 text-gray-300 group-hover:text-gray-500" />
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                      {item.type.includes("image") ? (
                        <img
                          src={item.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                          <Film className="w-5 h-5 text-white opacity-50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 uppercase">
                        {item.type.split("/")[1] || item.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                          <input
                            type="number"
                            value={item.duration}
                            onChange={(e) =>
                              updateItemDuration(index, e.target.value)
                            }
                            className="w-10 bg-transparent text-sm font-medium outline-none text-center"
                          />
                          <span className="text-xs text-gray-400 font-medium">
                            s
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => removePlaylistItem(index)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {playlistItems.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                <span className="text-sm font-medium text-blue-700">
                  Total Duration
                </span>
                <span className="text-lg font-bold text-blue-800">
                  {Math.floor(
                    playlistItems.reduce(
                      (acc, item) => acc + (item.duration || 0),
                      0,
                    ) / 60,
                  )}
                  m{" "}
                  {playlistItems.reduce(
                    (acc, item) => acc + (item.duration || 0),
                    0,
                  ) % 60}
                  s
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Media Picker Modal */}
        {showMediaPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Add Media</h3>
                <button
                  onClick={() => setShowMediaPicker(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {mediaLibrary.map((media) => (
                    <div
                      key={media.id}
                      onClick={() => {
                        addMediaToPlaylist(media);
                        setShowMediaPicker(false);
                      }}
                      className="group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <div className="aspect-video bg-gray-100 relative">
                        {media.type.includes("image") ? (
                          <img
                            src={media.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <Film className="w-8 h-8 text-white opacity-20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center">
                          <Plus className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {media.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player Assignment Modal */}
        {showPlayerAssign && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">
                  Assign Players
                </h3>
                <button
                  onClick={() => setShowPlayerAssign(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-2 max-h-[60vh] overflow-y-auto">
                {players.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No players found.
                  </p>
                ) : (
                  players.map((player) => (
                    <label
                      key={player.player_id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPlayers.includes(player.player_id)}
                        onChange={(e) => {
                          if (e.target.checked)
                            setSelectedPlayers([
                              ...selectedPlayers,
                              player.player_id,
                            ]);
                          else
                            setSelectedPlayers(
                              selectedPlayers.filter(
                                (id) => id !== player.player_id,
                              ),
                            );
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {player.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {player.location}
                        </p>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full ${player.status === "online" ? "bg-green-500" : "bg-gray-300"}`}
                      ></div>
                    </label>
                  ))
                )}
              </div>
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setShowPlayerAssign(false)}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview Modal */}
        {previewing && (
          <div className="fixed inset-0 z-[60] flex flex-col bg-black text-white p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold">{playlistName}</h3>
                <p className="text-gray-400 text-sm">
                  Previewing Item {currentPreviewIndex + 1} of{" "}
                  {playlistItems.length}
                </p>
              </div>
              <button
                onClick={() => setPreviewing(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              {playlistItems[currentPreviewIndex].type.includes("image") ? (
                <img
                  key={playlistItems[currentPreviewIndex].id}
                  src={playlistItems[currentPreviewIndex].url}
                  alt=""
                  className="max-w-full max-h-full object-contain animate-in fade-in zoom-in duration-500"
                />
              ) : (
                <video
                  key={playlistItems[currentPreviewIndex].id}
                  src={playlistItems[currentPreviewIndex].url}
                  autoPlay
                  muted
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>
            <div className="mt-8 flex justify-center gap-2">
              {playlistItems.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 max-w-[40px] rounded-full transition-all duration-300 ${
                    idx === currentPreviewIndex
                      ? "bg-blue-500 scale-y-150"
                      : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Playlists</h1>
          <p className="text-gray-500 mt-1">
            Manage content loops and schedules.
          </p>
        </div>
        <button
          onClick={startNewPlaylist}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition shadow-md font-bold"
        >
          <Plus className="w-5 h-5" />
          New Playlist
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 w-full md:max-w-md relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search playlists..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredPlaylists.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 border-dashed">
          <ListVideo className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900">
            No playlists found
          </h3>
          <p className="text-gray-500 mt-2">
            Create your first playlist to start broadcasting content.
          </p>
          <button
            onClick={startNewPlaylist}
            className="mt-6 px-6 cursor-pointer py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <ListVideo className="w-6 h-6" />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => duplicatePlaylist(playlist)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => editPlaylist(playlist)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePlaylist(playlist.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {playlist.name}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-6">
                  {playlist.description || "No description provided."}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <Film className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold">
                      {playlist.items?.length || 0} Items
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-bold">
                      {Math.floor(
                        (playlist.items?.reduce(
                          (acc, item) => acc + (item.duration || 0),
                          0,
                        ) || 0) / 60,
                      )}
                      m{" "}
                      {(playlist.items?.reduce(
                        (acc, item) => acc + (item.duration || 0),
                        0,
                      ) || 0) % 60}
                      s
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500">
                    {playlist.assigned_players?.length || 0} Players Assigned
                  </span>
                </div>
                <button
                  onClick={() => editPlaylist(playlist)}
                  className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 text-blue-600 hover:bg-blue-50 transition"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;
