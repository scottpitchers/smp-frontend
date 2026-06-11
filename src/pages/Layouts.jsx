import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Layout as LayoutIcon,
  Search,
  Copy,
  Edit2,
  Trash2,
  ChevronRight,
  Monitor,
  ArrowLeft,
  Save,
  Play,
  X,
  Layers,
  Sparkles,
  Maximize2,
  Film,
  Image as ImageIcon,
  Palette,
  Grid,
  Loader2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://smp-api-i5f5.onrender.com";

const PREBUILT_TEMPLATES = [
  {
    name: "Full Screen",
    description: "Single zone covering 100% of screen",
    zones: [
      { id: "zone-full", name: "Full Zone", top: 0, left: 0, width: 100, height: 100, layer: 1, content_type: "empty", content_id: null, bg_color: "#000000" }
    ]
  },
  {
    name: "Split Horizontal",
    description: "Two zones: Top (70%) + Bottom (30%)",
    zones: [
      { id: "zone-top", name: "Top Zone", top: 0, left: 0, width: 100, height: 70, layer: 1, content_type: "empty", content_id: null, bg_color: "#000000" },
      { id: "zone-bottom", name: "Bottom Zone", top: 70, left: 0, width: 100, height: 30, layer: 1, content_type: "empty", content_id: null, bg_color: "#1e293b" }
    ]
  },
  {
    name: "Split Vertical",
    description: "Two zones: Left (60%) + Right (40%)",
    zones: [
      { id: "zone-left", name: "Left Zone", top: 0, left: 0, width: 60, height: 100, layer: 1, content_type: "empty", content_id: null, bg_color: "#000000" },
      { id: "zone-right", name: "Right Zone", top: 0, left: 60, width: 40, height: 100, layer: 1, content_type: "empty", content_id: null, bg_color: "#1e293b" }
    ]
  },
  {
    name: "L-Shape",
    description: "Main content + bottom ticker + side panel",
    zones: [
      { id: "zone-main", name: "Main Content", top: 0, left: 0, width: 70, height: 75, layer: 1, content_type: "empty", content_id: null, bg_color: "#000000" },
      { id: "zone-side", name: "Side Panel", top: 0, left: 70, width: 30, height: 100, layer: 1, content_type: "empty", content_id: null, bg_color: "#1e293b" },
      { id: "zone-ticker", name: "Bottom Ticker", top: 75, left: 0, width: 70, height: 25, layer: 1, content_type: "empty", content_id: null, bg_color: "#0f172a" }
    ]
  },
  {
    name: "Picture-in-Picture",
    description: "Full screen main + small overlay in corner",
    zones: [
      { id: "zone-main", name: "Main Content", top: 0, left: 0, width: 100, height: 100, layer: 1, content_type: "empty", content_id: null, bg_color: "#000000" },
      { id: "zone-pip", name: "Overlay", top: 70, left: 70, width: 25, height: 25, layer: 2, content_type: "empty", content_id: null, bg_color: "#1e293b" }
    ]
  },
  {
    name: "Three Column",
    description: "Three equal vertical columns",
    zones: [
      { id: "zone-col1", name: "Left Column", top: 0, left: 0, width: 33.33, height: 100, layer: 1, content_type: "empty", content_id: null, bg_color: "#000000" },
      { id: "zone-col2", name: "Center Column", top: 0, left: 33.33, width: 33.33, height: 100, layer: 1, content_type: "empty", content_id: null, bg_color: "#1e293b" },
      { id: "zone-col3", name: "Right Column", top: 0, left: 66.66, width: 33.34, height: 100, layer: 1, content_type: "empty", content_id: null, bg_color: "#0f172a" }
    ]
  },
  {
    name: "Grid 2x2",
    description: "Four equal quadrants",
    zones: [
      { id: "zone-tl", name: "Top Left", top: 0, left: 0, width: 50, height: 50, layer: 1, content_type: "empty", content_id: null, bg_color: "#000000" },
      { id: "zone-tr", name: "Top Right", top: 0, left: 50, width: 50, height: 50, layer: 1, content_type: "empty", content_id: null, bg_color: "#1e293b" },
      { id: "zone-bl", name: "Bottom Left", top: 50, left: 0, width: 50, height: 50, layer: 1, content_type: "empty", content_id: null, bg_color: "#0f172a" },
      { id: "zone-br", name: "Bottom Right", top: 50, left: 50, width: 50, height: 50, layer: 1, content_type: "empty", content_id: null, bg_color: "#334155" }
    ]
  }
];

const COLOR_PRESETS = [
  "#000000",
  "#1e293b",
  "#0f172a",
  "#334155",
  "#2563eb",
  "#4f46e5",
  "#0891b2",
  "#16a34a",
  "#dc2626",
  "#ffffff"
];

const Layouts = () => {
  const [layouts, setLayouts] = useState([]);
  const [mediaLibrary, setMediaLibrary] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // "list" | "editor"
  const [searchQuery, setSearchQuery] = useState("");

  // Editor State
  const [editingLayout, setEditingLayout] = useState(null);
  const [layoutName, setLayoutName] = useState("");
  const [layoutDesc, setLayoutDesc] = useState("");
  const [layoutZones, setLayoutZones] = useState([]);
  const [layoutAspectRatio, setLayoutAspectRatio] = useState("16:9");
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Modals
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showPlayerAssign, setShowPlayerAssign] = useState(false);
  const [targetLayoutForAssign, setTargetLayoutForAssign] = useState(null);
  const [previewingId, setPreviewingId] = useState(null);

  const canvasRef = useRef(null);
  const dragInfo = useRef(null);

  const token = localStorage.getItem("smp_token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch Layouts
      try {
        const res = await fetch(`${API_URL}/api/admin/layouts`, { headers });
        if (res.ok) {
          const data = await res.json();
          setLayouts(data.layouts || []);
        }
      } catch (err) {
        console.error("Error fetching layouts:", err);
      }

      // Fetch Playlists
      try {
        const res = await fetch(`${API_URL}/api/admin/playlists`, { headers });
        if (res.ok) {
          const data = await res.json();
          setPlaylists(Array.isArray(data) ? data : data.playlists || []);
        }
      } catch (err) {
        console.error("Error fetching playlists:", err);
      }

      // Fetch Media
      try {
        const res = await fetch(`${API_URL}/api/admin/media`, { headers });
        if (res.ok) {
          const data = await res.json();
          setMediaLibrary(data.media || []);
        }
      } catch (err) {
        console.error("Error fetching media:", err);
      }

      // Fetch Players
      try {
        const res = await fetch(`${API_URL}/api/admin/players`, { headers });
        if (res.ok) {
          const data = await res.json();
          setPlayers(data.players || []);
        }
      } catch (err) {
        console.error("Error fetching players:", err);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startNewLayout = () => {
    setEditingLayout(null);
    setLayoutName("");
    setLayoutDesc("");
    setLayoutZones([]);
    setLayoutAspectRatio("16:9");
    setSelectedZoneId(null);
    setShowTemplatePicker(true);
  };

  const handleSelectTemplate = (template) => {
    // Generate fresh IDs for template zones
    const zonesCopy = template.zones.map((z, idx) => ({
      ...z,
      id: `zone-${Math.random().toString(36).substr(2, 9)}`,
    }));
    setLayoutZones(zonesCopy);
    if (zonesCopy.length > 0) {
      setSelectedZoneId(zonesCopy[0].id);
    }
    setShowTemplatePicker(false);
    setView("editor");
  };

  const startEditLayout = (layout) => {
    setEditingLayout(layout);
    setLayoutName(layout.name);
    setLayoutDesc(layout.description || "");
    setLayoutZones(layout.zones || []);
    setLayoutAspectRatio(layout.aspect_ratio || "16:9");
    setSelectedZoneId(layout.zones?.[0]?.id || null);
    setView("editor");
  };

  const duplicateLayout = async (layout) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/layouts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${layout.name} (Copy)`,
          description: layout.description,
          zones: layout.zones,
          aspect_ratio: layout.aspect_ratio,
        }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error duplicating layout:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteLayout = async (id) => {
    if (!window.confirm("Are you sure you want to delete this layout?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/layouts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error deleting layout:", err);
      setLoading(false);
    }
  };

  const saveLayout = async () => {
    if (!layoutName.trim()) {
      alert("Please enter a layout name");
      return;
    }

    setLoading(true);
    try {
      const method = editingLayout ? "PUT" : "POST";
      const url = editingLayout
        ? `${API_URL}/api/admin/layouts/${editingLayout.id}`
        : `${API_URL}/api/admin/layouts`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: layoutName,
          description: layoutDesc,
          zones: layoutZones,
          aspect_ratio: layoutAspectRatio,
        }),
      });

      if (res.ok) {
        fetchData();
        setView("list");
      }
    } catch (err) {
      console.error("Error saving layout:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Visual Editor Interactions ---

  const addCustomZone = () => {
    const id = `zone-${Math.random().toString(36).substr(2, 9)}`;
    const newZone = {
      id,
      name: `Zone ${layoutZones.length + 1}`,
      top: 10,
      left: 10,
      width: 30,
      height: 30,
      layer: layoutZones.length + 1,
      content_type: "empty",
      content_id: null,
      bg_color: "#1e293b",
    };
    setLayoutZones([...layoutZones, newZone]);
    setSelectedZoneId(id);
  };

  const deleteSelectedZone = () => {
    if (!selectedZoneId) return;
    if (!window.confirm("Are you sure you want to delete this zone?")) return;

    const updated = layoutZones.filter((z) => z.id !== selectedZoneId);
    setLayoutZones(updated);
    setSelectedZoneId(updated[0]?.id || null);
  };

  const updateSelectedZone = (field, value) => {
    setLayoutZones(
      layoutZones.map((z) => {
        if (z.id === selectedZoneId) {
          return { ...z, [field]: value };
        }
        return z;
      })
    );
  };

  const handleLayerOrder = (direction) => {
    const activeZone = layoutZones.find((z) => z.id === selectedZoneId);
    if (!activeZone) return;

    let currentLayer = activeZone.layer || 1;
    let newLayer = currentLayer;
    
    if (direction === "front") {
      newLayer = Math.max(...layoutZones.map((z) => z.layer || 1), 0) + 1;
    } else if (direction === "back") {
      newLayer = Math.min(1, Math.min(...layoutZones.map((z) => z.layer || 1), 1)) - 1;
    }

    updateSelectedZone("layer", newLayer);
  };

  // Drag and Resize Handlers
  const handleCanvasMouseDown = (e, zone, type, handle = "") => {
    e.stopPropagation();
    setSelectedZoneId(zone.id);

    if (!canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();

    dragInfo.current = {
      type,
      handle,
      zoneId: zone.id,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: zone.left,
      startTop: zone.top,
      startWidth: zone.width,
      startHeight: zone.height,
      canvasWidth: canvasRect.width,
      canvasHeight: canvasRect.height,
    };

    window.addEventListener("mousemove", handleCanvasMouseMove);
    window.addEventListener("mouseup", handleCanvasMouseUp);
  };

  const handleCanvasMouseMove = (e) => {
    if (!dragInfo.current) return;
    const {
      type,
      handle,
      zoneId,
      startX,
      startY,
      startLeft,
      startTop,
      startWidth,
      startHeight,
      canvasWidth,
      canvasHeight,
    } = dragInfo.current;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const percentDx = (dx / canvasWidth) * 100;
    const percentDy = (dy / canvasHeight) * 100;

    setLayoutZones((prevZones) =>
      prevZones.map((z) => {
        if (z.id !== zoneId) return z;

        let left = z.left;
        let top = z.top;
        let width = z.width;
        let height = z.height;

        if (type === "move") {
          left = startLeft + percentDx;
          top = startTop + percentDy;

          // Constraints
          left = Math.max(0, Math.min(100 - width, left));
          top = Math.max(0, Math.min(100 - height, top));

          if (snapToGrid) {
            left = Math.round(left / 5) * 5;
            top = Math.round(top / 5) * 5;
          }
        } else if (type === "resize") {
          if (handle === "br") {
            width = startWidth + percentDx;
            height = startHeight + percentDy;

            width = Math.max(5, Math.min(100 - left, width));
            height = Math.max(5, Math.min(100 - top, height));

            if (snapToGrid) {
              width = Math.round(width / 5) * 5;
              height = Math.round(height / 5) * 5;
            }
          } else if (handle === "tl") {
            left = startLeft + percentDx;
            top = startTop + percentDy;
            width = startWidth - percentDx;
            height = startHeight - percentDy;

            // Bounds constraints
            if (left < 0) {
              width += left;
              left = 0;
            }
            if (top < 0) {
              height += top;
              top = 0;
            }
            if (width < 5) {
              left = startLeft + startWidth - 5;
              width = 5;
            }
            if (height < 5) {
              top = startTop + startHeight - 5;
              height = 5;
            }

            if (snapToGrid) {
              left = Math.round(left / 5) * 5;
              top = Math.round(top / 5) * 5;
              width = Math.round(width / 5) * 5;
              height = Math.round(height / 5) * 5;
            }
          }
        }

        // Float accuracy precision
        return {
          ...z,
          left: parseFloat(left.toFixed(2)),
          top: parseFloat(top.toFixed(2)),
          width: parseFloat(width.toFixed(2)),
          height: parseFloat(height.toFixed(2)),
        };
      })
    );
  };

  const handleCanvasMouseUp = () => {
    dragInfo.current = null;
    window.removeEventListener("mousemove", handleCanvasMouseMove);
    window.removeEventListener("mouseup", handleCanvasMouseUp);
  };

  // --- Layout Assignment ---

  const openPlayerAssignModal = (layout) => {
    setTargetLayoutForAssign(layout);
    setShowPlayerAssign(true);
  };

  const handleAssignLayoutToPlayer = async (playerId) => {
    if (!targetLayoutForAssign) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/admin/players/${playerId}/assign-layout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ layout_id: targetLayoutForAssign.id }),
        }
      );

      if (res.ok) {
        alert(`Layout successfully assigned to player!`);
        setShowPlayerAssign(false);
        fetchData();
      } else {
        alert("Assignment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error assigning layout");
    } finally {
      setLoading(false);
    }
  };

  const getMediaUrl = (mediaId) => {
    const m = mediaLibrary.find((x) => x.id === mediaId);
    return m ? m.url : "";
  };

  const activeZone = layoutZones.find((z) => z.id === selectedZoneId);

  // Filtered layouts
  const filteredLayouts = layouts.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {view === "list" ? (
        // ================= LIST VIEW =================
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Screen Layouts</h1>
              <p className="text-gray-500 mt-1">
                Design and manage multi-zone broadcast screens.
              </p>
            </div>
            <button
              onClick={startNewLayout}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition shadow-md font-bold"
            >
              <Plus className="w-5 h-5" />
              New Layout
            </button>
          </div>

          {/* Search bar */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-1 w-full md:max-w-md relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search layouts..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading && layouts.length === 0 ? (
            <div className="flex items-center justify-center p-20">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredLayouts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 border-dashed">
              <LayoutIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900">
                No layouts found
              </h3>
              <p className="text-gray-500 mt-2">
                Create a customized multi-zone screen to separate content channels.
              </p>
              <button
                onClick={startNewLayout}
                className="mt-6 px-6 cursor-pointer py-2 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLayouts.map((layout) => (
                <div
                  key={layout.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all group overflow-hidden flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      {/* Mini Thumbnail */}
                      <div className="aspect-video w-24 h-14 bg-slate-900 rounded border border-slate-700 relative overflow-hidden shrink-0 shadow-inner">
                        {(layout.zones || []).map((zone, idx) => (
                          <div
                            key={zone.id || idx}
                            style={{
                              position: "absolute",
                              left: `${zone.left}%`,
                              top: `${zone.top}%`,
                              width: `${zone.width}%`,
                              height: `${zone.height}%`,
                              backgroundColor: zone.bg_color || "#334155",
                              border: "0.5px solid rgba(255,255,255,0.15)",
                              zIndex: zone.layer || 1,
                            }}
                          />
                        ))}
                      </div>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => duplicateLayout(layout)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEditLayout(layout)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteLayout(layout.id)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {layout.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {layout.description || "No description provided."}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                        <Grid className="w-3.5 h-3.5 text-blue-500" />
                        <span className="font-semibold">
                          {layout.zones?.length || 0} Zones
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                        <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-semibold">
                          {layout.aspect_ratio || "16:9"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between mt-auto">
                    <button
                      onClick={() => openPlayerAssignModal(layout)}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      Assign to Screen
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPreviewingId(layout.id)}
                        className="p-1 text-gray-400 hover:text-purple-600"
                        title="Preview layout"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEditLayout(layout)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // ================= VISUAL EDITOR =================
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
                  {editingLayout ? "Edit Screen Layout" : "Create Screen Layout"}
                </h1>
                <p className="text-sm text-gray-500">
                  Manage grid positions and content nodes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewingId("local")}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm font-medium"
              >
                <Play className="w-4 h-4" />
                Live Preview
              </button>
              <button
                onClick={saveLayout}
                className="flex items-center cursor-pointer gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md font-medium"
              >
                <Save className="w-4 h-4" />
                Save Layout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column: Properties / Tools */}
            <div className="lg:col-span-1 space-y-6">
              {/* Info panel */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <LayoutIcon className="w-4 h-4 text-blue-500" />
                  Layout Info
                </h2>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={layoutName}
                    onChange={(e) => setLayoutName(e.target.value)}
                    placeholder="e.g. Lobby Board"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    value={layoutDesc}
                    onChange={(e) => setLayoutDesc(e.target.value)}
                    placeholder="Brief description..."
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm transition resize-none"
                  />
                </div>
              </div>

              {/* Grid Control */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-3">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Grid className="w-4 h-4 text-indigo-500" />
                  Grid Settings
                </h2>
                <label className="flex items-center gap-3 p-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Snap to grid</p>
                    <p className="text-xs text-gray-400">Align in 5% increments</p>
                  </div>
                </label>
                <button
                  onClick={addCustomZone}
                  className="w-full py-2 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 text-sm transition"
                >
                  + Add Custom Zone
                </button>
              </div>
            </div>

            {/* Canvas Area (2 Columns) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm text-xs font-medium text-gray-500">
                <span>Canvas (16:9 Aspect Ratio)</span>
                <span className="flex items-center gap-1 text-blue-600">
                  <Sparkles className="w-3.5 h-3.5" />
                  Drag zones to reposition. Drag corners to resize.
                </span>
              </div>

              {/* Aspect Ratio Container (relative, forced 16:9 via aspect-video) */}
              <div
                ref={canvasRef}
                className="aspect-video w-full bg-slate-950 rounded-2xl border-4 border-slate-900 shadow-2xl relative overflow-hidden grid-background select-none"
                style={{
                  backgroundImage: snapToGrid
                    ? "radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0)"
                    : "none",
                  backgroundSize: "5% 5%",
                }}
              >
                {layoutZones.map((zone) => {
                  const isActive = zone.id === selectedZoneId;
                  const isPlaylist = zone.content_type === "playlist";
                  const isMedia = zone.content_type === "media";
                  const hasContent = zone.content_id !== null;

                  return (
                    <div
                      key={zone.id}
                      onMouseDown={(e) => handleCanvasMouseDown(e, zone, "move")}
                      style={{
                        position: "absolute",
                        left: `${zone.left}%`,
                        top: `${zone.top}%`,
                        width: `${zone.width}%`,
                        height: `${zone.height}%`,
                        zIndex: zone.layer || 1,
                        backgroundColor: zone.bg_color || "#1e293b",
                      }}
                      className={`group cursor-move transition-all duration-75 flex flex-col items-center justify-center text-center p-2 select-none border-2 ${
                        isActive
                          ? "border-blue-500 ring-2 ring-blue-500/30"
                          : "border-slate-700/60 hover:border-slate-500"
                      }`}
                    >
                      {/* Name / info */}
                      <span className="text-white text-xs font-bold drop-shadow truncate max-w-full">
                        {zone.name}
                      </span>
                      <span className="text-[10px] text-slate-300 drop-shadow mt-0.5 max-w-full truncate">
                        {isPlaylist && "Playlist Assigned"}
                        {isMedia && "Single Media"}
                        {zone.content_type === "color" && "Color Background"}
                        {zone.content_type === "empty" && "Empty Zone"}
                      </span>

                      {/* Top Left resize handle */}
                      <div
                        onMouseDown={(e) => handleCanvasMouseDown(e, zone, "resize", "tl")}
                        className={`absolute w-3 h-3 bg-white border border-blue-600 rounded-full cursor-nwse-resize -left-1.5 -top-1.5 opacity-0 group-hover:opacity-100 ${
                          isActive ? "opacity-100 scale-125" : ""
                        }`}
                      />

                      {/* Bottom Right resize handle */}
                      <div
                        onMouseDown={(e) => handleCanvasMouseDown(e, zone, "resize", "br")}
                        className={`absolute w-3 h-3 bg-white border border-blue-600 rounded-full cursor-nwse-resize -right-1.5 -bottom-1.5 opacity-0 group-hover:opacity-100 ${
                          isActive ? "opacity-100 scale-125" : ""
                        }`}
                      />

                      {/* Layer order tag */}
                      <span className="absolute bottom-1 right-1.5 bg-black/60 text-slate-300 text-[8px] px-1 rounded">
                        L: {zone.layer || 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Properties panel */}
            <div className="lg:col-span-1">
              {activeZone ? (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-gray-900 truncate">
                      {activeZone.name} Properties
                    </h3>
                    <button
                      onClick={deleteSelectedZone}
                      className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded transition"
                      title="Delete zone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* General */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Zone Name
                      </label>
                      <input
                        type="text"
                        value={activeZone.name}
                        onChange={(e) => updateSelectedZone("name", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                      />
                    </div>

                    {/* Coordinates Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                          Left (%)
                        </label>
                        <input
                          type="number"
                          value={activeZone.left}
                          onChange={(e) => updateSelectedZone("left", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                          Top (%)
                        </label>
                        <input
                          type="number"
                          value={activeZone.top}
                          onChange={(e) => updateSelectedZone("top", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                          Width (%)
                        </label>
                        <input
                          type="number"
                          value={activeZone.width}
                          onChange={(e) => updateSelectedZone("width", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                          Height (%)
                        </label>
                        <input
                          type="number"
                          value={activeZone.height}
                          onChange={(e) => updateSelectedZone("height", parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm outline-none"
                        />
                      </div>
                    </div>

                    {/* Layer controls */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                        Z-Index Layer ({activeZone.layer || 1})
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLayerOrder("back")}
                          className="flex-1 py-1 px-2 border border-gray-200 hover:bg-gray-50 rounded text-xs font-medium flex items-center justify-center gap-1"
                        >
                          <Layers className="w-3.5 h-3.5 transform rotate-180" />
                          Send to Back
                        </button>
                        <button
                          onClick={() => handleLayerOrder("front")}
                          className="flex-1 py-1 px-2 border border-gray-200 hover:bg-gray-50 rounded text-xs font-medium flex items-center justify-center gap-1"
                        >
                          <Layers className="w-3.5 h-3.5" />
                          Bring to Front
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Colors */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeZone.bg_color || "#1e293b"}
                        onChange={(e) => updateSelectedZone("bg_color", e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0 overflow-hidden"
                      />
                      <input
                        type="text"
                        value={activeZone.bg_color || "#1e293b"}
                        onChange={(e) => updateSelectedZone("bg_color", e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm outline-none font-mono"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          onClick={() => updateSelectedZone("bg_color", color)}
                          className="w-5 h-5 rounded-full border border-gray-200 shadow-sm cursor-pointer"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bind content */}
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Zone Content
                    </label>

                    {/* Content Type Toggles */}
                    <div className="grid grid-cols-2 gap-1.5 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => {
                          updateSelectedZone("content_type", "playlist");
                          updateSelectedZone("content_id", null);
                        }}
                        className={`py-1 text-center rounded text-xs font-bold transition-all ${
                          activeZone.content_type === "playlist"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Playlist
                      </button>
                      <button
                        onClick={() => {
                          updateSelectedZone("content_type", "media");
                          updateSelectedZone("content_id", null);
                        }}
                        className={`py-1 text-center rounded text-xs font-bold transition-all ${
                          activeZone.content_type === "media"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Media Item
                      </button>
                      <button
                        onClick={() => {
                          updateSelectedZone("content_type", "color");
                          updateSelectedZone("content_id", null);
                        }}
                        className={`py-1 text-center rounded text-xs font-bold transition-all ${
                          activeZone.content_type === "color"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Color Only
                      </button>
                      <button
                        onClick={() => {
                          updateSelectedZone("content_type", "empty");
                          updateSelectedZone("content_id", null);
                        }}
                        className={`py-1 text-center rounded text-xs font-bold transition-all ${
                          activeZone.content_type === "empty"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        Empty
                      </button>
                    </div>

                    {/* Conditional bindings */}
                    {activeZone.content_type === "playlist" && (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        {playlists.length === 0 ? (
                          <p className="text-xs text-orange-500 bg-orange-50 p-2 rounded">
                            No playlists found. Please create one in the Playlists section.
                          </p>
                        ) : (
                          <select
                            value={activeZone.content_id || ""}
                            onChange={(e) => updateSelectedZone("content_id", e.target.value || null)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none text-sm"
                          >
                            <option value="">-- Choose Playlist --</option>
                            {playlists.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    {activeZone.content_type === "media" && (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        {activeZone.content_id ? (
                          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 overflow-hidden">
                              {mediaLibrary.find((x) => x.id === activeZone.content_id)?.file_type === "video" ? (
                                <Film className="w-4 h-4 text-blue-500 shrink-0" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                              )}
                              <span className="text-xs font-semibold truncate text-gray-700">
                                {mediaLibrary.find((x) => x.id === activeZone.content_id)?.original_filename || "Media Item"}
                              </span>
                            </div>
                            <button
                              onClick={() => updateSelectedZone("content_id", null)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowMediaPicker(true)}
                            className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-blue-600 hover:border-blue-500 transition text-xs font-semibold"
                          >
                            Select Media File
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 text-center py-12 text-gray-400">
                  <LayoutIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No zone selected</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Click a zone in the canvas to view or modify its attributes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Template selection modal (New Layout wizard) */}
      {showTemplatePicker && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Choose Screen Template</h3>
                <p className="text-xs text-gray-400 mt-0.5">Select a multi-zone structure to start with</p>
              </div>
              <button
                onClick={() => setShowTemplatePicker(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {PREBUILT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  onClick={() => handleSelectTemplate(tmpl)}
                  className="flex items-start gap-4 p-4 text-left border border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl transition group"
                >
                  <div className="aspect-video w-28 h-16 bg-slate-950 border border-slate-800 rounded relative overflow-hidden shrink-0 shadow-md">
                    {tmpl.zones.map((zone, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "absolute",
                          left: `${zone.left}%`,
                          top: `${zone.top}%`,
                          width: `${zone.width}%`,
                          height: `${zone.height}%`,
                          backgroundColor: zone.bg_color || "#4f46e5",
                          border: "0.5px solid rgba(255,255,255,0.15)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 group-hover:text-blue-700 truncate">
                      {tmpl.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[75vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">Select Media</h3>
              <button
                onClick={() => setShowMediaPicker(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {mediaLibrary.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No media files uploaded yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {mediaLibrary.map((media) => (
                    <div
                      key={media.id}
                      onClick={() => {
                        updateSelectedZone("content_id", media.id);
                        setShowMediaPicker(false);
                      }}
                      className="group cursor-pointer bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-blue-500 hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
                        {media.file_type === "image" ? (
                          <img
                            src={media.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <Film className="w-8 h-8 opacity-40 mb-1" />
                            <span className="text-[9px] uppercase tracking-wide">Video</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center">
                          <span className="bg-white/90 text-blue-600 text-xs px-2.5 py-1 rounded-full font-bold shadow opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all">
                            Choose File
                          </span>
                        </div>
                      </div>
                      <div className="p-2.5 flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {media.original_filename || media.filename}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Assign Player Modal */}
      {showPlayerAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Assign Layout</h3>
                <p className="text-xs text-gray-500 mt-0.5">Choose a signage screen player</p>
              </div>
              <button
                onClick={() => setShowPlayerAssign(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-2 max-h-[50vh] overflow-y-auto">
              {players.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Monitor className="w-10 h-10 opacity-30 mx-auto mb-2" />
                  <p>No signage players paired.</p>
                </div>
              ) : (
                players.map((player) => (
                  <button
                    key={player.player_id}
                    onClick={() => handleAssignLayoutToPlayer(player.player_id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition text-left"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {player.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {player.location || "No location configured"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          player.status === "online" ? "bg-green-500 animate-pulse" : "bg-gray-300"
                        }`}
                      />
                      <span className="text-[10px] text-gray-400 uppercase font-bold">
                        {player.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => setShowPlayerAssign(false)}
                className="w-full py-2.5 text-sm text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public Render Preview Frame */}
      {previewingId && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-slate-950 text-white select-none">
          <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">
                {previewingId === "local" ? layoutName : layouts.find((l) => l.id === previewingId)?.name} (Preview)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Showing live broadcast feed simulation</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const enriched = layoutZones.map((z) => {
                    const zoneCopy = { ...z };
                    if (zoneCopy.content_type === "playlist" && zoneCopy.content_id) {
                      const p = playlists.find((x) => x.id === zoneCopy.content_id);
                      if (p) {
                        zoneCopy.playlist = { id: p.id, name: p.name, items: p.items };
                      }
                    } else if (zoneCopy.content_type === "media" && zoneCopy.content_id) {
                      const m = mediaLibrary.find((x) => x.id === zoneCopy.content_id);
                      if (m) {
                        zoneCopy.media = {
                          id: m.id,
                          filename: m.filename,
                          original_filename: m.original_filename,
                          file_type: m.file_type,
                          url: m.url
                        };
                      }
                    }
                    return zoneCopy;
                  });
                  sessionStorage.setItem("smp_preview_temp", JSON.stringify(enriched));
                  window.open(`/public/layouts/preview_local`, "_blank");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow transition"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                Fullscreen Window
              </button>
              <button
                onClick={() => setPreviewingId(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* View Container */}
          <div className="flex-1 bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-5xl aspect-video border border-slate-700 rounded-xl overflow-hidden relative shadow-2xl">
              {/* iframe rendering the live layout renderer page */}
              <iframe
                src={
                  previewingId === "local"
                    ? (() => {
                        const enriched = layoutZones.map((z) => {
                          const zoneCopy = { ...z };
                          if (zoneCopy.content_type === "playlist" && zoneCopy.content_id) {
                            const p = playlists.find((x) => x.id === zoneCopy.content_id);
                            if (p) {
                              zoneCopy.playlist = { id: p.id, name: p.name, items: p.items };
                            }
                          } else if (zoneCopy.content_type === "media" && zoneCopy.content_id) {
                            const m = mediaLibrary.find((x) => x.id === zoneCopy.content_id);
                            if (m) {
                              zoneCopy.media = {
                                id: m.id,
                                filename: m.filename,
                                original_filename: m.original_filename,
                                file_type: m.file_type,
                                url: m.url
                              };
                            }
                          }
                          return zoneCopy;
                        });
                        sessionStorage.setItem("smp_preview_temp", JSON.stringify(enriched));
                        return "/public/layouts/preview_local";
                      })()
                    : `/public/layouts/${previewingId}`
                }
                title="Signage Feed Preview"
                className="w-full h-full border-none pointer-events-none select-none bg-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layouts;
