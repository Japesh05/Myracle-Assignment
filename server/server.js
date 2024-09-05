const express = require("express");
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors"); 
const Groq = require("groq-sdk");

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(cors());


app.post(
  "/api/generate-instructions",
  upload.array("images"),
  async (req, res) => {
    try {
      const { context } = req.body;
      const images = req.files;

      
      const contextText = context && context.trim() ? context : "No specific context provided";

     
      const imageDescriptions = images.length
        ? images
            .map((img, index) => `Image ${index + 1}: ${img.originalname}`)
            .join(", ")
        : "No images provided";

      
      const prompt = `You are an AI tester. Write detailed, step-by-step test instructions for the following context: "${contextText}". Screenshots provided: ${imageDescriptions}. Each test case should include:
        1. **Description**: What the test case is about.
        2. **Pre-conditions**: What needs to be set up or ensured before testing.
        3. **Testing Steps**: Step-by-step instructions for testing.
        4. **Expected Result**: The expected outcome if the feature works correctly.`;

      // Generate instructions using Groq API
      const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "gemma-7b-it", 
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: true,
      });

      res.setHeader("Content-Type", "text/plain");

      for await (const chunk of chatCompletion) {
        res.write(chunk.choices[0]?.delta?.content || "");
      }
      res.end();
    } catch (error) {
      console.error("Error generating instructions:", error);
      res.status(500).json({ error: "Error generating instructions" });
    }
  }
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
