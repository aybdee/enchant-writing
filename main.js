import express from "express";
import { OpenAI } from "openai";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Word count mapping
const wordCountMap = {
  short: 100,
  medium: 150,
  long: 200,
};

// API endpoint to generate a letter
app.post("/generate-letter", async (req, res) => {
  try {
    const {
      sender,
      recipient,
      tone = "romantic",
      message,
      specialDetails = "",
      length = "medium",
    } = req.body;

    if (!sender || !recipient || !message) {
      return res.status(400).json({
        error: "Missing required parameters: sender, recipient, or message",
      });
    }

    const wordLimit = wordCountMap[length] || 150;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an assistant that generates letters strictly based on user-provided details. Do not invent events, memories, or details that were not given. Keep the response within approximately ${wordLimit} words.`,
        },
        {
          role: "user",
          content: `Write a ${tone} letter based on the following details:
          
From: ${sender}
To: ${recipient}

Main message to convey: ${message}

Special moments/memories/things to include: ${specialDetails}

Guidelines:
- Maintain a ${tone} tone throughout the letter
- Do NOT add fictional elements or make up details
- Use only the provided information
- Keep the letter concise and within ~${wordLimit} words`,
        },
      ],
    });

    res.json({ letter: response.choices[0].message.content });
  } catch (error) {
    console.error("Error generating letter:", error);
    res.status(500).json({ error: "Failed to generate letter" });
  }
});

// API endpoint to customize an existing letter
app.post("/customize-letter", async (req, res) => {
  try {
    const {
      sender,
      recipient,
      tone = "romantic",
      message,
      specialDetails = "",
      length = "medium",
      existingLetter,
      changes,
    } = req.body;

    if (!sender || !recipient || !message || !existingLetter || !changes) {
      return res.status(400).json({
        error:
          "Missing required parameters: sender, recipient, message, existingLetter, or changes",
      });
    }

    const wordLimit = wordCountMap[length] || 150;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an assistant that modifies letters based on user requests. Do not introduce new events, memories, or fictional elements. Ensure that changes are applied accurately while keeping the response within ~${wordLimit} words.`,
        },
        {
          role: "user",
          content: `Modify the following letter based on the given instructions:
          
Existing Letter:
${existingLetter}

Requested Changes:
${changes}

Guidelines:
- Maintain a ${tone} tone throughout the letter
- Do NOT make up details
- Ensure requested changes are accurately applied
- Keep the formatting clear and structured
- Keep the letter concise and within ~${wordLimit} words.`,
        },
      ],
    });

    res.json({ updatedLetter: response.choices[0].message.content });
  } catch (error) {
    console.error("Error customizing letter:", error);
    res.status(500).json({ error: "Failed to customize letter" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
