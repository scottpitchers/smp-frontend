import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  UploadCloud,
  Film,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  X,
  RotateCcw,
  Loader2,
  ChevronDown,
} from "lucide-react";
import UploadContext, { SUPPORTED_UPLOAD_TYPES } from "./useUploads";

const API_URL =
  import.meta.env.VITE_API_URL || "https://smp-api-i5f5.onrender.com";

export const UploadProvider = ({ children }) => {
  const [uploads, setUploads] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const uploadsRef = useRef([]);
  const timersRef = useRef({});

  useEffect(() => {
    uploadsRef.current = uploads;
  }, [uploads]);

  useEffect(() => {
    const timers = timersRef.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  const updateUpload = useCallback((id, patch) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    );
  }, []);

  const sendFile = useCallback(
    (entry) => {
      const token = localStorage.getItem("smp_token");
      const formData = new FormData();
      formData.append("file", entry.file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_URL}/api/admin/media/upload`, true);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          updateUpload(entry.id, {
            progress: Math.round((event.loaded / event.total) * 100),
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          updateUpload(entry.id, { status: "success", progress: 100 });
          timersRef.current[entry.id] = setTimeout(() => {
            setUploads((prev) =>
              prev.filter(
                (u) => !(u.id === entry.id && u.status === "success"),
              ),
            );
          }, 4000);
        } else {
          updateUpload(entry.id, { status: "error" });
        }
      };

      xhr.onerror = () => {
        updateUpload(entry.id, { status: "error" });
      };

      xhr.send(formData);
    },
    [updateUpload],
  );

  const startUploads = useCallback(
    (files) => {
      const arr = Array.from(files || []);
      const validFiles = arr.filter((f) =>
        SUPPORTED_UPLOAD_TYPES.includes(f.type),
      );
      const entries = validFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        progress: 0,
        status: "uploading", // 'uploading' | 'success' | 'error'
      }));

      if (entries.length > 0) {
        setUploads((prev) => [...prev, ...entries]);
        setExpanded(true);
        entries.forEach(sendFile);
      }

      return { started: entries.length, rejected: arr.length - validFiles.length };
    },
    [sendFile],
  );

  const retryUpload = useCallback(
    (id) => {
      const entry = uploadsRef.current.find((u) => u.id === id);
      if (!entry) return;
      clearTimeout(timersRef.current[id]);
      updateUpload(id, { status: "uploading", progress: 0 });
      sendFile(entry);
    },
    [sendFile, updateUpload],
  );

  const dismissUpload = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  const clearFinished = useCallback(() => {
    setUploads((prev) => prev.filter((u) => u.status === "uploading"));
  }, []);

  return (
    <UploadContext.Provider
      value={{ uploads, startUploads, retryUpload, dismissUpload, clearFinished }}
    >
      {children}
      <UploadBubble
        uploads={uploads}
        expanded={expanded}
        setExpanded={setExpanded}
        onRetry={retryUpload}
        onDismiss={dismissUpload}
        onClearFinished={clearFinished}
      />
    </UploadContext.Provider>
  );
};

const UploadBubble = ({
  uploads,
  expanded,
  setExpanded,
  onRetry,
  onDismiss,
  onClearFinished,
}) => {
  if (uploads.length === 0) return null;

  const active = uploads.filter((u) => u.status === "uploading");
  const failed = uploads.filter((u) => u.status === "error");
  const succeeded = uploads.filter((u) => u.status === "success");

  const overallPct =
    active.length > 0
      ? Math.round(
          active.reduce((acc, u) => acc + u.progress, 0) / active.length,
        )
      : 100;

  let bubbleState;
  let tooltip;
  if (active.length > 0) {
    bubbleState = (
      <>
        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
        <span className="text-sm font-bold text-gray-800 tabular-nums">
          {overallPct}%
        </span>
      </>
    );
    tooltip = `Uploading ${uploads.length} file${uploads.length > 1 ? "s" : ""} — ${overallPct}% overall`;
  } else if (failed.length > 0) {
    bubbleState = (
      <>
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span className="text-sm font-bold text-red-600">
          {failed.length} failed
        </span>
      </>
    );
    tooltip = `${failed.length} upload${failed.length > 1 ? "s" : ""} failed`;
  } else {
    bubbleState = (
      <>
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-sm font-bold text-green-600">Complete</span>
      </>
    );
    tooltip = `${succeeded.length} upload${succeeded.length > 1 ? "s" : ""} completed`;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[70] group">
      <div
        className={`mb-2 w-80 max-w-[calc(100vw-3rem)] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden ${
          expanded ? "block" : "hidden group-hover:block"
        }`}
      >
        <div className="px-4 py-2.5 flex items-center justify-between bg-gray-50 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            Uploads ({uploads.length})
          </span>
          <div className="flex items-center gap-1">
            {(failed.length > 0 || succeeded.length > 0) && (
              <button
                onClick={onClearFinished}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-1.5 py-0.5 rounded hover:bg-blue-50 transition cursor-pointer"
              >
                Clear finished
              </button>
            )}
            <button
              onClick={() => setExpanded(false)}
              className="p-1 rounded hover:bg-gray-200/70 text-gray-400 transition cursor-pointer"
              title="Collapse"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto p-1.5 space-y-1">
          {uploads.map((u) => (
            <div
              key={u.id}
              className={`rounded-lg border p-2.5 ${
                u.status === "error"
                  ? "bg-red-50 border-red-100"
                  : u.status === "success"
                    ? "bg-green-50/60 border-green-100"
                    : "bg-white border-gray-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-blue-100 flex items-center justify-center shrink-0">
                  {u.type?.startsWith("video") ? (
                    <Film className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                  )}
                </div>
                <p className="flex-1 min-w-0 text-xs font-semibold text-gray-800 truncate">
                  {u.name}
                </p>
                {u.status === "uploading" && (
                  <span className="shrink-0 text-[11px] font-bold text-gray-500 tabular-nums">
                    {u.progress}%
                  </span>
                )}
                {u.status === "success" && (
                  <CheckCircle className="w-4 h-4 shrink-0 text-green-500" />
                )}
                {u.status === "error" && (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                )}
                <button
                  onClick={() => onDismiss(u.id)}
                  className="shrink-0 p-0.5 rounded text-gray-300 hover:text-red-500 hover:bg-white transition cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {u.status === "uploading" && (
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 bg-blue-600 transition-all duration-300"
                    style={{ width: `${u.progress}%` }}
                  ></div>
                </div>
              )}
              {u.status === "error" && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-red-500 font-medium">
                    Upload failed
                  </span>
                  <button
                    onClick={() => onRetry(u.id)}
                    className="flex items-center gap-1 text-[11px] font-bold text-red-600 hover:text-red-700 px-2 py-0.5 rounded hover:bg-red-100 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Retry
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        title={tooltip}
        className={`ml-auto flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl border transition cursor-pointer ${
          failed.length > 0 && active.length === 0
            ? "bg-white border-red-200 hover:border-red-300"
            : "bg-white border-gray-200 hover:border-blue-300"
        }`}
      >
        {bubbleState}
        {active.length > 1 && (
          <span className="text-[11px] font-bold text-gray-400">
            ({active.length})
          </span>
        )}
        {!expanded && <UploadCloud className="w-3.5 h-3.5 text-gray-400" />}
      </button>
    </div>
  );
};
