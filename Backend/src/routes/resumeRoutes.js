const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const { ChatOpenAI } = require("@langchain/openai");
const { RunnableSequence } = require("@langchain/core/runnables");
const { PromptTemplate } = require("@langchain/core/prompts");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: "uploads/resumes/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// AI Processor
const summarizeFullResume = async (pdfPath) => {
    const buffer = fs.readFileSync(pdfPath);
    const text = (await pdfParse(buffer)).text;
  
    const model = new ChatOpenAI({
      modelName: "gpt-4o",
      temperature: 0.2,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  
    const prompt = PromptTemplate.fromTemplate(`
  You're an expert assistant. Extract this structured JSON from the resume text:
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
        "issuedDate": "..."
      }}
    ]
  }}
  Resume:
  {resumeText}
  Only return valid JSON — do NOT include \`\`\`json or any code blocks.
  `);
  
    const chain = RunnableSequence.from([prompt, model]);
    const result = await chain.invoke({ resumeText: text });
  
    let content = result.content?.trim();
  
    // Remove ```json or ``` wrappers if present
    if (content.startsWith("```json") || content.startsWith("```")) {
      content = content.replace(/```json|```/g, "").trim();
    }
  
    return JSON.parse(content);
  };
  
// POST /api/resume/analyze
router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    const filePath = req.file?.path;
    if (!filePath) return res.status(400).json({ error: "No resume uploaded." });

    const extracted = await summarizeFullResume(filePath);

    return res.json({ data: extracted });
  } catch (err) {
    console.error("Resume analysis failed:", err);
    return res.status(500).json({ error: "AI resume analysis failed." });
  }
});

module.exports = router;
