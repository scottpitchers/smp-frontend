import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5002";

export default function PlaylistPlayer() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fade, setFade] = useState(true);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/playlists/${id}`);
        if (!res.ok) throw new Error("Playlist not found");
        const data = await res.json();
        setItems(data.items || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const parseDuration = (d) => {
    if (!d) return 10;
    const s = String(d).trim();
    if (s.endsWith("s")) return parseInt(s) || 10;
    if (s.endsWith("m")) return (parseInt(s) || 1) * 60;
    return parseInt(s) || 10;
  };

  const advance = () => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % (items.length || 1));
      setFade(true);
    }, 400);
  };

  useEffect(() => {
    if (!items.length) return;
    clearTimeout(timerRef.current);
    const item = items[currentIndex];
    const type = (item?.type || item?.media_type || "").toLowerCase();
    if (type !== "video") {
      const dur = parseDuration(item?.duration) * 1000;
      timerRef.current = setTimeout(advance, dur);
    }
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, items]);

  if (loading) {
    return (
      <div style={{
        width: "100vw", height: "100vh", background: "#000",
        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.5rem"
      }}>
        Loading…
      </div>
    );
  }

  if (error || !items.length) {
    return (
      <div style={{
        width: "100vw", height: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontFamily: "sans-serif", textAlign: "center", flexDirection: "column"
      }}>
        <h1 style={{ fontSize: "3rem" }}>🎬 SMP</h1>
        <p style={{ fontSize: "1.5rem", opacity: 0.8 }}>No content available</p>
      </div>
    );
  }

  const item = items[currentIndex];
  const type = (item?.type || item?.media_type || "").toLowerCase();
  const url = item?.url || "";

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#000", overflow: "hidden", position: "relative" }}>
      <div style={{
        width: "100%", height: "100%",
        opacity: fade ? 1 : 0,
        transition: "opacity 0.4s ease",
        position: "absolute", top: 0, left: 0
      }}>
        {type === "video" ? (
          <video
            ref={videoRef}
            key={url}
            src={url}
            autoPlay
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onEnded={advance}
          />
        ) : type === "image" ? (
          <img
            src={url}
            alt={item?.name || "slide"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <iframe
            src={url}
            title={item?.name || "content"}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        )}
      </div>
    </div>
  );
}
