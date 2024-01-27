import express from "express";
import cors from "cors";
import { callAPIOpenAI } from "./openaiHelper.js";
import { limitAPICalls } from "./Middleware/LimiteApiCall.middleware.js";

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

app.post("/api/generate-letter", limitAPICalls, async (req, res) => {
  const { userPrompt, context } = req.body;

  try {
    const result = await callAPIOpenAI(userPrompt, context);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Express running on http://localhost:${port}`);
});
