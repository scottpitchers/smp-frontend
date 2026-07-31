import React, { useEffect, useState } from "react";

export default function ScreenOff() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = time.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "#000",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      color: "rgba(255,255,255,0.15)",
      userSelect: "none"
    }}>
      <div style={{ fontSize: "8vw", fontWeight: 200, letterSpacing: "0.05em" }}>
        {fmt}
      </div>
      <div style={{ fontSize: "2vw", marginTop: "1vw", fontWeight: 300, letterSpacing: "0.1em" }}>
        {date}
      </div>
      <div style={{ marginTop: "4vw", fontSize: "1.2vw", opacity: 0.4, letterSpacing: "0.2em", textTransform: "uppercase" }}>
        Display scheduled off
      </div>
    </div>
  );
}
