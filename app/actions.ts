"use server";

import { AISolution, QueryCategory, UploadedImage } from "@/app/types";

// Note: Ensure you rename your env variable in .env.local to GROQ_API_KEY (remove NEXT_PUBLIC_)
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Simple in-memory rate limit for serverless (Note: This resets on server restart, which is fine for MVP)
let requestCount = 0;
const MAX_REQUESTS_PER_MINUTE = 20;
let minuteResetTimer: NodeJS.Timeout | null = null;

const categoryPrompts: Record<QueryCategory, string> = {
  roads:
    "Focus on Municipal Corporation Road Maintenance Department, PWD (Public Works Department), and emergency repair protocols.",
  aadhaar:
    "Focus on UIDAI centres, Aadhar Seva Kendra, online SSUP portal, and required documents.",
  electricity:
    "Focus on State Electricity Board (SEB), DISCOM offices, and power complaint helplines.",
  water: "Focus on Jal Board, Municipal Water Supply, and pollution control.",
  sanitation:
    "Focus on Municipal Health Department, Swachh Bharat Mission, and waste management.",
  police: "Focus on Local Police Station, SP Office, and online FIR portals.",
  municipal:
    "Focus on Municipal Corporation, Ward Offices, and property tax departments.",
  transport:
    "Focus on RTO (Regional Transport Office), Traffic Police, and vehicle registration.",
  healthcare:
    "Focus on Health Department, Government Hospitals, and medical schemes.",
  general: "Provide general civic administration guidance.",
};

function resetRequestCount() {
  requestCount = 0;
  if (minuteResetTimer) {
    clearTimeout(minuteResetTimer);
  }
  minuteResetTimer = setTimeout(() => {
    requestCount = 0;
  }, 60000);
}

// Define a standard return type for the server action
type ActionResponse =
  | { success: true; data: AISolution }
  | { success: false; error: string; retryAfter?: number };

interface GenerateSolutionParams {
  text: string;
  category: QueryCategory | null;
  images: UploadedImage[];
  location: { latitude: number; longitude: number } | null;
}

export async function generateSolutionAction(
  params: GenerateSolutionParams,
): Promise<ActionResponse> {
  // 1. Security Check
  if (!GROQ_API_KEY) {
    return {
      success: false,
      error: "Server misconfiguration: API key missing.",
    };
  }

  // 2. Rate Limiting
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    return {
      success: false,
      error: "System busy. Please try again in a minute.",
      retryAfter: 60000,
    };
  }

  const systemPrompt = `You are FixMyIndiaAI, an expert Indian civic administration assistant. Provide actionable, specific guidance for Indian citizens.
  
Rules:
1. Return ONLY a JSON object (no markdown code blocks, no backticks)
2. Be specific about department names, phone numbers (if available), and steps
3. Reference specific laws/schemes where applicable (RTI, CPGRAMS, etc.)
4. Timeline estimates should be realistic for Indian bureaucracy
5. If location provided, assume municipal jurisdiction based on coordinates

Expected JSON structure:
{
  "summary": "Brief 1-line summary",
  "confidence": "high/medium/low",
  "estimatedTimeline": "X-Y days/weeks",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Action title",
      "description": "Detailed step description",
      "isCritical": true/false,
      "estimatedTime": "X mins"
    }
  ],
  "relevantAuthority": {
    "department": "Exact department name",
    "contactNumber": "Phone/helpline",
    "email": "Email address",
    "website": "URL",
    "officeAddress": "Where to visit",
    "jurisdiction": "Jurisdiction details"
  },
  "documentsNeeded": ["doc1", "doc2"],
  "directLinks": [
    {"title": "Link name", "url": "https://...", "type": "official/form/helpline"}
  ]
}`;

  const userPrompt = `Issue Category: ${params.category || "General"}
Category Context: ${
    params.category ? categoryPrompts[params.category] : "General civic issue"
  }
User Description: ${params.text}
Location: ${
    params.location
      ? `Lat: ${params.location.latitude}, Lng: ${params.location.longitude}`
      : "Not provided"
  }
${
  params.images.length > 0
    ? `Attached: ${params.images.length} image(s) for visual reference`
    : "No images attached"
}

Generate a specific action plan for this Indian civic issue. Return only valid JSON.`;

  try {
    requestCount++;
    if (!minuteResetTimer) {
      resetRequestCount();
    }

    const messages: any[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    // Handle Images
    if (params.images.length > 0) {
      const imageContents = params.images.map((img) => ({
        type: "image_url",
        image_url: {
          url: img.base64.startsWith("data:")
            ? img.base64
            : `data:${img.fileType};base64,${img.base64}`,
          detail: "low",
        },
      }));

      messages.push({
        role: "user",
        content: [
          ...imageContents,
          {
            type: "text",
            text: "Analyze these images for additional context about the civic issue location and severity.",
          },
        ],
      });
    }

    const model =
      params.images.length > 0
        ? "llama-3.2-11b-vision-preview"
        : "llama-3.3-70b-versatile";

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages,
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after");
        return {
          success: false,
          error: "Rate limit hit. Too many requests.",
          retryAfter: retryAfter ? parseInt(retryAfter) * 1000 : 60000,
        };
      }
      return {
        success: false,
        error: `API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`,
      };
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let parsed;
    try {
      // Clean up markdown if AI adds it
      const jsonMatch =
        content.match(/```json\n?([\s\S]*?)\n?```/) ||
        content.match(/```\n?([\s\S]*?)\n?```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      parsed = JSON.parse(jsonStr.trim());
    } catch (e) {
      return { success: false, error: "Failed to parse AI response format" };
    }

    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      return { success: false, error: "Invalid response structure from AI" };
    }

    const solution: AISolution = {
      ...parsed,
      id: "sol_" + crypto.randomUUID(),
      queryId: "query_" + Date.now(),
      generatedAt: Date.now(),
    };

    return { success: true, data: solution };
  } catch (error) {
    console.error("Server Action Error:", error);
    return { success: false, error: "Internal server error" };
  }
}
