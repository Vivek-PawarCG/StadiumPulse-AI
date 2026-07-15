import React, { useState } from 'react';
import { 
  Users, AlertTriangle, Play, RefreshCw, 
  TrendingUp, Compass, Activity, Shield 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend 
} from 'recharts';

export default function CommandDashboard({ sensors, incidents, onReportIncident, onResolveIncident, isLoading }) {
  const [newIncident, setNewIncident] = useState({
    title: '',
    category: 'CROWD_MANAGEMENT',
    priority: 'HIGH',
    location: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group metrics
  const totalHeadcount = sensors.reduce((acc, s) => acc + (s.type === 'GATE' ? s.headCount : 0), 0);
  const criticalSensors = sensors.filter(s => s.status === 'CRITICAL');
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newIncident.title || !newIncident.location) return;
    setIsSubmitting(true);
    await onReportIncident(newIncident);
    setNewIncident({ title: '', category: 'CROWD_MANAGEMENT', priority: 'HIGH', location: '' });
    setIsSubmitting(false);
  };

  // Format chart data
  const waitTimeData = sensors.map(s => ({
    name: s.name.replace(/Gate \d - | Complex| Plaza/g, ''),
    current: s.currentWaitMin,
    forecast15: s.predictedWaitMin15
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* LEFT COLUMN: Live Telemetry Cards & Simulated Heatmap */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* KPI Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border-l-4 border-l-primaryEmerald">
            <div className="p-3 bg-primaryEmerald/10 rounded-lg text-primaryEmerald">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Gates Entry</p>
              <h3 className="text-2xl font-bold font-sans mt-0.5">{totalHeadcount.toLocaleString()}</h3>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border-l-4 border-l-accentAmber">
            <div className="p-3 bg-accentAmber/10 rounded-lg text-accentAmber">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Congested Sectors</p>
              <h3 className="text-2xl font-bold font-sans mt-0.5">{criticalSensors.length} Zones</h3>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex items-center gap-4 border-l-4 border-l-accentRose">
            <div className="p-3 bg-accentRose/10 rounded-lg text-accentRose">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Active Dispatch Alerts</p>
              <h3 className="text-2xl font-bold font-sans mt-0.5">{activeIncidents.length} Alerts</h3>
            </div>
          </div>
        </div>

        {/* Dynamic Heatmap Visualizer */}
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="text-primaryEmerald animate-pulse" size={20} />
              <h3 className="text-lg font-bold">Stadium Gate Crowding Visualizer</h3>
            </div>
            <span className="text-xs bg-emerald-500/10 text-primaryEmerald px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-primaryEmerald rounded-full animate-ping"></span>
              Live Telemetry Simulation
            </span>
          </div>

          {/* Simple Visual Representation of MetLife / NRG Stadium Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-darkBg/60 p-4 rounded-xl border border-glassBorder my-4 relative">
            {sensors.map(sensor => {
              const capRatio = sensor.headCount / sensor.limit;
              const isWarning = sensor.status === 'WARNING';
              const isCritical = sensor.status === 'CRITICAL';
              
              return (
                <div 
                  key={sensor.id} 
                  className={`p-3 rounded-lg border transition-all duration-500 ${
                    isCritical 
                      ? 'bg-accentRose/10 border-accentRose shadow-glowRose' 
                      : isWarning 
                        ? 'bg-accentAmber/10 border-accentAmber shadow-glowAmber' 
                        : 'bg-emerald-500/5 border-primaryEmerald/30'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold text-gray-300 truncate max-w-[80%]">{sensor.name}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${
                      isCritical ? 'bg-accentRose animate-pulse' : isWarning ? 'bg-accentAmber' : 'bg-primaryEmerald'
                    }`}></span>
                  </div>
                  <div className="mt-2">
                    <span className="text-lg font-bold">{(capRatio * 100).toFixed(0)}%</span>
                    <p className="text-[10px] text-gray-400 mt-0.5">{sensor.headCount}/{sensor.limit} Pax</p>
                  </div>
                  <div className="mt-2 w-full bg-darkBg rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        isCritical ? 'bg-accentRose' : isWarning ? 'bg-accentAmber' : 'bg-primaryEmerald'
                      }`} 
                      style={{ width: `${Math.min(100, capRatio * 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex gap-4 text-xs justify-center items-center mt-2 text-gray-400">
            <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-primaryEmerald"></span> Safe (&lt;80%)</div>
            <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-accentAmber"></span> Warning (80%-98%)</div>
            <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-accentRose"></span> Critical (&gt;98%)</div>
          </div>
        </div>

        {/* Predictive Queue wait times chart */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-primaryEmerald" size={20} />
            <div>
              <h3 className="text-lg font-bold">Predictive Wait Times (15 min Forecast)</h3>
              <p className="text-xs text-gray-400">Comparing current wait times vs ML-predicted bottleneck intervals</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={waitTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F29B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00F29B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111928', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }} 
                  labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Area name="Current Wait (Min)" type="monotone" dataKey="current" stroke="#0066FF" fillOpacity={1} fill="url(#colorCurrent)" />
                <Area name="Predicted Wait (Min)" type="monotone" dataKey="forecast15" stroke="#00F29B" fillOpacity={1} fill="url(#colorForecast)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: AI Safety Response & Incident Logger */}
      <div className="space-y-6">
        
        {/* Active Incidents & Vertex AI response plans */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-[350px]">
          <div className="flex items-center gap-2 mb-4 justify-between">
            <div className="flex items-center gap-2">
              <Shield className="text-accentRose" size={20} />
              <h3 className="text-lg font-bold">Active Safety Alerts</h3>
            </div>
            <span className="text-xs bg-red-500/10 text-accentRose px-2 py-0.5 rounded border border-red-500/20 font-bold">
              {activeIncidents.length} Urgent
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {activeIncidents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-4">
                <Shield size={40} className="text-emerald-500/30 mb-2" />
                <p className="text-sm font-semibold">Stadium is fully secure</p>
                <p className="text-xs">No active anomalies reported.</p>
              </div>
            ) : (
              activeIncidents.map(inc => (
                <div key={inc.id} className="p-3 bg-darkBg/60 rounded-xl border border-glassBorder hover:border-accentRose/40 transition-all">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-extrabold ${
                      inc.priority === 'CRITICAL' ? 'bg-red-500/20 text-accentRose border border-red-500/30' : 'bg-amber-500/20 text-accentAmber border border-amber-500/30'
                    }`}>
                      {inc.priority}
                    </span>
                    <span className="text-[10px] text-gray-500">{new Date(inc.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1.5">{inc.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">📍 {inc.location}</p>
                  
                  {inc.aiResolution && (
                    <div className="mt-2.5 p-2 bg-emerald-500/5 border border-primaryEmerald/15 rounded text-[11px] text-gray-300">
                      <span className="text-primaryEmerald font-bold block mb-1">🧠 AI Dispatch Protocol:</span>
                      {inc.aiResolution}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2 justify-end">
                    <button 
                      onClick={() => onResolveIncident(inc.id)}
                      className="text-[11px] bg-primaryEmerald/15 hover:bg-primaryEmerald text-primaryEmerald hover:text-darkBg font-bold px-3 py-1 rounded transition-colors"
                    >
                      Resolve & Clear
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Report / Simulate Incident Form */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-accentAmber" size={20} />
            <h3 className="text-lg font-bold">Simulate Emergency Trigger</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1 font-semibold">Incident Headline</label>
              <input 
                type="text"
                placeholder="e.g. Broken ticket scanner Gate 3"
                value={newIncident.title}
                onChange={e => setNewIncident({ ...newIncident, title: e.target.value })}
                className="w-full bg-darkBg border border-glassBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primaryEmerald transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1 font-semibold">Category</label>
                <select
                  value={newIncident.category}
                  onChange={e => setNewIncident({ ...newIncident, category: e.target.value })}
                  className="w-full bg-darkBg border border-glassBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primaryEmerald transition-colors"
                >
                  <option value="CROWD_MANAGEMENT">Crowd</option>
                  <option value="SECURITY">Security</option>
                  <option value="MEDICAL">Medical</option>
                  <option value="FACILITY">Facility</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1 font-semibold">Priority</label>
                <select
                  value={newIncident.priority}
                  onChange={e => setNewIncident({ ...newIncident, priority: e.target.value })}
                  className="w-full bg-darkBg border border-glassBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primaryEmerald transition-colors"
                >
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1 font-semibold">Location / Zone</label>
              <input 
                type="text"
                placeholder="e.g. South Entry Gate 3"
                value={newIncident.location}
                onChange={e => setNewIncident({ ...newIncident, location: e.target.value })}
                className="w-full bg-darkBg border border-glassBorder rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primaryEmerald transition-colors"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || isLoading}
              className="w-full bg-accentRose hover:bg-accentRose/90 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow-glowRose transition-all duration-300 text-sm disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="animate-spin" size={16} />
              ) : (
                <>
                  <Play size={16} /> Trigger Vertex AI Audit
                </>
              )}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
