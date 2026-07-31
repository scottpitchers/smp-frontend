import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Calendar, Plus, X, ChevronLeft, ChevronRight, Clock, Monitor,
  List, Grid, Zap, Trash2, Edit2, Save, AlertCircle, CheckCircle,
  Tv, Settings, Power
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5002";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const PRIORITY_CONFIG = {
  1: { label: "Low", color: "#64748b", bg: "rgba(100,116,139,0.15)" },
  2: { label: "Normal", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  3: { label: "Medium", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  4: { label: "High", color: "#f97316", bg: "rgba(249,115,22,0.15)" },
  5: { label: "Critical", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
};

const CONTENT_COLORS = {
  layout: { color: "#10b981", bg: "rgba(16,185,129,0.2)", border: "#10b981" },
  playlist: { color: "#3b82f6", bg: "rgba(59,130,246,0.2)", border: "#3b82f6" },
  media: { color: "#8b5cf6", bg: "rgba(139,92,246,0.2)", border: "#8b5cf6" },
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("smp_token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
};

const todayStr = () => new Date().toISOString().split("T")[0];
const padTime = (h, m = 0) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

// ─── Default form values ──────────────────────────────────────────────────────
const defaultForm = () => ({
  name: "",
  content_type: "playlist",
  content_id: "",
  start_date: todayStr(),
  end_date: todayStr(),
  start_time: "08:00",
  end_time: "17:00",
  repeat_type: "once",
  days_of_week: [],
  end_repeat_date: "",
  priority: 2,
  assigned_players: [],
});

export default function Schedules() {
  const [view, setView] = useState("week"); // week | day | month | power
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [layouts, setLayouts] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterPlayer, setFilterPlayer] = useState("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Power settings state
  const [powerForm, setPowerForm] = useState({});
  const [savingPower, setSavingPower] = useState({});

  // Drag-to-create state
  const [dragStart, setDragStart] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Data loading ──────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, pRes, plRes, layRes, medRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/schedules`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/admin/players`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/admin/playlists`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/admin/layouts`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/api/admin/media`, { headers: getAuthHeaders() }),
      ]);
      const [sData, pData, plData, layData, medData] = await Promise.all([
        sRes.ok ? sRes.json() : { schedules: [] },
        pRes.ok ? pRes.json() : { players: [] },
        plRes.ok ? plRes.json() : { playlists: [] },
        layRes.ok ? layRes.json() : { layouts: [] },
        medRes.ok ? medRes.json() : { media: [] },
      ]);
      setSchedules(sData.schedules || []);
      const pl = pData.players || [];
      setPlayers(pl);
      const pf = {};
      pl.forEach(p => {
        pf[p.player_id] = {
          weekday_on: p.weekday_on || "08:00",
          weekday_off: p.weekday_off || "22:00",
          weekend_on: p.weekend_on || "09:00",
          weekend_off: p.weekend_off || "20:00",
          power_cec: p.power_cec !== undefined ? p.power_cec : true,
          power_override: p.power_override || "none",
          default_content_type: p.default_content_type || "none",
          default_content_id: p.default_content_id || "",
        };
      });
      setPowerForm(pf);
      setPlaylists(plData.playlists || []);
      setLayouts(layData.layouts || []);
      setMediaItems(medData.media || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ─── Navigation ────────────────────────────────────────────────────────────
  const navigate = (dir) => {
    const d = new Date(currentDate);
    if (view === "day") d.setDate(d.getDate() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else if (view === "month") d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  // ─── CRUD ──────────────────────────────────────────────────────────────────
  const openCreate = (defaults = {}) => {
    setEditingId(null);
    setForm({ ...defaultForm(), ...defaults });
    setShowModal(true);
  };

  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      content_type: s.content_type,
      content_id: s.content_id,
      start_date: s.start_date,
      end_date: s.end_date,
      start_time: s.start_time,
      end_time: s.end_time,
      repeat_type: s.repeat_type,
      days_of_week: s.days_of_week || [],
      end_repeat_date: s.end_repeat_date || "",
      priority: s.priority,
      assigned_players: s.assigned_players || [],
    });
    setShowModal(true);
  };

  const saveSchedule = async () => {
    if (!form.name.trim() || !form.content_id) {
      showToast("Please fill name and select content", "error");
      return;
    }
    setSaving(true);
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `${API_BASE}/api/admin/schedules/${editingId}`
        : `${API_BASE}/api/admin/schedules`;
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Save failed");
      showToast(editingId ? "Schedule updated" : "Schedule created");
      setShowModal(false);
      loadAll();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteSchedule = async (id) => {
    if (!confirm("Delete this schedule?")) return;
    try {
      await fetch(`${API_BASE}/api/admin/schedules/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      showToast("Schedule deleted");
      loadAll();
    } catch {
      showToast("Delete failed", "error");
    }
  };

  const savePowerSettings = async (playerId) => {
    setSavingPower(p => ({ ...p, [playerId]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/admin/players/${playerId}/power-settings`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(powerForm[playerId]),
      });
      if (!res.ok) throw new Error("Save failed");
      showToast("Power settings saved");
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSavingPower(p => ({ ...p, [playerId]: false }));
    }
  };

  // ─── Calendar helpers ──────────────────────────────────────────────────────
  const getWeekStart = (d) => {
    const s = new Date(d);
    s.setDate(s.getDate() - s.getDay());
    return s;
  };

  const scheduleOccursOnDate = (s, dateStr) => {
    if (dateStr < s.start_date) return false;
    const repeat = s.repeat_type;
    if (repeat === "once") return dateStr >= s.start_date && dateStr <= s.end_date;
    if (s.end_repeat_date && dateStr > s.end_repeat_date) return false;
    if (repeat === "daily") return true;
    if (repeat === "weekly") {
      const dow = new Date(dateStr + "T12:00:00").getDay();
      return (s.days_of_week || []).includes(dow);
    }
    if (repeat === "monthly") {
      return s.start_date.split("-")[2] === dateStr.split("-")[2];
    }
    return false;
  };

  const getSchedulesForDate = (dateStr) => {
    return schedules.filter(s => {
      if (filterPlayer !== "all" && !s.assigned_players?.includes(filterPlayer)) return false;
      return scheduleOccursOnDate(s, dateStr);
    });
  };

  const timeToMinutes = (t) => {
    if (!t) return 0;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };

  // ─── Week view ────────────────────────────────────────────────────────────
  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const CELL_HEIGHT = 48; // px per hour

  // ─── Month helpers ─────────────────────────────────────────────────────────
  const getMonthGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ date: d, dateStr });
    }
    return cells;
  };

  // ─── Drag to create ────────────────────────────────────────────────────────
  const handleCellMouseDown = (dateStr, hour) => {
    setDragStart({ dateStr, hour });
  };

  const handleCellMouseUp = (dateStr, hour) => {
    if (!dragStart) return;
    const startHour = Math.min(dragStart.hour, hour);
    const endHour = Math.max(dragStart.hour, hour) + 1;
    setDragStart(null);
    openCreate({
      start_date: dragStart.dateStr,
      end_date: dateStr,
      start_time: padTime(startHour),
      end_time: padTime(Math.min(endHour, 24)),
    });
  };

  const contentLabel = (s) => {
    const type = s.content_type;
    if (type === "playlist") {
      const p = playlists.find(x => x.id === s.content_id);
      return p ? `Playlist: ${p.name}` : "Playlist";
    }
    if (type === "layout") {
      const l = layouts.find(x => x.id === s.content_id);
      return l ? `Layout: ${l.name}` : "Layout";
    }
    if (type === "media") {
      const m = mediaItems.find(x => x.id === s.content_id);
      return m ? `Media: ${m.original_filename || m.name}` : "Media";
    }
    return type;
  };

  const renderScheduleBlock = (s, style = {}) => {
    const cc = CONTENT_COLORS[s.content_type] || CONTENT_COLORS.playlist;
    const pc = PRIORITY_CONFIG[s.priority] || PRIORITY_CONFIG[1];
    return (
      <div
        key={s.id}
        onClick={(e) => { e.stopPropagation(); openEdit(s); }}
        style={{
          background: cc.bg,
          borderLeft: `3px solid ${cc.border}`,
          borderRadius: "6px",
          padding: "4px 8px",
          cursor: "pointer",
          overflow: "hidden",
          transition: "all 0.15s",
          ...style,
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
        onMouseLeave={e => e.currentTarget.style.opacity = "1"}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 4 }}>
          <span style={{ fontWeight: 600, fontSize: "0.7rem", color: cc.color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {s.name}
          </span>
          <span style={{ fontSize: "0.6rem", background: pc.bg, color: pc.color, padding: "1px 5px", borderRadius: 4, whiteSpace: "nowrap", flexShrink: 0 }}>
            P{s.priority}
          </span>
        </div>
        <div style={{ fontSize: "0.65rem", color: "var(--text-secondary)", marginTop: 2 }}>
          {s.start_time}–{s.end_time}
        </div>
      </div>
    );
  };

  // ─── Week View Render ─────────────────────────────────────────────────────
  const renderWeekView = () => (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Time gutter */}
      <div style={{ width: 52, flexShrink: 0, borderRight: "1px solid var(--border)" }}>
        <div style={{ height: 48 }} />
        {HOURS.map(h => (
          <div key={h} style={{ height: CELL_HEIGHT, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 8, paddingTop: 4 }}>
            <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>{padTime(h)}</span>
          </div>
        ))}
      </div>
      {/* Day columns */}
      <div style={{ flex: 1, overflowX: "auto", overflowY: "hidden", display: "flex" }}>
        {weekDays.map((day, di) => {
          const dateStr = day.toISOString().split("T")[0];
          const isToday = dateStr === todayStr();
          const daySchedules = getSchedulesForDate(dateStr);
          return (
            <div key={di} style={{ flex: "1 0 120px", minWidth: 120, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
              {/* Day header */}
              <div style={{
                height: 48, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                borderBottom: "1px solid var(--border)",
                background: isToday ? "rgba(99,102,241,0.08)" : "transparent",
                position: "sticky", top: 0, zIndex: 2,
              }}>
                <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {DAYS[day.getDay()]}
                </span>
                <span style={{
                  fontSize: "1.1rem", fontWeight: 700,
                  color: isToday ? "#6366f1" : "var(--text-primary)",
                  width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "50%",
                  background: isToday ? "rgba(99,102,241,0.15)" : "transparent",
                }}>
                  {day.getDate()}
                </span>
              </div>
              {/* Hour cells */}
              <div style={{ position: "relative", overflowY: "auto", flex: 1 }}>
                {HOURS.map(h => (
                  <div
                    key={h}
                    onMouseDown={() => handleCellMouseDown(dateStr, h)}
                    onMouseUp={() => handleCellMouseUp(dateStr, h)}
                    style={{
                      height: CELL_HEIGHT, borderBottom: "1px solid var(--border)",
                      cursor: "crosshair", position: "relative",
                      background: h % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                    }}
                  />
                ))}
                {/* Overlay blocks */}
                {daySchedules.map(s => {
                  const startMin = timeToMinutes(s.start_time);
                  const endMin = timeToMinutes(s.end_time);
                  const top = (startMin / 60) * CELL_HEIGHT;
                  const height = Math.max(((endMin - startMin) / 60) * CELL_HEIGHT, 20);
                  return renderScheduleBlock(s, {
                    position: "absolute", top, left: 2, right: 2, height,
                    zIndex: 1, pointerEvents: "auto",
                  });
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─── Day View Render ──────────────────────────────────────────────────────
  const renderDayView = () => {
    const dateStr = currentDate.toISOString().split("T")[0];
    const daySchedules = getSchedulesForDate(dateStr);
    return (
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ width: 52, flexShrink: 0, borderRight: "1px solid var(--border)" }}>
          <div style={{ height: 20 }} />
          {HOURS.map(h => (
            <div key={h} style={{ height: CELL_HEIGHT * 2, display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 8, paddingTop: 4 }}>
              <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)" }}>{padTime(h)}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
          {HOURS.map(h => (
            <div key={h}
              onMouseDown={() => handleCellMouseDown(dateStr, h)}
              onMouseUp={() => handleCellMouseUp(dateStr, h)}
              style={{ height: CELL_HEIGHT * 2, borderBottom: "1px solid var(--border)", cursor: "crosshair", background: h % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)" }}
            />
          ))}
          {daySchedules.map(s => {
            const startMin = timeToMinutes(s.start_time);
            const endMin = timeToMinutes(s.end_time);
            const top = (startMin / 60) * CELL_HEIGHT * 2;
            const height = Math.max(((endMin - startMin) / 60) * CELL_HEIGHT * 2, 28);
            return renderScheduleBlock(s, {
              position: "absolute", top, left: 8, right: 8, height, zIndex: 1,
            });
          })}
        </div>
      </div>
    );
  };

  // ─── Month View Render ────────────────────────────────────────────────────
  const renderMonthView = () => {
    const grid = getMonthGrid();
    return (
      <div style={{ flex: 1, overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: "1px solid var(--border)" }}>
          {DAYS.map(d => (
            <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {d}
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {grid.map((cell, i) => {
            if (!cell) return <div key={`e${i}`} style={{ minHeight: 100, borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.02)" }} />;
            const isToday = cell.dateStr === todayStr();
            const daySched = getSchedulesForDate(cell.dateStr);
            return (
              <div
                key={cell.dateStr}
                onDoubleClick={() => openCreate({ start_date: cell.dateStr, end_date: cell.dateStr })}
                style={{
                  minHeight: 100, padding: 6,
                  borderRight: "1px solid var(--border)",
                  borderBottom: "1px solid var(--border)",
                  background: isToday ? "rgba(99,102,241,0.04)" : "transparent",
                  cursor: "default",
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: isToday ? "#6366f1" : "transparent",
                  color: isToday ? "#fff" : "var(--text-primary)",
                  fontWeight: isToday ? 700 : 500, fontSize: "0.85rem", marginBottom: 4,
                }}>
                  {cell.date}
                </div>
                {daySched.slice(0, 3).map(s => {
                  const cc = CONTENT_COLORS[s.content_type] || CONTENT_COLORS.playlist;
                  return (
                    <div key={s.id} onClick={() => openEdit(s)}
                      style={{ background: cc.bg, borderLeft: `2px solid ${cc.border}`, borderRadius: 4, padding: "2px 6px", marginBottom: 2, fontSize: "0.65rem", color: cc.color, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.name}
                    </div>
                  );
                })}
                {daySched.length > 3 && (
                  <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>+{daySched.length - 3} more</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Power Settings View ──────────────────────────────────────────────────
  const renderPowerView = () => {
    const contentOptions = (type) => {
      if (type === "playlist") return playlists;
      if (type === "layout") return layouts;
      if (type === "media") return mediaItems.map(m => ({ ...m, name: m.original_filename || m.name }));
      return [];
    };

    return (
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {players.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "var(--text-secondary)" }}>
            <Monitor size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p>No players configured.</p>
          </div>
        )}
        {players.map(player => {
          const pf = powerForm[player.player_id] || {};
          const setPF = (key, val) => setPowerForm(prev => ({
            ...prev,
            [player.player_id]: { ...prev[player.player_id], [key]: val }
          }));
          const defOptions = contentOptions(pf.default_content_type);
          const isSaving = savingPower[player.player_id];
          return (
            <div key={player.player_id} style={{
              background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 16,
              padding: 24, marginBottom: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: player.status === "online" ? "rgba(16,185,129,0.15)" : "rgba(107,114,128,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Tv size={20} color={player.status === "online" ? "#10b981" : "#9ca3af"} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem" }}>{player.name}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{player.location || "No location"}</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%", display: "inline-block",
                    background: player.status === "online" ? "#10b981" : "#6b7280"
                  }} />
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{player.status}</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
                {/* Weekday hours */}
                <div style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.8rem", marginBottom: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Weekday Hours</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>On</label>
                      <input type="time" value={pf.weekday_on || "08:00"} onChange={e => setPF("weekday_on", e.target.value)}
                        style={{ width: "100%", marginTop: 4, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }} />
                    </div>
                    <span style={{ color: "var(--text-secondary)", marginTop: 16 }}>–</span>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Off</label>
                      <input type="time" value={pf.weekday_off || "22:00"} onChange={e => setPF("weekday_off", e.target.value)}
                        style={{ width: "100%", marginTop: 4, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }} />
                    </div>
                  </div>
                </div>
                {/* Weekend hours */}
                <div style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.8rem", marginBottom: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Weekend Hours</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>On</label>
                      <input type="time" value={pf.weekend_on || "09:00"} onChange={e => setPF("weekend_on", e.target.value)}
                        style={{ width: "100%", marginTop: 4, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }} />
                    </div>
                    <span style={{ color: "var(--text-secondary)", marginTop: 16 }}>–</span>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Off</label>
                      <input type="time" value={pf.weekend_off || "20:00"} onChange={e => setPF("weekend_off", e.target.value)}
                        style={{ width: "100%", marginTop: 4, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }} />
                    </div>
                  </div>
                </div>
                {/* Controls */}
                <div style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.8rem", marginBottom: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Controls</div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Override</label>
                    <select value={pf.power_override || "none"} onChange={e => setPF("power_override", e.target.value)}
                      style={{ width: "100%", marginTop: 4, padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}>
                      <option value="none">Scheduled</option>
                      <option value="always_on">Always On</option>
                      <option value="always_off">Always Off</option>
                    </select>
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.8rem" }}>
                    <input type="checkbox" checked={pf.power_cec !== false} onChange={e => setPF("power_cec", e.target.checked)}
                      style={{ width: 16, height: 16, accentColor: "#6366f1" }} />
                    HDMI CEC Control
                  </label>
                </div>
              </div>

              {/* Default content */}
              <div style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontWeight: 600, fontSize: "0.8rem", marginBottom: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Default Content (when no schedule is active)</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Content Type</label>
                    <select value={pf.default_content_type || "none"} onChange={e => setPF("default_content_type", e.target.value)}
                      style={{ width: "100%", marginTop: 4, padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}>
                      <option value="none">None</option>
                      <option value="playlist">Playlist</option>
                      <option value="layout">Layout</option>
                      <option value="media">Media File</option>
                    </select>
                  </div>
                  {pf.default_content_type && pf.default_content_type !== "none" && (
                    <div style={{ flex: 2 }}>
                      <label style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>Select {pf.default_content_type}</label>
                      <select value={pf.default_content_id || ""} onChange={e => setPF("default_content_id", e.target.value)}
                        style={{ width: "100%", marginTop: 4, padding: "7px 10px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--card-bg)", color: "var(--text-primary)", fontSize: "0.85rem" }}>
                        <option value="">— select —</option>
                        {defOptions.map(o => (
                          <option key={o.id} value={o.id}>{o.name || o.original_filename}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => savePowerSettings(player.player_id)}
                disabled={isSaving}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
                  border: "none", borderRadius: 10, padding: "10px 20px",
                  cursor: isSaving ? "not-allowed" : "pointer", fontWeight: 600, fontSize: "0.85rem",
                  opacity: isSaving ? 0.7 : 1,
                }}
              >
                <Save size={15} /> {isSaving ? "Saving…" : "Save Settings"}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  // ─── Schedule List View ───────────────────────────────────────────────────
  const renderListView = () => (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {schedules.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-secondary)" }}>
          <Calendar size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
          <p style={{ fontSize: "1.1rem", marginBottom: 8 }}>No schedules yet</p>
          <p style={{ fontSize: "0.85rem" }}>Click <strong>+ New Schedule</strong> or drag on the calendar to get started.</p>
        </div>
      )}
      {schedules.map(s => {
        const cc = CONTENT_COLORS[s.content_type] || CONTENT_COLORS.playlist;
        const pc = PRIORITY_CONFIG[s.priority] || PRIORITY_CONFIG[1];
        return (
          <div key={s.id} style={{
            background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 14,
            padding: 18, marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 16,
            transition: "box-shadow 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: cc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Calendar size={20} color={cc.color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{s.name}</span>
                <span style={{ fontSize: "0.7rem", background: cc.bg, color: cc.color, padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                  {s.content_type}
                </span>
                <span style={{ fontSize: "0.7rem", background: pc.bg, color: pc.color, padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>
                  {pc.label}
                </span>
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 4 }}>
                📅 {s.start_date} → {s.end_date} &nbsp;|&nbsp; ⏱ {s.start_time}–{s.end_time}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                🔄 {s.repeat_type.charAt(0).toUpperCase() + s.repeat_type.slice(1)}
                {s.repeat_type === "weekly" && s.days_of_week?.length > 0 && ` (${s.days_of_week.map(d => DAYS[d]).join(", ")})`}
                &nbsp;|&nbsp; 🖥 {s.assigned_players?.length || 0} player{s.assigned_players?.length !== 1 ? "s" : ""}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>
                {contentLabel(s)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={() => openEdit(s)} style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1", border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                <Edit2 size={13} /> Edit
              </button>
              <button onClick={() => deleteSchedule(s.id)} style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "none", borderRadius: 8, padding: "7px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.8rem", fontWeight: 600 }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ─── Modal ────────────────────────────────────────────────────────────────
  const renderModal = () => {
    const contentOptions = () => {
      if (form.content_type === "playlist") return playlists;
      if (form.content_type === "layout") return layouts;
      if (form.content_type === "media") return mediaItems.map(m => ({ ...m, name: m.original_filename || m.name }));
      return [];
    };

    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(4px)", padding: 20,
      }}>
        <div style={{
          background: "var(--card-bg)", borderRadius: 20, width: "100%", maxWidth: 560,
          maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          border: "1px solid var(--border)",
        }}>
          {/* Header */}
          <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>
                {editingId ? "Edit Schedule" : "New Schedule"}
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Configure when and where content plays
              </p>
            </div>
            <button onClick={() => setShowModal(false)} style={{ background: "var(--bg-secondary)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: "var(--text-secondary)" }}>
              <X size={18} />
            </button>
          </div>
          <div style={{ padding: 24 }}>
            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Schedule Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Morning Content" style={inputStyle} />
            </div>

            {/* Content */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Content Type</label>
                <select value={form.content_type} onChange={e => setForm(f => ({ ...f, content_type: e.target.value, content_id: "" }))} style={inputStyle}>
                  <option value="playlist">Playlist</option>
                  <option value="layout">Layout</option>
                  <option value="media">Media File</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Select {form.content_type}</label>
                <select value={form.content_id} onChange={e => setForm(f => ({ ...f, content_id: e.target.value }))} style={inputStyle}>
                  <option value="">— select —</option>
                  {contentOptions().map(o => (
                    <option key={o.id} value={o.id}>{o.name || o.original_filename}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>End Date</label>
                <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            {/* Times */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Start Time</label>
                <input type="time" value={form.start_time} onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>End Time</label>
                <input type="time" value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} style={inputStyle} />
              </div>
            </div>

            {/* Repeat */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Repeat</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["once","daily","weekly","monthly"].map(rt => (
                  <button key={rt} onClick={() => setForm(f => ({ ...f, repeat_type: rt }))}
                    style={{
                      padding: "6px 14px", borderRadius: 8, border: `1px solid ${form.repeat_type === rt ? "#6366f1" : "var(--border)"}`,
                      background: form.repeat_type === rt ? "rgba(99,102,241,0.15)" : "var(--bg-secondary)",
                      color: form.repeat_type === rt ? "#6366f1" : "var(--text-secondary)",
                      cursor: "pointer", fontSize: "0.82rem", fontWeight: form.repeat_type === rt ? 600 : 400,
                      textTransform: "capitalize",
                    }}>
                    {rt}
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly days */}
            {form.repeat_type === "weekly" && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Days of Week</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DAYS.map((d, i) => {
                    const active = form.days_of_week.includes(i);
                    return (
                      <button key={i} onClick={() => setForm(f => ({
                        ...f,
                        days_of_week: active ? f.days_of_week.filter(x => x !== i) : [...f.days_of_week, i]
                      }))}
                        style={{
                          width: 38, height: 38, borderRadius: "50%", border: `1px solid ${active ? "#6366f1" : "var(--border)"}`,
                          background: active ? "rgba(99,102,241,0.2)" : "var(--bg-secondary)",
                          color: active ? "#6366f1" : "var(--text-secondary)",
                          cursor: "pointer", fontSize: "0.75rem", fontWeight: active ? 700 : 400,
                        }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* End repeat date */}
            {form.repeat_type !== "once" && (
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>End Repeat Date (optional)</label>
                <input type="date" value={form.end_repeat_date} onChange={e => setForm(f => ({ ...f, end_repeat_date: e.target.value }))} style={inputStyle} />
              </div>
            )}

            {/* Priority */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Priority</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(PRIORITY_CONFIG).map(([k, p]) => (
                  <button key={k} onClick={() => setForm(f => ({ ...f, priority: Number(k) }))}
                    style={{
                      padding: "6px 14px", borderRadius: 8,
                      border: `1px solid ${Number(form.priority) === Number(k) ? p.color : "var(--border)"}`,
                      background: Number(form.priority) === Number(k) ? p.bg : "var(--bg-secondary)",
                      color: Number(form.priority) === Number(k) ? p.color : "var(--text-secondary)",
                      cursor: "pointer", fontSize: "0.82rem", fontWeight: Number(form.priority) === Number(k) ? 700 : 400,
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Players */}
            <div style={{ marginBottom: 24 }}>
              <label style={labelStyle}>Assign to Players</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {players.length === 0 && <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>No players available</span>}
                {players.map(p => {
                  const active = form.assigned_players.includes(p.player_id);
                  return (
                    <button key={p.player_id} onClick={() => setForm(f => ({
                      ...f,
                      assigned_players: active
                        ? f.assigned_players.filter(x => x !== p.player_id)
                        : [...f.assigned_players, p.player_id]
                    }))}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "6px 12px", borderRadius: 10,
                        border: `1px solid ${active ? "#6366f1" : "var(--border)"}`,
                        background: active ? "rgba(99,102,241,0.15)" : "var(--bg-secondary)",
                        color: active ? "#6366f1" : "var(--text-primary)",
                        cursor: "pointer", fontSize: "0.82rem", fontWeight: active ? 600 : 400,
                      }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.status === "online" ? "#10b981" : "#9ca3af" }} />
                      {p.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600 }}>
                Cancel
              </button>
              <button onClick={saveSchedule} disabled={saving}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", cursor: saving ? "not-allowed" : "pointer", fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                <Save size={15} /> {saving ? "Saving…" : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── Input styles ──────────────────────────────────────────────────────────
  const labelStyle = {
    display: "block", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)",
    marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em"
  };
  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)",
    background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "0.9rem",
    boxSizing: "border-box", outline: "none",
  };

  // ─── Header label ──────────────────────────────────────────────────────────
  const headerLabel = () => {
    if (view === "month") return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (view === "day") return currentDate.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    if (view === "week") {
      const end = new Date(weekStart); end.setDate(end.getDate() + 6);
      return `${weekStart.toLocaleDateString([], { month: "short", day: "numeric" })} – ${end.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`;
    }
    return "";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16, color: "var(--text-secondary)" }}>
        <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p>Loading schedules…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "error" ? "#ef4444" : "#10b981",
          color: "#fff", padding: "12px 20px", borderRadius: 12, fontWeight: 600, fontSize: "0.9rem",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          animation: "slideIn 0.3s ease",
        }}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Content Schedules
          </h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {schedules.length} schedule{schedules.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <button onClick={() => openCreate()} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff",
          border: "none", borderRadius: 12, padding: "10px 20px",
          cursor: "pointer", fontWeight: 700, fontSize: "0.9rem",
          boxShadow: "0 4px 15px rgba(99,102,241,0.3)",
        }}>
          <Plus size={17} /> New Schedule
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {/* View tabs */}
        <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: 10, padding: 3, border: "1px solid var(--border)" }}>
          {[
            { id: "week", icon: <Grid size={14} />, label: "Week" },
            { id: "day", icon: <List size={14} />, label: "Day" },
            { id: "month", icon: <Calendar size={14} />, label: "Month" },
            { id: "list", icon: <List size={14} />, label: "List" },
            { id: "power", icon: <Power size={14} />, label: "Power" },
          ].map(v => (
            <button key={v.id} onClick={() => setView(v.id)}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 14px",
                borderRadius: 8, border: "none", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600,
                background: view === v.id ? "var(--card-bg)" : "transparent",
                color: view === v.id ? "#6366f1" : "var(--text-secondary)",
                boxShadow: view === v.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                transition: "all 0.15s",
              }}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>

        {/* Navigation (not for list/power) */}
        {!["list","power"].includes(view) && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => navigate(-1)} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setCurrentDate(new Date())} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600 }}>
                Today
              </button>
              <button onClick={() => navigate(1)} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>
                <ChevronRight size={16} />
              </button>
            </div>
            <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{headerLabel()}</span>
          </>
        )}

        {/* Player filter */}
        {!["power"].includes(view) && (
          <select value={filterPlayer} onChange={e => setFilterPlayer(e.target.value)}
            style={{ marginLeft: "auto", padding: "7px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg-secondary)", color: "var(--text-primary)", fontSize: "0.82rem", cursor: "pointer" }}>
            <option value="all">All Players</option>
            {players.map(p => <option key={p.player_id} value={p.player_id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {/* Legend */}
      {!["list","power"].includes(view) && (
        <div style={{ display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
          {Object.entries(CONTENT_COLORS).map(([type, c]) => (
            <div key={type} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c.bg, border: `2px solid ${c.border}` }} />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
            {view === "week" || view === "day" ? "Drag on calendar to create schedule" : "Double-click day to create schedule"}
          </div>
        </div>
      )}

      {/* Calendar area */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", padding: view === "list" || view === "power" ? 16 : 0 }}>
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
        {view === "month" && renderMonthView()}
        {view === "list" && renderListView()}
        {view === "power" && renderPowerView()}
      </div>

      {/* Modal */}
      {showModal && renderModal()}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
