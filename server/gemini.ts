import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

// Lazy initialization representing experienced production software
let genAI: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!genAI) {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined. Falling back to local rule-based safety model.");
    }
    genAI = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAI;
}

export interface AnalyzeResult {
  disasterType: string;
  severity: string;
  priorityScore: number;
  affectedPeople: number;
  recommendedActions: string[];
}

export async function analyzeIncidentReport(description: string, imageBase64?: string): Promise<AnalyzeResult> {
  const defaultFallback: AnalyzeResult = {
    disasterType: 'Other',
    severity: 'Medium',
    priorityScore: 5,
    affectedPeople: 1,
    recommendedActions: [
      'Dispatch regular patrol team to verify status.',
      'Check local safety perimeters.',
      'Keep communications logs open.'
    ]
  };

  // Rule-based heuristic if API key is missing
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.includes("MOCK")) {
    const descLower = description.toLowerCase();
    if (descLower.includes('fire') || descLower.includes('smoke') || descLower.includes('burn')) {
      return {
        disasterType: 'Fire',
        severity: 'High',
        priorityScore: 8,
        affectedPeople: 3,
        recommendedActions: [
          'Alert fire station dispatch immediately.',
          'Evacuate the structure and set perimeter fences.',
          'Advocate citizens to stay low and cover face with wet cloths.'
        ]
      };
    } else if (descLower.includes('flood') || descLower.includes('water') || descLower.includes('drown') || descLower.includes('submerged')) {
      return {
        disasterType: 'Flood',
        severity: 'High',
        priorityScore: 8,
        affectedPeople: 5,
        recommendedActions: [
          'Deploy inflatable motorboats.',
          'Cut power grid grids to block structural electrocution hazard.',
          'Suggest high-ground coordinates for sheltering.'
        ]
      };
    } else if (descLower.includes('earthquake') || descLower.includes('shake') || descLower.includes('collapse') || descLower.includes('rubble')) {
      return {
        disasterType: 'Earthquake',
        severity: 'Critical',
        priorityScore: 10,
        affectedPeople: 10,
        recommendedActions: [
          'Bring ultrasonic search sensors and K9 units to search debris.',
          'Advocate residents to stay in open fields away from high stands.',
          'Coordinate heavy cranes and lifters.'
        ]
      };
    }
    return defaultFallback;
  }

  try {
    const ai = getAIClient();
    const parts: any[] = [
      {
        text: `You are RescueAI - the advanced disaster response analytics core.
Analyze this citizen emergency report description. Classify and extract structured JSON parameters representing the severe crisis metrics.

Citizen Report:
"${description}"

Extract:
1. disasterType: Must be one of 'Flood', 'Fire', 'Earthquake', 'Severe Storm', 'Landslide', 'Medical Emergency', 'Infrastructure Failure', 'Other'. Choose the most fitting.
2. severity: Must be 'Critical', 'High', 'Medium', or 'Low'. (Critical = imminent loss of life/trapped civilians, High = active hazard/injury risk, Medium = blockages/structural threat, Low = property hazard without active human risk).
3. priorityScore: Integer from 1 (lowest danger) to 10 (highest, immediate catastrophic threat).
4. affectedPeople: Best estimate of direct trapped or directly impacted citizens. If unspecified, use 1.
5. recommendedActions: Exactly 3 highly specific, physical actionable rescue instructions for emergency response teams.

Analyze the image as well, if supplied, to assess the accuracy, scale, and visibility of the emergency.`
      }
    ];

    if (imageBase64) {
      // Striking out header if exists, like data:image/png;base64,...
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: cleanBase64
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            disasterType: {
              type: Type.STRING,
              description: "The primary classified emergency category"
            },
            severity: {
              type: Type.STRING,
              description: "Severity category of the incident: Critical, High, Medium, or Low"
            },
            priorityScore: {
              type: Type.INTEGER,
              description: "The prioritized emergency triage score from 1 up to 10"
            },
            affectedPeople: {
              type: Type.INTEGER,
              description: "Estimated number of human casualties or trapped citizens who need rescue"
            },
            recommendedActions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "List of 3 concrete physical actions for rescue authorities"
            }
          },
          required: ["disasterType", "severity", "priorityScore", "affectedPeople", "recommendedActions"]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    return {
      disasterType: parsed.disasterType || defaultFallback.disasterType,
      severity: parsed.severity || defaultFallback.severity,
      priorityScore: Number(parsed.priorityScore) || defaultFallback.priorityScore,
      affectedPeople: Number(parsed.affectedPeople) || defaultFallback.affectedPeople,
      recommendedActions: parsed.recommendedActions || defaultFallback.recommendedActions
    };

  } catch (error) {
    console.error("Gemini analysis failed, utilizing rule-based backup analyzer:", error);
    return defaultFallback;
  }
}
