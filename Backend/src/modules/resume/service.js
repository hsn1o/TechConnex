import { parseResumeText } from "./model.js";
import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";

export const summarizeFullResume = async (pdfPath) => {
  const text = await parseResumeText(pdfPath);

  const model = new ChatOpenAI({
    modelName: "gpt-4o",
    temperature: 0.2,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = PromptTemplate.fromTemplate(`
You're an expert assistant that extracts structured JSON data from resumes.

Extract the following information from the provided resume text:

{{
  "bio": "...",
  "skills": ["..."],
  "languages": ["..."],
  "yearsExperience": "...",
  "suggestedHourlyRate": "...",
  "certifications": [
    {{
      "name": "...",
      "issuer": "...",
      "issuedDate": "...",
      "serialNumber": "...",
      "verificationLink": "..."
    }}
  ],
  "portfolioUrls": ["..."],
  "officialWebsite": "...",
  "location": "..."
}}
Resume:
{resumeText}
Return ONLY valid JSON — no explanations, text, or code blocks.
`);

  const chain = RunnableSequence.from([prompt, model]);
  const result = await chain.invoke({ resumeText: text });

  let content = result.content?.trim();

  // Clean up stray code fences
  if (content.startsWith("```json") || content.startsWith("```")) {
    content = content.replace(/```json|```/g, "").trim();
  }

  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error("Failed to parse AI response:", content);
    throw new Error("AI returned invalid JSON format");
  }
};
