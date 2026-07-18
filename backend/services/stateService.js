import { initialSensors, initialIncidents, initialTransit, initialSustainability } from '../data/mockData.js';

class StateService {
  constructor() {
    this.sensors = [...initialSensors];
    this.incidents = [...initialIncidents];
    this.transit = [...initialTransit];
    this.sustainability = { ...initialSustainability };
    this.logs = [];

    // Start simulation loop
    this.startSimulation();
  }

  // Getters
  getSensors() {
    return this.sensors;
  }

  getIncidents() {
    return this.incidents;
  }

  getTransit() {
    return this.transit;
  }

  getSustainability() {
    return this.sustainability;
  }

  getLogs() {
    return this.logs;
  }

  // Mutators
  addIncident(incident) {
    const newIncident = {
      id: `inc_${Math.floor(100 + Math.random() * 900)}`,
      title: incident.title,
      category: incident.category,
      priority: incident.priority,
      location: incident.location,
      status: "REPORTED",
      assignedVolunteer: "None",
      aiResolution: incident.aiResolution || "Pending AI review.",
      createdAt: new Date().toISOString()
    };
    this.incidents.unshift(newIncident);
    this.addLog("SYSTEM", "INCIDENT_CREATED", `Incident ${newIncident.id} (${newIncident.title}) logged.`);
    return newIncident;
  }

  updateIncidentStatus(id, status, assignedVolunteer = null) {
    const incident = this.incidents.find(i => i.id === id);
    if (incident) {
      incident.status = status;
      if (assignedVolunteer) {
        incident.assignedVolunteer = assignedVolunteer;
      }
      this.addLog("SYSTEM", "INCIDENT_UPDATED", `Incident ${id} status changed to ${status}.`);
      return incident;
    }
    return null;
  }

  addLog(actor, action, message) {
    this.logs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      message
    });
    // Cap log history
    if (this.logs.length > 100) this.logs.pop();
  }

  // Live Simulation Engine
  startSimulation() {
    this.simulationInterval = setInterval(() => {
      // 1. Simulating headcounts & queue wait times at sensors
      this.sensors = this.sensors.map(sensor => {
        // Random drift up or down by max 8%
        const driftCoeff = (Math.random() - 0.5) * 0.16; 
        let newCount = Math.round(sensor.headCount * (1 + driftCoeff));
        
        // Boundaries
        newCount = Math.max(10, Math.min(newCount, Math.round(sensor.limit * 1.15)));
        
        // Recalculate wait times based on capacity ratio
        const capacityRatio = newCount / sensor.limit;
        let waitMin = Math.round(capacityRatio * 25);
        if (capacityRatio > 1.0) waitMin = Math.round(waitMin * 1.5);
        waitMin = Math.max(2, waitMin);

        // Status thresholds
        let status = "SAFE";
        if (capacityRatio >= 0.8 && capacityRatio < 0.98) status = "WARNING";
        if (capacityRatio >= 0.98) status = "CRITICAL";

        return {
          ...sensor,
          headCount: newCount,
          currentWaitMin: waitMin,
          predictedWaitMin15: Math.round(waitMin * (1 + (Math.random() - 0.2) * 0.15)), // upward forecast bias
          status
        };
      });

      // 2. Simulating transit delay variations
      this.transit = this.transit.map(line => {
        if (line.mode === "RIDESHARE") return line; // Uber remains congested
        const delayDrift = Math.floor((Math.random() - 0.5) * 4); // drift by max 2 mins
        const newDelay = Math.max(0, line.delayMin + delayDrift);
        const status = newDelay === 0 ? "ON_TIME" : newDelay > 10 ? "HEAVY_CONGESTION" : "DELAYED";
        return {
          ...line,
          delayMin: newDelay,
          status
        };
      });

      // 3. Simulating carbon footprint and sustainability metrics
      this.sustainability.powerKwh += Math.round(Math.random() * 5);
      this.sustainability.waterLiters += Math.round(Math.random() * 12);
      this.sustainability.solarGenerationKwh += Math.round(Math.random() * 2);
      
      // Random garbage increases
      const binType = Math.random() > 0.6 ? "recyclable" : Math.random() > 0.5 ? "compostable" : "landfill";
      this.sustainability.wasteKg[binType] += Math.round(Math.random() * 2);

    }, 8000); // Trigger adjustments every 8 seconds
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
  }
}

export const stateService = new StateService();
export default stateService;
