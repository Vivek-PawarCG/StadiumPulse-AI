import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Shield, MessageSquare, Compass, 
  Settings, Activity, CheckCircle, RefreshCw 
} from 'lucide-react';
import CommandDashboard from './components/CommandDashboard';
import FanAssistant from './components/FanAssistant';
import VolunteerPortal from './components/VolunteerPortal';
import TransitDashboard from './components/TransitDashboard';

export default function App() {
  const [role, setRole] = useState('COMMANDER'); // COMMANDER, FAN, VOLUNTEER
  const [activeTab, setActiveTab] = useState('overview'); // overview, chat, volunteer, transit

  // Server state data
  const [sensors, setSensors] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [transit, setTransit] = useState([]);
  const [sustainability, setSustainability] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoized fetch to prevent re-creation on each render
  const fetchData = useCallback(async () => {
    // Skip network requests when the tab is not visible (saves CPU & bandwidth)
    if (document.hidden) return;

    try {
      const [sensorsRes, incidentsRes, transitRes, sustainabilityRes] = await Promise.all([
        fetch('/api/v1/telemetry/sensors'),
        fetch('/api/v1/incidents'),
        fetch('/api/v1/telemetry/transit'),
        fetch('/api/v1/telemetry/sustainability')
      ]);

      const [sensorsData, incidentsData, transitData, sustainabilityData] = await Promise.all([
        sensorsRes.json(),
        incidentsRes.json(),
        transitRes.json(),
        sustainabilityRes.json()
      ]);

      setSensors(sensorsData);
      setIncidents(incidentsData);
      setTransit(transitData);
      setSustainability(sustainabilityData);
    } catch (e) {
      console.error("Error fetching telemetry state:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Poll state every 4 seconds; pause when the tab is hidden to conserve resources
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Post new incident (triggers Vertex AI analysis)
  const handleReportIncident = async (newInc) => {
    try {
      const res = await fetch('/api/v1/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInc)
      });
      const data = await res.json();
      // Prepend to current list
      setIncidents(prev => [data.incident, ...prev]);
    } catch (error) {
      console.error("Error creating incident:", error);
    }
  };

  // Update incident status
  const handleUpdateIncidentStatus = async (id, status, assignedVolunteer = null) => {
    try {
      const res = await fetch(`/api/v1/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedVolunteer })
      });
      const data = await res.json();
      
      // Update in local state
      setIncidents(prev => prev.map(inc => inc.id === id ? data : inc));
    } catch (error) {
      console.error("Error updating incident status:", error);
    }
  };

  // Handle role switching side effects
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'COMMANDER') setActiveTab('overview');
    if (newRole === 'FAN') setActiveTab('chat');
    if (newRole === 'VOLUNTEER') setActiveTab('volunteer');
  };

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* GLOBAL HEADER BAR */}
      <header className="glass-panel border-b border-glassBorder sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Brand Logo & FIFA Theme Accent */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primaryEmerald/15 border border-primaryEmerald/30 rounded-xl flex items-center justify-center text-primaryEmerald shadow-glow">
            <Activity size={22} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-white via-gray-100 to-primaryEmerald bg-clip-text text-transparent uppercase">
                StadiumPulse AI
              </h1>
              <span className="text-[9px] bg-brandBlue/20 text-blue-400 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest border border-blue-500/20">
                Command Center
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium">FIFA World Cup 2026 Operations Layer</p>
          </div>
        </div>

        {/* Global Perspective Role Selector */}
        <div className="flex items-center gap-2 bg-darkBg/60 p-1.5 rounded-xl border border-glassBorder self-start md:self-auto">
          <span className="text-[10px] text-gray-400 font-bold px-2 uppercase tracking-wide hidden sm:inline">Role View:</span>
          
          <button
            onClick={() => handleRoleChange('COMMANDER')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              role === 'COMMANDER' 
                ? 'bg-primaryEmerald text-darkBg shadow-glow' 
                : 'text-gray-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Shield size={13} /> Ops Commander
          </button>

          <button
            onClick={() => handleRoleChange('FAN')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              role === 'FAN' 
                ? 'bg-primaryEmerald text-darkBg shadow-glow' 
                : 'text-gray-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <MessageSquare size={13} /> Fan Assistant
          </button>

          <button
            onClick={() => handleRoleChange('VOLUNTEER')}
            className={`text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              role === 'VOLUNTEER' 
                ? 'bg-primaryEmerald text-darkBg shadow-glow' 
                : 'text-gray-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Users size={13} /> Volunteer Portal
          </button>
        </div>

      </header>

      {/* SUB-NAVIGATION & PERSPECTIVE TABS */}
      <div className="bg-darkBg/30 border-b border-glassBorder/40 px-6 py-2.5 flex justify-between items-center">
        <div className="flex gap-2">
          {role === 'COMMANDER' && (
            <>
              <button 
                onClick={() => setActiveTab('overview')}
                className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                  activeTab === 'overview' ? 'text-primaryEmerald bg-emerald-500/10' : 'text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveTab('transit')}
                className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                  activeTab === 'transit' ? 'text-primaryEmerald bg-emerald-500/10' : 'text-gray-400 hover:text-white'
                }`}
              >
                Transit & Sustainability
              </button>
            </>
          )}

          {role === 'FAN' && (
            <>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                  activeTab === 'chat' ? 'text-primaryEmerald bg-emerald-500/10' : 'text-gray-400 hover:text-white'
                }`}
              >
                AI Concierge Chat
              </button>
              <button 
                onClick={() => setActiveTab('transit')}
                className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                  activeTab === 'transit' ? 'text-primaryEmerald bg-emerald-500/10' : 'text-gray-400 hover:text-white'
                }`}
              >
                Eco Transit Route
              </button>
            </>
          )}

          {role === 'VOLUNTEER' && (
            <>
              <button 
                onClick={() => setActiveTab('volunteer')}
                className={`text-xs font-bold px-3 py-1 rounded transition-colors ${
                  activeTab === 'volunteer' ? 'text-primaryEmerald bg-emerald-500/10' : 'text-gray-400 hover:text-white'
                }`}
              >
                Task Dispatch Deck
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
          <span className="h-1.5 w-1.5 bg-primaryEmerald rounded-full animate-ping"></span>
          Auto-syncing every 4s
        </div>
      </div>

      {/* CORE DISPLAY WINDOW */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        
        {isLoading ? (
          <div className="h-[400px] w-full flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin text-primaryEmerald" size={32} />
            <p className="text-sm text-gray-400">Synchronizing StadiumPulse telemetry layers...</p>
          </div>
        ) : (
          <div className="w-full">
            {role === 'COMMANDER' && activeTab === 'overview' && (
              <CommandDashboard 
                sensors={sensors}
                incidents={incidents}
                onReportIncident={handleReportIncident}
                onResolveIncident={(id) => handleUpdateIncidentStatus(id, 'RESOLVED')}
                isLoading={isLoading}
              />
            )}

            {role === 'COMMANDER' && activeTab === 'transit' && (
              <TransitDashboard 
                transit={transit}
                sustainability={sustainability}
              />
            )}

            {role === 'FAN' && activeTab === 'chat' && (
              <FanAssistant />
            )}

            {role === 'FAN' && activeTab === 'transit' && (
              <TransitDashboard 
                transit={transit}
                sustainability={sustainability}
              />
            )}

            {role === 'VOLUNTEER' && activeTab === 'volunteer' && (
              <VolunteerPortal 
                incidents={incidents}
                onUpdateIncidentStatus={handleUpdateIncidentStatus}
                onReportIncident={handleReportIncident}
              />
            )}
          </div>
        )}

      </main>

      {/* FOOTER BAR */}
      <footer className="mt-auto border-t border-glassBorder/30 py-4 px-6 text-center text-xs text-gray-500 flex justify-between items-center">
        <span>StadiumPulse AI • FIFA 2026 Stadium Coordinator Platform</span>
        <div className="flex gap-4">
          <span className="hover:text-gray-400 cursor-pointer">SRE Status</span>
          <span className="hover:text-gray-400 cursor-pointer">Security Audits</span>
        </div>
      </footer>

    </div>
  );
}
