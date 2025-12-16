import React, { useState } from "react";
import {
  Plus,
  FileVideo,
  Image,
  PlaySquare,
  Clock,
  HardDrive,
} from "lucide-react";
import { mockContent } from "../data/mockData";

const Content = () => {
  const [content] = useState(mockContent);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
          <p className="text-gray-500 mt-1">
            Manage videos, images, and playlists
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-md hover:shadow-lg active:scale-95 font-medium">
          <Plus className="w-5 h-5" />
          Upload Content
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {content.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            <div
              className={`h-48 flex items-center justify-center relative overflow-hidden ${
                item.type === "video"
                  ? "bg-linear-to-br from-blue-400 to-indigo-500"
                  : item.type === "image"
                  ? "bg-linear-to-br from-pink-400 to-rose-500"
                  : "bg-linear-to-br from-purple-400 to-violet-500"
              }`}
            >
              {/* Background pattern or effect */}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>

              {item.type === "video" ? (
                <FileVideo className="w-16 h-16 text-white drop-shadow-md transform group-hover:scale-110 transition-transform duration-300" />
              ) : item.type === "playlist" ? (
                <PlaySquare className="w-16 h-16 text-white drop-shadow-md transform group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <Image className="w-16 h-16 text-white drop-shadow-md transform group-hover:scale-110 transition-transform duration-300" />
              )}

              <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded text-xs font-medium text-white">
                {item.type.toUpperCase()}
              </div>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4 line-clamp-1">
                {item.name}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Duration</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {item.duration}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <HardDrive className="w-4 h-4" />
                    <span>Size</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {item.size || item.items + " items"}
                  </span>
                </div>
              </div>

              <button className="w-full mt-6 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition font-medium text-sm border border-gray-100 hover:border-blue-200">
                Manage Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Content;
