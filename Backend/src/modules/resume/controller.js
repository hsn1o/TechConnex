import { summarizeFullResume } from "./service.js";
export const analyzeResume = async (req, res) => {
  try {
    const filePath = req.file?.path;

    if (!filePath) {
      return res.status(400).json({ error: "No resume uploaded." });
    }

    console.log("Analyzing resume:", filePath); // 🔍 Log uploaded file path

    const extracted = await summarizeFullResume(filePath);
    return res.json({ data: extracted });
  } catch (err) {
    console.error("Resume analysis failed:", err.message);
    console.error(err.stack); // 🔍 full trace
    return res.status(500).json({ error: "AI resume analysis failed." });
  }
};
