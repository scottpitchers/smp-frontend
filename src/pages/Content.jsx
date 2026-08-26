import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  FileVideo,
  Image as ImageIcon,
  UploadCloud,
  Film,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useUploads, SUPPORTED_UPLOAD_TYPES } from "../context/useUploads";

const API_URL =
  import.meta.env.VITE_API_URL || "https://smp-api-i5f5.onrender.com";

const formatBytes = (bytes, decimals = 2) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const REJECTED_MESSAGE =
  "Some files were rejected. Only JPG, PNG, GIF, WebP, SVG, MP4, WebM, and MOV are supported.";

const Content = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);
  const prevActiveUploadsRef = useRef(0);

  // Uploads are handled globally by UploadContext (persistent across pages)
  const { startUploads, uploads } = useUploads();

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem("smp_token");
      const res = await fetch(`${API_URL}/api/admin/media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.media || [];
        setContent(
          items.map((m) => ({
            ...m,
            name: m.original_filename || m.filename || "Unknown",
            type: m.mime_type || m.file_type || "unknown",
            size: m.size_bytes || 0,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Refresh list when all in-flight uploads finish
  useEffect(() => {
    const activeCount = uploads.filter((u) => u.status === "uploading").length;
    if (
      prevActiveUploadsRef.current > 0 &&
      activeCount === 0 &&
      uploads.some((u) => u.status === "success")
    ) {
      fetchContent();
    }
    prevActiveUploadsRef.current = activeCount;
  }, [uploads]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    e.target.value = "";
    const { rejected } = startUploads(files);
    setUploadError(rejected > 0 ? REJECTED_MESSAGE : null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
          <p className="text-gray-500 mt-1">
            All images and videos available across your screens.
          </p>
        </div>
        <input
          type="file"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={SUPPORTED_UPLOAD_TYPES.join(",")}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md font-medium cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Upload Content
        </button>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {uploadError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : content.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 border-dashed">
          <UploadCloud className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No content yet</h3>
          <p className="text-gray-500 mt-2">
            Click “Upload Content” to add your first image or video.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
            >
              <div className="h-40 bg-slate-900 flex items-center justify-center overflow-hidden">
                {item.type.startsWith("video") ? (
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <FileVideo className="w-14 h-14 opacity-70" />
                    <span className="text-[10px] uppercase tracking-wide mt-1">
                      Video
                    </span>
                  </div>
                ) : item.url ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-14 h-14 text-white opacity-60" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-base mb-2 truncate" title={item.name}>
                  {item.name}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between gap-2">
                    <span>Type:</span>
                    <span className="font-medium truncate">{item.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Size:</span>
                    <span className="font-medium">{formatBytes(item.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Uploaded:</span>
                    <span className="font-medium">
                      {new Date(item.created_at || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Content;
