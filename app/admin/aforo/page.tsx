'use client';

import { useEffect, useState } from 'react';
// Update the import path below to the correct relative path for your project structure
import { useToast } from '../../Components/Toast';
// Or, if the correct path is different, adjust accordingly, e.g.:
// import { useToast } from '@/components/Toast';

interface EventData {
  _id: string;
  name: string;
  capacity: number;
  currentAttendees: number;
}

export default function AforoDashboard() {
  const [events, setEvents] = useState<EventData[]>([]);
  const toast = useToast();

  useEffect(() => {
    fetch('/api/admin/aforo')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events);

        data.events.forEach((event: EventData) => {
          const percentage = (event.currentAttendees / event.capacity) * 100;
          if (percentage >= 90) {
            toast(`⚠️ Aforo de "${event.name}" supera el 90%`, 'warning');
          } else if (percentage >= 80) {
            toast(`🔔 Aforo de "${event.name}" supera el 80%`, 'info');
          }
        });
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#111a22] text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Monitoreo de Aforos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map(event => {
          const percent = Math.round((event.currentAttendees / event.capacity) * 100);
          return (
            <div key={event._id} className="bg-[#192734] p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-2">{event.name}</h2>
              <p>{event.currentAttendees} / {event.capacity} personas</p>
              <div className="w-full bg-gray-700 h-3 rounded mt-2 overflow-hidden">
                <div
                  className={`h-full ${percent >= 90 ? 'bg-red-500' : percent >= 80 ? 'bg-yellow-400' : 'bg-green-500'}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-1">{percent}% ocupado</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
