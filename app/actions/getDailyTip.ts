"use server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function getDailyCivicTip() {
  if (!GROQ_API_KEY) return "Empowering Citizens, One Click at a Time.";

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful Indian civic assistant. Generate a short, 1-sentence interesting fact or tip about Indian civic rights (RTI, Consumer Court, Traffic Rules, etc.). Be catchy and inspiring. Do not use hashtags.",
            },
            { role: "user", content: "Give me one fresh tip." },
          ],
          temperature: 0.9, // High temperature for variety
          max_tokens: 60,
        }),
        next: { revalidate: 0 }, // No caching = fresh every visit
      },
    );

    const data = await response.json();
    return data.choices[0]?.message?.content || "Your Voice Matters. Speak Up.";
  } catch (e) {
    return "Building a Better India, Together.";
  }
}
