import React, { useState } from 'react';
import { Shield, CheckCircle, Clock, AlertTriangle, Send, RefreshCw } from 'lucide-react';

export default function VolunteerPortal({ incidents, onUpdateIncidentStatus, onReportIncident }) {
  const [reportTitle, setReportTitle] = useState('');
  const [reportLocation, setReportLocation] = useState('Gate 3 Plaza');
  const [reportCategory, setReportCategory] = useState('CROWD_MANAGEMENT');
  const [isReporting, setIsReporting] = useState(false);

  // Filters for unresolved incidents representing tasks
  const tasks = incidents.filter(i => i.status !== 'RESOLVED');

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportTitle.trim()) return;
    setIsReporting(true);
    await onReportIncident({
      title: reportTitle,
      location: reportLocation,
      category: reportCategory,
      priority: 'MEDIUM'
    });
    setReportTitle('');
    setIsReporting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* COLUMN 1 & 2: Shift Details & Task List */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Volunteer Identity Card */}
        <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-emerald-950/20 via-zinc-900/60 to-brandBlue/10 border-l-4 border-l-primaryEmerald">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] bg-primaryEmerald/15 text-primaryEmerald px-2.5 py-0.5 rounded font-extrabold tracking-widest uppercase border border-primaryEmerald/20">
                ACTIVE VOLUNTEER SHIFT
              </span>
              <h3 className="text-2xl font-bold mt-2">Team Delta Coordinator</h3>
              <p className="text-sm text-gray-400 mt-1">Sector Assignment: <strong className="text-white">South Gate & Transit Concourse</strong></p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-400 block font-semibold">Shift Schedule</span>
              <span className="text-sm font-bold text-primaryEmerald">12:00 - 18:00 (Match Day)</span>
            </div>
          </div>
        </div>

        {/* Task Cards Deck */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock className="text-primaryEmerald" size={18} />
            My Active Task Assignments ({tasks.length})
          </h3>

          {tasks.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl text-center text-gray-400">
              <CheckCircle className="text-primaryEmerald mx-auto mb-2" size={40} />
              <p className="text-sm font-semibold">All assigned tasks completed!</p>
              <p className="text-xs mt-1">Keep monitoring your designated zone for crowd bottleneck triggers.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map(task => (
                <div key={task.id} className="glass-panel p-5 rounded-2xl border-l-4 border-l-accentAmber flex flex-col justify-between hover:border-r hover:border-r-glassBorder transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] bg-amber-500/15 text-accentAmber border border-amber-500/20 px-2 py-0.5 rounded font-bold uppercase">
                        {task.category}
                      </span>
                      <span className="text-[10px] text-gray-500">{task.id}</span>
                    </div>

                    <h4 className="text-base font-bold text-white mt-3">{task.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">📍 {task.location}</p>

                    {task.aiResolution && (
                      <div className="mt-3.5 p-3 bg-darkBg/60 rounded-xl border border-glassBorder text-xs text-gray-300">
                        <span className="text-primaryEmerald font-extrabold block mb-1">📋 Action Protocol:</span>
                        {task.aiResolution}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-glassBorder flex items-center justify-between gap-3">
                    <span className="text-[11px] text-gray-400">
                      Status: <strong className="text-accentAmber uppercase">{task.status}</strong>
                    </span>

                    <div className="flex gap-2">
                      {task.status === 'REPORTED' && (
                        <button
                          onClick={() => onUpdateIncidentStatus(task.id, 'DISPATCHED', 'Team Delta')}
                          className="bg-brandBlue hover:bg-brandBlue/90 text-white font-bold text-xs px-3 py-1.5 rounded transition-all"
                        >
                          Accept
                        </button>
                      )}
                      
                      <button
                        onClick={() => onUpdateIncidentStatus(task.id, 'RESOLVED')}
                        className="bg-primaryEmerald hover:bg-primaryEmerald/90 text-darkBg font-bold text-xs px-3 py-1.5 rounded shadow-glow transition-all"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* COLUMN 3: Local Incident Reporter */}
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-accentAmber animate-pulse" size={20} />
            <h3 className="text-lg font-bold">Report Concourse Issue</h3>
          </div>

          <form onSubmit={handleReport} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-semibold">Incident/Observation</label>
              <input
                type="text"
                placeholder="e.g. Restroom water spill or Full trash bin"
                value={reportTitle}
                onChange={e => setReportTitle(e.target.value)}
                className="w-full bg-darkBg border border-glassBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primaryEmerald transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-semibold">Location</label>
              <input
                type="text"
                placeholder="e.g. Gate 3 Plaza Concourse"
                value={reportLocation}
                onChange={e => setReportLocation(e.target.value)}
                className="w-full bg-darkBg border border-glassBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primaryEmerald transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-semibold">Category</label>
              <select
                value={reportCategory}
                onChange={e => setReportCategory(e.target.value)}
                className="w-full bg-darkBg border border-glassBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primaryEmerald transition-colors"
              >
                <option value="CROWD_MANAGEMENT">Crowd Overflow</option>
                <option value="FACILITY">Facility Maintenance</option>
                <option value="MEDICAL">Medical Need</option>
                <option value="SECURITY">Security Risk</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isReporting}
              className="w-full bg-brandBlue hover:bg-brandBlue/90 text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-50"
            >
              {isReporting ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : (
                <>
                  <Send size={16} /> Submit to Command Center
                </>
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
