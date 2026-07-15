export const initialSensors = [
  {
    id: "gate_1",
    name: "Gate 1 - North Plaza",
    headCount: 1200,
    limit: 4000,
    currentWaitMin: 8,
    predictedWaitMin15: 10,
    status: "SAFE",
    type: "GATE"
  },
  {
    id: "gate_2",
    name: "Gate 2 - East Concourse",
    headCount: 3800,
    limit: 4500,
    currentWaitMin: 22,
    predictedWaitMin15: 29,
    status: "WARNING",
    type: "GATE"
  },
  {
    id: "gate_3",
    name: "Gate 3 - South Gate (Transit Link)",
    headCount: 4950,
    limit: 5000,
    currentWaitMin: 41,
    predictedWaitMin15: 48,
    status: "CRITICAL",
    type: "GATE"
  },
  {
    id: "gate_4",
    name: "Gate 4 - West Plaza",
    headCount: 950,
    limit: 4000,
    currentWaitMin: 5,
    predictedWaitMin15: 6,
    status: "SAFE",
    type: "GATE"
  },
  {
    id: "concession_a",
    name: "Gridiron Grille (Sec 110)",
    headCount: 220,
    limit: 300,
    currentWaitMin: 14,
    predictedWaitMin15: 19,
    status: "SAFE",
    type: "CONCESSION"
  },
  {
    id: "concession_b",
    name: "Stadium Tacos & Brew (Sec 122)",
    headCount: 410,
    limit: 400,
    currentWaitMin: 28,
    predictedWaitMin15: 35,
    status: "CRITICAL",
    type: "CONCESSION"
  },
  {
    id: "concession_c",
    name: "Touchdown Pizza (Sec 215)",
    headCount: 80,
    limit: 250,
    currentWaitMin: 4,
    predictedWaitMin15: 5,
    status: "SAFE",
    type: "CONCESSION"
  },
  {
    id: "restroom_north",
    name: "Restroom Complex - North (Level 1)",
    headCount: 150,
    limit: 200,
    currentWaitMin: 6,
    predictedWaitMin15: 7,
    status: "SAFE",
    type: "RESTROOM"
  },
  {
    id: "restroom_south",
    name: "Restroom Complex - South (Level 1)",
    headCount: 240,
    limit: 220,
    currentWaitMin: 18,
    predictedWaitMin15: 22,
    status: "WARNING",
    type: "RESTROOM"
  }
];

export const initialIncidents = [
  {
    id: "inc_001",
    title: "Gate 3 Entrance Scanner Outage",
    category: "CROWD_MANAGEMENT",
    priority: "HIGH",
    location: "Gate 3 Entrance",
    status: "DISPATCHED",
    assignedVolunteer: "Volunteer Team Echo",
    aiResolution: "Dynamic redirection of incoming light rail passengers to Gate 4. Multi-language announcements dispatched via PWA alert system.",
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  },
  {
    id: "inc_002",
    title: "Concession B Scanner Offline",
    category: "FACILITY",
    priority: "MEDIUM",
    location: "Sec 122 Concourse",
    status: "REPORTED",
    assignedVolunteer: "None",
    aiResolution: "Recommend deploying an IT support technician. Prompt nearby concessions to display alternative menu items or switch to manual cash operations.",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  }
];

export const initialTransit = [
  {
    id: "shuttle_a",
    name: "Downtown Express Shuttle",
    mode: "BUS",
    delayMin: 4,
    status: "ON_TIME",
    ecoRating: "A",
    nextDeparture: "5 min"
  },
  {
    id: "metro_red",
    name: "FIFA Red Line Metro",
    mode: "RAIL",
    delayMin: 15,
    status: "DELAYED",
    ecoRating: "A+",
    nextDeparture: "12 min"
  },
  {
    id: "rideshare_zone",
    name: "Uber/Lyft Dispatch Zone",
    mode: "RIDESHARE",
    delayMin: 25,
    status: "HEAVY_CONGESTION",
    ecoRating: "C",
    nextDeparture: "Continuous"
  }
];

export const initialSustainability = {
  waterLiters: 84300,
  powerKwh: 4890,
  wasteKg: {
    recyclable: 950,
    compostable: 620,
    landfill: 140
  },
  solarGenerationKwh: 1250
};
