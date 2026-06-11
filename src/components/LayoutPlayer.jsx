import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://smp-api-i5f5.onrender.com";

const PlaylistZonePlayer = ({ playlist }) => {
  const items = playlist?.items || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;

    const currentItem = items[currentIndex];
    if (!currentItem) return;

    const isVideo = currentItem.type?.includes("video");

    if (!isVideo) {
      const duration = currentItem.duration > 0 ? currentItem.duration : 20;
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }, duration * 1000);
      return () => clearTimeout(timer);
    } else {
      if (currentItem.duration > 0) {
        const timer = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % items.length);
        }, currentItem.duration * 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, items]);

  if (items.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500 bg-slate-800">
        Empty Playlist
      </div>
    );
  }

  const currentItem = items[currentIndex];
  if (!currentItem) return null;

  const isVideo = currentItem.type?.includes("video");

  if (isVideo) {
    return (
      <video
        key={currentItem.id || currentItem.media_id}
        src={currentItem.url}
        autoPlay
        muted
        playsInline
        onEnded={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
        onError={() => {
          // Fallback if video fails to play
          const timer = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
          }, 5000);
          return () => clearTimeout(timer);
        }}
        className="w-full h-full object-cover"
      />
    );
  }

  return (
    <img
      key={currentItem.id || currentItem.media_id}
      src={currentItem.url}
      alt={currentItem.name}
      className="w-full h-full object-cover animate-fade-in"
      onError={() => {
        const timer = setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 5000);
        return () => clearTimeout(timer);
      }}
    />
  );
};

const LayoutPlayer = () => {
  const { id } = useParams();
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLayout = async () => {
      if (id === "preview_local") {
        try {
          const tempZones = JSON.parse(sessionStorage.getItem("smp_preview_temp") || "[]");
          setLayout({
            id: "preview_local",
            name: "Unsaved Local Preview",
            zones: tempZones,
            aspect_ratio: "16:9",
          });
        } catch (err) {
          setError("Failed to load local preview data.");
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/public/layouts/${id}`);
        if (!res.ok) {
          throw new Error("Failed to load layout. Ensure layout ID is correct.");
        }
        const data = await res.json();
        setLayout(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
    
    // Optional: refresh layout every 5 minutes in case configuration changes (only for real saved layouts)
    let interval;
    if (id !== "preview_local") {
      interval = setInterval(fetchLayout, 300000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="font-semibold text-lg">Loading Screen Layout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-200 p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold mb-2">Signage Playback Error</h2>
        <p className="text-slate-400 max-w-md">{error}</p>
      </div>
    );
  }

  const zones = layout?.zones || [];

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative select-none">
      {zones.map((zone) => {
        const style = {
          position: "absolute",
          left: `${zone.left}%`,
          top: `${zone.top}%`,
          width: `${zone.width}%`,
          height: `${zone.height}%`,
          zIndex: zone.layer || 1,
          backgroundColor: zone.bg_color || "transparent",
        };

        return (
          <div key={zone.id} style={style} className="overflow-hidden">
            {zone.content_type === "media" && zone.media && (
              zone.media.file_type === "video" ? (
                <video
                  src={zone.media.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={zone.media.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )
            )}
            
            {zone.content_type === "playlist" && zone.playlist && (
              <PlaylistZonePlayer playlist={zone.playlist} />
            )}
            
            {zone.content_type === "color" && (
              <div className="w-full h-full" style={{ backgroundColor: zone.bg_color }} />
            )}
          </div>
        );
      })}
      
      {zones.length === 0 && (
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          Empty Layout Configuration
        </div>
      )}
    </div>
  );
};

export default LayoutPlayer;
