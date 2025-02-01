import express from "express";
import { OpenAI } from "openai";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
// Middleware to parse JSON request bodies
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// API endpoint to generate a letter
app.post("/generate-letter", async (req, res) => {
  try {
    const {
      sender,
      recipient,
      tone = "romantic",
      message,
      specialDetails = "",
      length = "medium", // New parameter: short, medium, long
    } = req.body;

    if (!sender || !recipient || !message) {
      return res.status(400).json({
        error: "Missing required parameters: sender, recipient, or message",
      });
    }

    // Determine max tokens based on length

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Write a ${tone} letter based on the following details:
          
From: ${sender}
To: ${recipient}

Main message to convey: ${message}

Special moments/memories/things to include: ${specialDetails}

Guidelines:
- Maintain a ${tone} tone throughout the letter
- Include the provided special moments and memories naturally in the text
- Make the letter personal and meaningful
- Ensure proper letter formatting with appropriate spacing
- The length should be ${length} (short, medium, or long)

Please write the letter in a clear, well-structured format.`,
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
      changes, // New field: describes the modifications
    } = req.body;

    if (!sender || !recipient || !message || !existingLetter || !changes) {
      return res.status(400).json({
        error:
          "Missing required parameters: sender, recipient, message, existingLetter, or changes",
      });
    }

    // Determine max tokens based on length

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: `Modify the following letter based on the given instructions:
          
Existing Letter:
${existingLetter}

Requested Changes:
${changes}

Guidelines:
- Maintain a ${tone} tone throughout the letter
- Ensure that all requested changes are incorporated
- Keep the formatting clear and structured
- The length should be ${length} (short, medium, or long)
- Regardless of the length, keep it straight to the point, dont ramble too much

Provide the revised version of the letter.`,
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
