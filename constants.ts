import { OcrOption, OcrStyle, OcrMode } from "./types";

export const OCR_OPTIONS: OcrOption[] = [
  {
    id: OcrStyle.TEXT,
    label: "Plain Text",
    description: "Extract raw text directly.",
    iconName: "Type",
  },
  {
    id: OcrStyle.MARKDOWN,
    label: "Markdown",
    description: "Preserve formatting (headers, lists).",
    iconName: "FileText",
  },
  {
    id: OcrStyle.LATEX,
    label: "Math / LaTeX",
    description: "Convert formulas to LaTeX.",
    iconName: "Sigma",
  },
  {
    id: OcrStyle.TABLE,
    label: "Table",
    description: "Convert grids to Markdown tables.",
    iconName: "Table",
  },
  {
    id: OcrStyle.JSON,
    label: "JSON",
    description: "Structure data as JSON.",
    iconName: "Braces",
  },
  {
    id: OcrStyle.DESC,
    label: "Description",
    description: "Detailed visual explanation.",
    iconName: "Eye",
  },
];

export const STYLE_PROMPTS: Record<OcrStyle, string> = {
  [OcrStyle.TEXT]: `
Transcribe all legible text exactly as it appears in the image.
Preserve line breaks, spacing, punctuation, and casing.
Do not add any explanations, conversational filler, or markdown unless it is literally present in the image.
Return ONLY the raw text.
`,
  [OcrStyle.MARKDOWN]: `
Transcribe the content into Markdown with minimal transformation.
Only use headings, lists, bold/italic, links, and code blocks if they are clearly indicated in the image.
Preserve the original reading order and line breaks as much as possible.
If some text is illegible, keep its position and use '□' as a placeholder.
Return ONLY the Markdown content (no code fences).
`,
  [OcrStyle.LATEX]: `
Transcribe the content, using LaTeX ONLY for mathematical expressions.
Use $...$ for inline math and $$...$$ for displayed equations when clearly indicated.
Keep surrounding non-math text as plain text and preserve line breaks.
If any symbol/character is illegible, use '□' in its place (do not guess).
Return ONLY the mixed plain text + LaTeX content (no code fences).
`,
  [OcrStyle.TABLE]: `
If the image contains a table, transcribe it using Markdown table syntax.
Preserve row order and keep cell text exactly as seen.
Only create a table when column boundaries are clear; otherwise, output the rows as plain text lines in order.
If any cell text is illegible, use '□' as a placeholder (do not guess).
Return ONLY the content (no code fences).
`,
  [OcrStyle.JSON]: `
Extract ONLY the structured fields that are explicitly visible in the image (receipts, forms, or key-value pairs).
Output a valid JSON object (double quotes, no trailing commas). Use lowerCamelCase for keys.
Do NOT invent keys or values. Do NOT infer missing fields.
If a value is illegible or uncertain, use null.
Return ONLY the JSON string (no markdown, no code fences).
`,
  [OcrStyle.DESC]: `
Describe the image in detail: layout, main objects, colors, and any visible text (quote text verbatim when possible).
If something is unclear, say it is unclear or use cautious language (e.g., "possibly", "appears to").
Do not fabricate specific details that are not visible.
Return ONLY the description.
`,
};

export const MODE_PROMPTS: Record<OcrMode, string> = {
  [OcrMode.STRICT]: `
You are an OCR engine. Transcribe content from the image faithfully.
Rules:
- Do NOT invent, guess, or auto-correct.
- Preserve line breaks, spacing, punctuation, and casing as seen.
- If something is illegible, output '□' (use one '□' for unknown length).
- Output ONLY the requested content. No explanations. No code fences.
`,
  [OcrMode.ENHANCE]: `
You are an OCR assistant focused on producing clean, usable text.
Rules:
- Ignore watermark/overlay text that is clearly non-content (repeated, semi-transparent, crossing the page).
- You may repair obvious OCR errors and reconnect broken lines.
- If you infer missing/unclear text, wrap the inferred part in ⟦ ⟧.
- For JSON output: NEVER use ⟦ ⟧ inside JSON; use null for uncertain values and do not infer missing fields.
- Do NOT add new information beyond what can be reasonably inferred from visible context.
- Output ONLY the requested content. No explanations. No code fences.
`,
};
