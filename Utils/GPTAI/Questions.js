import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GPT_API_KEY,
});

export const aiQuestions = async (preparationData) => {
  try {
    console.log("log from", preparationData);

    const { preparationType, exam: examRole, subject, year } = preparationData;
    const systemPrompt = `
You are an AI that generates competitive exam multiple-choice questions.

Rules:
- Generate exactly 5 multiple-choice questions.
- Each question must have:
  - id (number starting from 1)
  - question (string)
  - options (array of exactly 4 strings)
  - correctAnswer (must match exactly one of the options)
  - explanation (clear and concise explanation)
- Output must be valid JSON.
- Do NOT include any text outside JSON.
`;

    const userPrompt = `
Generate 5 multiple-choice questions for:

Exam Name: ${preparationType}
Exam Role: ${examRole}
Subject: ${subject}
Difficulty Level: Year ${year}
Language: Tamil

Make questions syllabus-relevant and exam-oriented.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = response.choices[0].message.content;

    const parsed = JSON.parse(content);

    // Basic validation
    if (
      !parsed.questions ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length !== 5
    ) {
      throw new Error("Invalid AI response format");
    }

    return parsed;
  } catch (error) {
    console.error("AI Question Generation Error:", error.message);
    throw error;
  }
};
