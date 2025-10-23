import { summarizeFullResume, uploadResumeFile } from "./service.js";
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

export const uploadResumeController = async (req, res) => {
  try {
    const { userId } = req.body;
    const filePath = req.file?.path;

    if (!userId || !filePath) {
      return res.status(400).json({ error: "Missing file or userId." });
    }

    const saved = await uploadResumeFile(userId, filePath);

    return res.status(200).json({
      success: true,
      message: "Resume uploaded successfully.",
      data: saved,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res
      .status(500)
      .json({ error: "Resume upload failed.", details: error.message });
  }
};