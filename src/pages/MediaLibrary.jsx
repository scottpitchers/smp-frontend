import React, { useState, useEffect, useRef } from "react";
import {
  UploadCloud,
  X,
  File,
  Film,
  Image as ImageIcon,
  Trash2,
  Edit2,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Play,
  Maximize2
} from "lucide-react";
import { useUploads } from "../context/useUploads";

const API_URL = import.meta.env.VITE_API_URL || "https://smp-api-i5f5.onrender.com";

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const MediaLibrary = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  
  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); 
  const [sortBy, setSortBy] = useState("date_desc"); // "name_asc", "name_desc", "date_desc", "size_desc"

  // Uploads are handled globally by UploadContext (persistent across pages)
  const { startUploads, uploads } = useUploads();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const prevActiveUploadsRef = useRef(0);

  // Refresh list when all in-flight uploads finish
  useEffect(() => {
    const activeCount = uploads.filter((u) => u.status === "uploading").length;
    if (
      prevActiveUploadsRef.current > 0 &&
      activeCount === 0 &&
      uploads.some((u) => u.status === "success")
    ) {
      fetchMedia();
    }
    prevActiveUploadsRef.current = activeCount;
  }, [uploads]);

  // Modals
  const [previewMedia, setPreviewMedia] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [renameModal, setRenameModal] = useState(null);
  const [newName, setNewName] = useState("");

  // Fetch Media
  const fetchMedia = async () => {
    try {
      const token = localStorage.getItem("smp_token");
      const res = await fetch(`${API_URL}/api/admin/media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // The API returns an array directly based on the user's example
        const items = Array.isArray(data) ? data : (data.media || []);
        
        const mappedItems = items.map(m => ({
          ...m,
          name: m.original_filename || m.filename || "Unknown",
          type: m.mime_type || m.file_type || "unknown",
          size: m.size_bytes || 0,
        }));
        
        setMediaItems(mappedItems);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  // Upload Logic
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    e.target.value = "";
    processFiles(files);
  };

  const processFiles = (files) => {
    const { rejected } = startUploads(files);
    if (rejected > 0) {
      alert("Some files were rejected. Only JPG, PNG, GIF, WebP, SVG, MP4, WebM, and MOV are supported.");
    }
  };

  // Actions
  const openDeleteModal = (media) => setDeleteModal(media);
  const closeDeleteModal = () => setDeleteModal(null);

  const confirmDelete = async () => {
    if (!deleteModal) return;
    try {
      const token = localStorage.getItem("smp_token");
      const res = await fetch(`${API_URL}/api/admin/media/${deleteModal.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete");
      setMediaItems(prev => prev.filter(m => m.id !== deleteModal.id));
    } catch (e) {
      console.error(e);
      alert("Error deleting media");
    } finally {
      closeDeleteModal();
    }
  };

  const openRenameModal = (media) => {
    setRenameModal(media);
    setNewName(media.name);
  };
  const closeRenameModal = () => setRenameModal(null);

  const confirmRename = async () => {
    if (!renameModal || !newName.trim()) return;
    try {
      const token = localStorage.getItem("smp_token");
      const res = await fetch(`${API_URL}/api/admin/media/${renameModal.id}`, {
        method: "PUT",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ original_filename: newName, filename: newName, name: newName })
      });
      if (!res.ok) throw new Error("Failed to rename");
      setMediaItems(prev => prev.map(m => m.id === renameModal.id ? { ...m, name: newName } : m));
    } catch (e) {
      console.error(e);
      alert("Error renaming media");
    } finally {
      closeRenameModal();
    }
  };

  // Filter & Sort
  const filteredMedia = mediaItems
    .filter(m => typeFilter === "all" || (typeFilter === "image" ? m.type.startsWith("image") : m.type.startsWith("video")))
    .filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "name_desc") return b.name.localeCompare(a.name);
      if (sortBy === "date_desc") return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      if (sortBy === "size_desc") return (b.size || 0) - (a.size || 0);
      return 0;
    });

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-500 mt-1">Manage all your images and videos.</p>
        </div>
      </div>

      {/* Upload Area */}
      <div 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        <h3 className="text-lg font-medium text-gray-900 mb-1">Drag and drop files here</h3>
        <p className="text-sm text-gray-500 mb-4">or click to browse from your computer</p>
        <input 
          type="file" 
          multiple 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,video/mp4,video/webm,video/quicktime"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
        >
          Select Files
        </button>
        <p className="text-xs text-gray-400 mt-4 text-left md:text-center max-w-lg mx-auto leading-relaxed">
          Supported Image Formats: JPG, JPEG, PNG, GIF, WebP, SVG.<br />
          Supported Video Formats: MP4, WebM, MOV (H.264 codec preferred).
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex flex-1 w-full lg:max-w-md relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search files..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setTypeFilter("all")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${typeFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>All</button>
            <button onClick={() => setTypeFilter("image")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${typeFilter === 'image' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Images</button>
            <button onClick={() => setTypeFilter("video")} className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${typeFilter === 'video' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Videos</button>
          </div>

          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          >
            <option value="date_desc">Newest First</option>
            <option value="name_asc">Name (A-Z)</option>
            <option value="name_desc">Name (Z-A)</option>
            <option value="size_desc">Largest Size</option>
          </select>

          <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
            <button onClick={() => setViewMode("grid")} className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Grid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode("list")} className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No media found</h3>
          <p className="text-gray-500 mt-2">Try uploading new files or clearing your filters.</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map(item => (
                <div key={item.id} className="group relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
                  <div 
                    className="aspect-square bg-gray-100 relative cursor-pointer"
                    onClick={() => setPreviewMedia(item)}
                  >
                    {item.type.includes('video') ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-900 relative">
                        <video src={item.url} className="w-full h-full object-cover opacity-60" />
                        <Play className="w-10 h-10 text-white absolute bg-black/40 rounded-full p-2" />
                      </div>
                    ) : (
                      <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                    )}
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
                      <div className="flex items-center justify-end gap-2 mb-auto">
                        <button onClick={(e) => { e.stopPropagation(); openRenameModal(item); }} className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-md backdrop-blur-sm transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); openDeleteModal(item); }} className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-red-600 rounded-md backdrop-blur-sm transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-medium text-sm text-gray-900 truncate" title={item.name}>{item.name}</p>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                      <span>{formatBytes(item.size)}</span>
                      <span className="uppercase">{item.type.split('/')[0] || item.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">File</th>
                    <th className="px-4 py-3 hidden md:table-cell">Type</th>
                    <th className="px-4 py-3 hidden md:table-cell">Uploaded</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredMedia.map(item => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 cursor-pointer flex items-center justify-center border border-gray-200"
                            onClick={() => setPreviewMedia(item)}
                          >
                            {item.type.includes('video') ? <Film className="w-5 h-5 text-gray-400" /> : <img src={item.url} alt={item.name} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-900 hover:text-blue-600 cursor-pointer transition" onClick={() => setPreviewMedia(item)}>
                              {item.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell capitalize">
                        {item.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell">
                        {new Date(item.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatBytes(item.size)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2 text-gray-400">
                          <button onClick={() => openRenameModal(item)} className="p-1 hover:text-blue-600 transition">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => openDeleteModal(item)} className="p-1 hover:text-red-600 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm">
          <button onClick={() => setPreviewMedia(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition">
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-5xl h-full pb-16 flex flex-col items-center justify-center">
            {previewMedia.type.includes('video') ? (
              <video src={previewMedia.url} controls autoPlay className="max-w-full max-h-full rounded-lg shadow-2xl" />
            ) : (
              <img src={previewMedia.url} alt={previewMedia.name} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            )}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <div className="bg-black/60 inline-flex items-center gap-4 px-6 py-3 rounded-2xl backdrop-blur-md text-white shadow-xl">
                <span className="font-medium truncate max-w-xs">{previewMedia.name}</span>
                <span className="w-1 h-1 rounded-full bg-white/40"></span>
                <span className="text-white/80 text-sm">{formatBytes(previewMedia.size)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete File</h3>
              <p className="text-gray-500">
                Are you sure you want to delete <span className="font-semibold text-gray-700">{deleteModal.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition shadow-sm"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-blue-600">
                <Edit2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Rename File</h3>
              <p className="text-gray-500 text-sm mb-4">Enter a new name for this file.</p>
              
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
              />
            </div>
            <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={closeRenameModal}
                className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmRename}
                disabled={!newName.trim() || newName === renameModal.name}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
