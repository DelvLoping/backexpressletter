import express from "express";
import { callAPIOpenAI } from "./openaiHelper.js";
import cors from "cors";

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

const apiCallCount = new Map();

// Middleware to limit API calls per IP address
const limitAPICalls = (req, res, next) => {
  let activeIpLimit = false;
  if (process.env.NODE_ENV !== "development" && activeIpLimit) {
    const ip = req.ip;
    if (!apiCallCount.has(ip)) {
      apiCallCount.set(ip, 0);
    }
    if (apiCallCount.get(ip) >= 6) {
      return res
        .status(429)
        .json({ error: "API call limit exceeded for this IP address" });
    }
    apiCallCount.set(ip, apiCallCount.get(ip) + 1);
  }

  // Continue to the next middleware or route handler
  next();
};

app.post("/api/generate-letter", limitAPICalls, async (req, res) => {
  const { userPrompt, context } = req.body;

  try {
    const result = await callAPIOpenAI(userPrompt, context);
    // res.writeHead(200, {
    //   "Content-Type": "application/json",
    //   "Transfer-Encoding": "chunked",
    //   Connection: "keep-alive",
    // });
    // if (response && typeof response.on === "function") {
    //   response
    //     .on("data", (chunk) => {
    //       res.write(chunk.choices[0]?.delta?.content || "");
    //     })
    //     .on("end", () => {
    //       res.end();
    //     })
    //     .on("error", (err) => {
    //       console.error(err);
    //       res.status(500).end({ error: err.message });
    //     });
    // } else {
    //   // Si la réponse n'est pas un flux, envoyez-la directement au client
    //   res.end(response.choices[0]?.delta?.content || "");
    // }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Express running on http://localhost:${port}`);
});
