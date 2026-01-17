import React, { useState } from "react";
import { Plus, FileVideo } from "lucide-react";
import { mockContent } from "../data/mockData";

const Content = () => {
  const [content] = useState(mockContent);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Library</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" />
          Upload Content
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
          >
            <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <FileVideo className="w-16 h-16 text-white opacity-80" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{item.name}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium capitalize">{item.type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{item.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Size:</span>
                  <span className="font-medium">{item.size}</span>
                </div>
              </div>
              <button className="w-full mt-4 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
                Assign to Player
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Content;
