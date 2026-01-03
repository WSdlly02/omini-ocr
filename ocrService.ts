import OpenAI from "openai";
import { OcrStyle, OcrMode } from "./types";
import { STYLE_PROMPTS, MODE_PROMPTS } from "./constants";

/**
 * Helper to convert a File object to a Base64 string.
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Performs OCR on the provided image file using the specified style.
 * Supports streaming output via the onUpdate callback.
 */
export const performOCR = async (
  file: File,
  baseUrl: string = `${window.location.origin}/ollama/v1`,
  model: string = "qwen3-vl:8b-instruct",
  style: OcrStyle,
  mode: OcrMode,
  onUpdate?: (text: string) => void
): Promise<string> => {
  try {
    const base64Image = await fileToBase64(file);

    const cleanBaseUrl = baseUrl.replace(/\/$/, "");

    const openai = new OpenAI({
      baseURL: cleanBaseUrl,
      apiKey: "ollama",
      dangerouslyAllowBrowser: true,
    });

    // @ts-ignore - Using any to allow extra_body and streaming parameters for Ollama
    const stream = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: MODE_PROMPTS[mode].trim(), // system prompt based on mode
        },
        {
          role: "user",
          content: [
            { type: "text", text: STYLE_PROMPTS[style].trim() }, // style-specific instructions
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      temperature: mode === OcrMode.ENHANCE ? 0.3 : 0.1,
      max_tokens: 16384,
      stream: true,
      extra_body: {
        think: false,
        options: {
          seed: 42,
          num_ctx: 16384, // Increased context size
          repeat_penalty: 1.1,
          top_k: 20,
          top_p: 0.8,
          min_p: 0,
        },
      },
    });

    let fullText = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullText += content;

      // Clean up thinking tags and markdown if they appear in the stream
      let displayText = fullText
        .replace(/<think>[\s\S]*?<\/think>/g, "")
        .trim();

      if (onUpdate) {
        onUpdate(displayText);
      }
    }

    let cleanText = fullText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    if (cleanText.startsWith("```") && cleanText.endsWith("```")) {
      const firstLineBreak = cleanText.indexOf("\n");
      if (firstLineBreak !== -1) {
        cleanText = cleanText
          .substring(firstLineBreak + 1, cleanText.length - 3)
          .trim();
      }
    }

    return cleanText;
  } catch (error) {
    console.error("Ollama OCR Error:", error);
    if (error instanceof Error) {
      throw new Error(`OCR Failed: ${error.message}`);
    }
    throw new Error("An unexpected error occurred during recognition.");
  }
};
