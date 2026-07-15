import React, { useState, useEffect } from 'react';
import { Leaf, Navigation, Bus, Clock, Lightbulb, RefreshCw, BarChart } from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function TransitDashboard({ transit, sustainability }) {
  const [auditSuggestions, setAuditSuggestions] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  const fetchAudit = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch('/api/v1/telemetry/sustainability/audit');
      const data = await res.json();
      setAuditSuggestions(data.suggestions || []);
    } catch (e) {
      console.warn("Failed to load audit suggestions", e);
      setAuditSuggestions([
        "Dim concourse lighting by 10% in inactive zones during match play.",
        "Reroute solar surplus to energy storage batteries for post-match egress.",
        "Send volunteer squad to Gate 3 to enforce compost/recycling bin separation."
      ]);
    }
    setLoadingAudit(false);
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const wasteData = [
    { name: 'Recycle', weight: sustainability?.wasteKg?.recyclable || 0, color: '#00F29B' },
    { name: 'Compost', weight: sustainability?.wasteKg?.compostable || 0, color: '#FFB000' },
    { name: 'Landfill', weight: sustainability?.wasteKg?.landfill || 0, color: '#FF3366' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* COLUMN 1 & 2: Transit Details & Energy Telemetry */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Transit Options Card */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Navigation className="text-primaryEmerald" size={20} />
            <div>
              <h3 className="text-lg font-bold">Dynamic Egress & Transit Guidance</h3>
              <p className="text-xs text-gray-400">Green transport options, estimated delays, and departure tracks</p>
            </div>
          </div>

          <div className="space-y-4">
            {transit.map(line => (
              <div key={line.id} className="p-4 bg-darkBg/60 rounded-xl border border-glassBorder flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brandBlue/10 text-brandBlue rounded-lg">
                    <Bus size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{line.name}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Mode: {line.mode} | Eco Rating: <strong className="text-primaryEmerald">{line.ecoRating}</strong></p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    line.status === 'ON_TIME' 
                      ? 'bg-emerald-500/10 text-primaryEmerald' 
                      : line.status === 'DELAYED'
                        ? 'bg-amber-500/10 text-accentAmber'
                        : 'bg-red-500/10 text-accentRose'
                  }`}>
                    {line.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-2 justify-end">
                    <Clock size={12} /> Delay: {line.delayMin} min
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Grid telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Green Solar Generation</h4>
              <h3 className="text-3xl font-extrabold text-primaryEmerald mt-2">
                {sustainability?.solarGenerationKwh?.toLocaleString()} kWh
              </h3>
              <p className="text-xs text-gray-400 mt-2">Offsetting approximately 18% of match-day operations load.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-glassBorder flex justify-between text-xs text-gray-400">
              <span>Total Grid Load: {sustainability?.powerKwh} kWh</span>
              <span className="text-primaryEmerald">Renewable Grid</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h4 className="text-xs text-gray-400 font-bold uppercase tracking-wider">Water Consumption</h4>
              <h3 className="text-3xl font-extrabold text-blue-400 mt-2">
                {sustainability?.waterLiters?.toLocaleString()} L
              </h3>
              <p className="text-xs text-gray-400 mt-2">Dynamic gray-water filtration operational in restrooms.</p>
            </div>
            <div className="mt-4 pt-4 border-t border-glassBorder flex justify-between text-xs text-gray-400">
              <span>Target Limit: 150,000 L</span>
              <span className="text-blue-400">Normal Capacity</span>
            </div>
          </div>
        </div>

      </div>

      {/* COLUMN 3: AI Sustainability Advisor & Waste Analytics */}
      <div className="space-y-6">
        
        {/* Vertex AI Auditor Panel */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Leaf className="text-primaryEmerald animate-pulse" size={20} />
              <h3 className="text-lg font-bold">AI Sustainability Advisor</h3>
            </div>
            <button 
              onClick={fetchAudit} 
              disabled={loadingAudit}
              className="p-1 bg-zinc-800 rounded border border-glassBorder hover:bg-zinc-700 disabled:opacity-50"
              title="Refresh Audit"
            >
              <RefreshCw size={12} className={loadingAudit ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="space-y-3.5 mt-4">
            {auditSuggestions.map((sug, i) => (
              <div key={i} className="p-3 bg-emerald-500/5 border border-primaryEmerald/15 rounded-xl flex items-start gap-2.5">
                <Lightbulb size={16} className="text-primaryEmerald shrink-0 mt-0.5" />
                <p className="text-xs text-gray-300 leading-relaxed">{sug}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Waste Distribution Graph */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <BarChart className="text-primaryEmerald" size={20} />
            <h3 className="text-lg font-bold">Waste Stream Logging</h3>
          </div>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={wasteData} layout="vertical" margin={{ left: -10, right: 10 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={9} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111928', borderColor: 'rgba(255,255,255,0.08)', borderRadius: 12 }} 
                />
                <Bar dataKey="weight" fill="#00F29B" radius={[0, 4, 4, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
