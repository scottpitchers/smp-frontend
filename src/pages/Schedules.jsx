import React, { useState } from "react";
import { Plus, Calendar } from "lucide-react";
import { mockSchedules } from "../data/mockData";

const Schedules = () => {
  const [schedules] = useState(mockSchedules);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Schedules</h2>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-5 h-5" />
          New Schedule
        </button>
      </div>

      <div className="space-y-4">
        {schedules.map((schedule) => (
          <div
            key={schedule.id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{schedule.name}</h3>
                  <p className="text-sm text-gray-500">
                    Content: {schedule.content}
                  </p>
                  <p className="text-sm text-gray-500">
                    Time: {schedule.time} · Days: {schedule.days} · Players:{" "}
                    {schedule.players}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedules;
