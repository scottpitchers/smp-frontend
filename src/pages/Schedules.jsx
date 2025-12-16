import React, { useState } from "react";
import { Plus, Calendar, Clock, Monitor, LayoutList } from "lucide-react";
import { mockSchedules } from "../data/mockData";

const Schedules = () => {
  const [schedules] = useState(mockSchedules);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedules</h1>
          <p className="text-gray-500 mt-1">
            Plan when and where your content plays
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition shadow-md hover:shadow-lg active:scale-95 font-medium">
          <Plus className="w-5 h-5" />
          Create Schedule
        </button>
      </div>

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 hover:border-purple-200"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                  <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                    {schedule.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <LayoutList className="w-4 h-4" />
                    <span>
                      Content:{" "}
                      <span className="font-medium text-gray-700">
                        {schedule.content}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 md:gap-8">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time Range
                  </span>
                  <span className="text-gray-900 font-medium">
                    {schedule.time}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                    Active Days
                  </span>
                  <span className="text-gray-900 font-medium">
                    {schedule.days}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Monitor className="w-3 h-3" /> Devices
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700 font-medium text-sm inline-block text-center">
                    {schedule.players}
                  </span>
                </div>
              </div>

              <button className="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg hover:bg-purple-50 transition font-medium text-sm whitespace-nowrap">
                Edit Schedule
              </button>
            </div>
          </div>
        ))}

        {/* Empty state or Add New box if needed, kept simple for now */}
        {schedules.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No schedules configured</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedules;
