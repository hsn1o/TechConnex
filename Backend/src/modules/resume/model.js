import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");

export const parseResumeText = async (pdfPath) => {
  try {
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`File not found: ${pdfPath}`);
    }

    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);

    return data.text;
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
};
