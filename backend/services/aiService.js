import { geminiClient, vertexClient } from '../config/vertex.js';
import stateService from './stateService.js';

class AIService {
  /**
   * AI Fan Assistant - Powered by Direct Gemini Developer API (gemini-2.5-flash-lite)
   */
  async generateFanResponse(query, language = 'en') {
    const sensors = stateService.getSensors();
    const transit = stateService.getTransit();
    
    // Construct helpful context of the stadium
    const context = `
      Current Stadium Status for FIFA World Cup Match (USA vs England):
      - Crowded Zones: ${sensors.filter(s => s.status === 'CRITICAL').map(s => s.name).join(', ') || 'None'}
      - Concessions showing high wait times: ${sensors.filter(s => s.type === 'CONCESSION' && s.currentWaitMin > 20).map(s => s.name).join(', ') || 'None'}
      - Best gates to enter (low wait): ${sensors.filter(s => s.type === 'GATE' && s.status === 'SAFE').map(s => s.name).join(', ')}
      - Transit Delays: ${transit.map(t => `${t.name}: ${t.delayMin} min delay (${t.status})`).join('; ')}
    `;

    const systemInstruction = `
      You are the official multi-lingual StadiumPulse AI Fan Assistant for the FIFA World Cup 2026.
      You are helping a visitor inside the stadium.
      Current Stadium Context:
      ${context}

      Guidelines:
      - Answer the fan's query warmly, concisely, and supportively.
      - Answer strictly in the language requested: "${language}".
      - If they ask for food, suggest concessions with low queues.
      - If they ask for exits/entries, suggest Gates with shorter queues.
      - Keep answers under 3 sentences for easy mobile readability.
    `;

    if (!geminiClient) {
      console.log("🤖 Running Direct Gemini in Mock Fallback mode...");
      return this.getMockFanResponse(query, language);
    }

    try {
      const model = geminiClient.getGenerativeModel({ 
        model: 'gemini-2.5-flash-lite',
        generationConfig: { temperature: 0.3 },
        systemInstruction: systemInstruction
      });
      const response = await model.generateContent(query);
      return response.response.text();
    } catch (error) {
      console.error("❌ Direct Gemini API call failed:", error.message);
      return this.getMockFanResponse(query, language);
    }
  }

  /**
   * AI Incident Dispatch Response - Powered by Enterprise Vertex AI SDK
   */
  async generateSafetyResponse(incidentTitle, location, category) {
    const sensors = stateService.getSensors();
    const sensorsContext = sensors.map(s => `${s.name}: headcount ${s.headCount}/${s.limit}, wait ${s.currentWaitMin} min`).join('\n');

    const prompt = `
      System Role: You are the StadiumPulse Safety Orchestrator powered by Google Cloud Vertex AI.
      Analyze the following security/operations incident report:
      Incident: "${incidentTitle}"
      Location: "${location}"
      Category: "${category}"

      Stadium Telemetry Context:
      ${sensorsContext}

      Task: Return a raw JSON object containing immediate response details.
      Structure of JSON output:
      {
        "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
        "instructions": "Direct instructions for safety responders on-site.",
        "rerouteAdvice": "Short instructions for routing fan flows away from this incident.",
        "broadcastTranslation": {
          "es": "Spanish translation of the fan reroute instruction.",
          "fr": "French translation of the fan reroute instruction."
        }
      }
      Do NOT wrap the output in markdown code blocks or write \`\`\`json. Return only raw text that can be parsed with JSON.parse.
    `;

    if (!vertexClient) {
      console.log("🤖 Running Vertex AI in Mock Fallback mode...");
      return this.getMockSafetyResponse(incidentTitle, location, category);
    }

    try {
      const generativeModel = vertexClient.preview.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      const response = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const responseText = response.response.candidates[0].content.parts[0].text;
      return JSON.parse(responseText.trim());
    } catch (error) {
      console.error("❌ Vertex AI API call failed:", error.message);
      return this.getMockSafetyResponse(incidentTitle, location, category);
    }
  }

  /**
   * Sustainability Advisor - Powered by Enterprise Vertex AI SDK
   */
  async generateSustainabilityReport() {
    const metrics = stateService.getSustainability();
    const prompt = `
      You are the FIFA World Cup Green Initiative Auditor.
      Review these stadium metrics:
      - Power consumed: ${metrics.powerKwh} kWh
      - Solar energy generated on-site: ${metrics.solarGenerationKwh} kWh
      - Water consumption: ${metrics.waterLiters} Liters
      - Waste sorting: Recyclables ${metrics.wasteKg.recyclable} kg, Compostables ${metrics.wasteKg.compostable} kg, Landfill ${metrics.wasteKg.landfill} kg.

      Provide 3 short bullet points (max 15 words each) with recommendations on how to optimize energy or waste right now. Output ONLY the 3 bullets, no header.
    `;

    if (!vertexClient) {
      return [
        "Dim concourse lighting by 10% in inactive zones during match play.",
        "Reroute solar surplus to energy storage batteries for post-match egress.",
        "Send volunteer squad to Gate 3 to enforce compost/recycling bin separation."
      ];
    }

    try {
      const generativeModel = vertexClient.preview.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        generationConfig: { temperature: 0.2 }
      });

      const response = await generativeModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      const text = response.response.candidates[0].content.parts[0].text;
      return text.split('\n').map(line => line.replace(/^-\s*/, '').trim()).filter(Boolean);
    } catch (error) {
      console.error("❌ Vertex AI Sustainability call failed:", error.message);
      return [
        "Dim concourse lighting by 10% in inactive zones during match play.",
        "Reroute solar surplus to energy storage batteries for post-match egress.",
        "Send volunteer squad to Gate 3 to enforce compost/recycling bin separation."
      ];
    }
  }

  // MOCK FALLBACKS
  getMockFanResponse(query, language) {
    const lower = query.toLowerCase();
    
    const responses = {
      en: {
        food: "Concession C (Sec 215) currently has the shortest queue (under 5 mins). They serve Fresh Pizzas!",
        exit: "Gate 4 on the West Plaza is currently clear with a wait time under 6 minutes. Avoid Gate 3.",
        gate: "Gate 4 is the fastest entry/exit. Gate 2 and Gate 3 have heavy queue times.",
        medical: "The nearest medical aid station is located at First Aid Room A, next to Section 109 on the main concourse.",
        transit: "Clean transit options include the Electric Shuttle from Gate 4 (5-min wait) or the Metro Line at North Station (runs every 8 mins).",
        sustainability: "Help us stay green: use the compost bins at Section 112, carry a reusable water bottle, and take the zero-emission electric shuttles!",
        default: "Welcome to FIFA 2026! You are near Section 112. Let me know if you need seat routes, wait times, or clean transit."
      },
      es: {
        food: "La Concesión C (Sección 215) tiene la fila más corta (menos de 5 min). ¡Sirven pizzas frescas!",
        exit: "La Puerta 4 en la Plaza Oeste está despejada, con un tiempo de espera de menos de 6 minutos.",
        gate: "La Puerta 4 es la más rápida. Evite las Puertas 2 y 3 debido a la alta congestión.",
        medical: "La estación de primeros auxilios más cercana se encuentra en la Sala de Auxilio A, al lado de la Sección 109 en el pasillo principal.",
        transit: "Las opciones de transporte ecológico incluyen el transbordador eléctrico desde la Puerta 4 (espera de 5 min) o la línea de metro en la estación norte (cada 8 min).",
        sustainability: "Ayúdenos a mantener el verde: use los contenedores de compostaje en la Sección 112, lleve una botella de agua reusable y tome los transbordadores eléctricos.",
        default: "¡Bienvenido a la Copa Mundial FIFA 2026! Estoy aquí para ayudarle con rutas, comida y transporte ecológico."
      },
      fr: {
        food: "La Concession C (Sec 215) a la file d'attente la plus courte (moins de 5 min). Ils servent des pizzas fraîches !",
        exit: "La porte 4 sur la West Plaza est actuellement dégagée avec une attente de moins de 6 minutes.",
        gate: "La porte 4 est l'accès le plus rapide. Évitez les portes 2 et 3 en raison de l'affluence.",
        medical: "Le poste de secours le plus proche est situé à la salle de premiers secours A, à côté de la section 109 sur le hall principal.",
        transit: "Les options de transport propre comprennent la navette électrique depuis la porte 4 (5 min d'attente) ou la ligne de métro à la gare nord (toutes les 8 min).",
        sustainability: "Aidez-nous à rester éco-responsables : utilisez les bacs de compostage à la Section 112, apportez une gourde réutilisable et prenez les navettes électriques.",
        default: "Bienvenue à la Coupe du Monde de la FIFA 2026 ! Je suis là pour vous aider avec les itinéraires et le transit."
      }
    };

    const langSet = responses[language] || responses['en'];
    if (lower.includes('food') || lower.includes('comida') || lower.includes('nourriture') || lower.includes('taco') || lower.includes('pizza') || lower.includes('hambre') || lower.includes('faim')) {
      return langSet.food;
    }
    if (lower.includes('exit') || lower.includes('salida') || lower.includes('sortie') || lower.includes('leave') || lower.includes('sortir')) {
      return langSet.exit;
    }
    if (lower.includes('gate') || lower.includes('puerta') || lower.includes('porte') || lower.includes('entrada')) {
      return langSet.gate;
    }
    if (lower.includes('medical') || lower.includes('médic') || lower.includes('secours') || lower.includes('aid') || lower.includes('ayuda') || lower.includes('doctor') || lower.includes('docteur')) {
      return langSet.medical;
    }
    if (lower.includes('transit') || lower.includes('transport') || lower.includes('shuttle') || lower.includes('bus') || lower.includes('metro') || lower.includes('métro') || lower.includes('tren') || lower.includes('train')) {
      return langSet.transit;
    }
    if (lower.includes('sustain') || lower.includes('sostenib') || lower.includes('durab') || lower.includes('green') || lower.includes('verde') || lower.includes('vert') || lower.includes('recycl') || lower.includes('compost')) {
      return langSet.sustainability;
    }
    return langSet.default;
  }

  getMockSafetyResponse(incidentTitle, location, category) {
    let severity = "MEDIUM";
    let instructions = "Dispatch standard facility patrol to inspect and report.";
    let rerouteAdvice = "Keep visual watch on pedestrian movement.";

    if (category === "CROWD_MANAGEMENT" || incidentTitle.toLowerCase().includes("gate")) {
      severity = "HIGH";
      instructions = "Deploy 4 volunteers to Gate 3 entry queue. Direct oncoming passengers to walk towards Gate 4.";
      rerouteAdvice = "Divert pedestrian traffic along external perimeter fence towards the Western Plaza (Gate 4).";
    } else if (incidentTitle.toLowerCase().includes("medical") || category === "MEDICAL") {
      severity = "CRITICAL";
      instructions = "Dispatch Medical First Responder Unit 2 with trauma kit immediately.";
      rerouteAdvice = "Clear concession concourse aisle 3 for ambulance stretcher access.";
    }

    return {
      severity,
      instructions,
      rerouteAdvice,
      broadcastTranslation: {
        es: `Alerta: Para evitar demoras, diríjase a la Puerta 4 en la Plaza Oeste.`,
        fr: `Alerte: Pour éviter l'attente, veuillez vous diriger vers la porte 4 sur la West Plaza.`
      }
    };
  }
}

export const aiService = new AIService();
export default aiService;
