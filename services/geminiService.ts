
import { GoogleGenAI, Type } from "@google/genai";
import { GenerationResult, GenerationConstraints, LyricsResult, CreationMode, GroundingSource, SunoVersion, PromptFormat } from "../types";

// Schema definitions for structured JSON output
const promptSchema = {
  type: Type.OBJECT,
  properties: {
    prompts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A creative, short title for this style variation." },
          description: { type: Type.STRING, description: "A brief explanation of the sonic choices." },
          content: { type: Type.STRING, description: "The final, optimized Suno style prompt text." },
          tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 metadata tags." }
        },
        required: ["title", "description", "content", "tags"]
      }
    }
  },
  required: ["prompts"]
};

const lyricsSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Creative song title." },
        lyrics: { type: Type.STRING, description: "Full lyrics with headers." },
        stylePrompt: { type: Type.STRING, description: "Comma-separated musical descriptors (Genre, Mood, Instruments, Vocals, BPM)." }
    },
    required: ["title", "lyrics", "stylePrompt"]
};

const lyricsProSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "Creative song title." },
        lyrics: { type: Type.STRING, description: "Full lyrics with headers." },
        stylePrompts: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "3 distinct style descriptions. First must be tags, others must be descriptive."
        }
    },
    required: ["title", "lyrics", "stylePrompts"]
};

/**
 * Clean and extract JSON from AI response. 
 * Handles cases where AI adds conversational text before or after the JSON block.
 */
const cleanJson = (text: string): string => {
    if (!text) return "{}";
    
    // 1. Remove Markdown code blocks
    let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "");

    // 2. Find the first occurrence of '{' or '['
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    
    if (firstBrace === -1 && firstBracket === -1) return "{}";

    let startIdx: number;
    let endIdx: number;

    // 3. Determine if the structure is an object or array and find corresponding closing character
    if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIdx = firstBrace;
        const lastBrace = cleaned.lastIndexOf('}');
        endIdx = lastBrace !== -1 ? lastBrace + 1 : cleaned.length;
    } else {
        startIdx = firstBracket;
        const lastBracket = cleaned.lastIndexOf(']');
        endIdx = lastBracket !== -1 ? lastBracket + 1 : cleaned.length;
    }
    
    return cleaned.substring(startIdx, endIdx);
};

const getRandomSeed = () => Math.floor(Math.random() * 2147483647);

export const enhanceDescription = async (currentInput: string, mode: CreationMode, useSearch: boolean = false): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Enhance this music input for Suno AI: "${currentInput}"`,
        config: { temperature: 0.85, seed: getRandomSeed(), ...(useSearch ? { tools: [{ googleSearch: {} }] } : {}) }
    });
    return response.text?.trim() || currentInput;
};

export const generateSunoPrompts = async (
    theme: string, 
    constraints: GenerationConstraints,
    options: { model: 'flash' | 'pro', temperature: number, useSearch?: boolean, enableDeepMode?: boolean, sunoVersion: SunoVersion, profileContext?: string, promptFormat?: PromptFormat }
): Promise<GenerationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Logic: Use Pro 3.0 only if Deep Mode is enabled for style, otherwise Flash 3.0
  const modelName = options.enableDeepMode ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  let formatInstruction = "Output prompt 'content' as a string of comma-separated tags and descriptors.";
  
  if (options.promptFormat === 'json') {
      formatInstruction = "Output prompt 'content' as a VALID MINIFIED JSON STRING (e.g., \"{\\\"genre\\\":\\\"rock\\\",\\\"bpm\\\":120}\"). Ensure all quotes within the content string are escaped.";
  } else if (options.promptFormat === 'descriptive') {
      formatInstruction = "Output prompt 'content' as natural language descriptive sentences.";
  }

  const systemInstruction = `You are an elite Music Producer for Suno AI ${options.sunoVersion}.
  Generate exactly 3 professional style prompts based on: "${theme}". 
  
  CRITICAL RULES FOR "CONTENT" FIELD:
  1. NO ENTITY NAMES: Do NOT use specific Game titles (e.g. "Elden Ring"), Anime titles (e.g. "Naruto"), Movie titles, or Artist names in the 'content' field.
  2. TRANSLATE TO VIBE: You MUST translate these references into their musical characteristics (Genre, Instruments, Mood, Production, Era).
     - Input: "Persona 5" -> Output Content: "Acid jazz, funk, upbeat, rhodes piano, groovy bassline, staccato strings"
     - Input: "Hans Zimmer style" -> Output Content: "Cinematic orchestral, epic percussion, swelling strings, ostinato, hybrid synth textures"
  
  Constraints: ${JSON.stringify(constraints)}.
  Format Requirement: ${formatInstruction}
  ${options.profileContext ? `Artist Profile: ${options.profileContext}` : ''}
  ${options.enableDeepMode ? "DEEP MODE: Provide extreme detail, technical VST terms, and target 900+ characters." : "Standard detail level."}
  
  CRITICAL: Your response MUST be a valid JSON object with a 'prompts' array. Each item must have 'title', 'description', 'content', and 'tags'.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Analyze the following theme and create 3 distinct Suno style variations in JSON format:\n${theme}`,
    config: {
      temperature: options.temperature,
      systemInstruction,
      seed: getRandomSeed(), // Unique seed every request
      ...(options.enableDeepMode ? { 
        thinkingConfig: { thinkingBudget: 16000 },
        maxOutputTokens: 24000 
      } : {}),
      ...(options.useSearch ? { tools: [{ googleSearch: {} }] } : { responseMimeType: 'application/json', responseSchema: promptSchema })
    }
  });

  let parsed: any = { prompts: [] };
  try {
      const cleaned = cleanJson(response.text || "");
      parsed = JSON.parse(cleaned);
  } catch (e) {
      console.error("Failed to parse prompt JSON:", e);
      // Fallback: If JSON parsing fails but we have text, try to extract whatever looks like content
      if (response.text && response.text.length > 50) {
          parsed.prompts = [{
              title: "AI Generated Style",
              description: "Extracted from raw model response",
              content: response.text.substring(0, 1000),
              tags: ["AI", "Custom"]
          }];
      }
  }

  return { 
      prompts: parsed.prompts || [], 
      groundingSources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter(Boolean) 
  };
};

export const generatePromptsFromImage = async (
    imageBase64: string, 
    instructions: string, 
    constraints: GenerationConstraints,
    options: { temperature: number, model: 'flash' | 'pro' }
): Promise<GenerationResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = options.model === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model: modelName,
      contents: { 
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }, 
          { text: `Analyze this image and generate 3 Suno style prompts in JSON format. ${instructions}. Constraints: ${JSON.stringify(constraints)}` }
        ] 
      },
      config: { temperature: options.temperature, responseMimeType: 'application/json', responseSchema: promptSchema, seed: getRandomSeed() }
    });
    
    let parsed: any = { prompts: [] };
    try {
        parsed = JSON.parse(cleanJson(response.text || "{}"));
    } catch (e) {
        console.error("Failed to parse image prompt JSON:", e);
    }

    return { prompts: parsed.prompts || [] };
};

export const generateLyricsFromImage = async (
    imageBase64: string, 
    instructions: string, 
    language: string,
    constraints: GenerationConstraints,
    options: { temperature: number, model: 'flash' | 'pro' }
): Promise<LyricsResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = options.model === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    const isPro = options.model === 'pro';
    
    const stylePromptInstruction = isPro 
        ? "Include 3 distinct style prompts in 'stylePrompts':\n1. First prompt MUST be comma-separated tags.\n2. Second and third prompts MUST be descriptive, narrative 'story-style' sentences."
        : "Style prompts must be strictly comma-separated tags.";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { 
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }, 
          { text: `Analyze this image and write a song in ${language}. Return JSON with 'title' and 'lyrics'. ${stylePromptInstruction} ${instructions}. Constraints: ${JSON.stringify(constraints)}` }
        ] 
      },
      config: { temperature: options.temperature, responseMimeType: 'application/json', responseSchema: isPro ? lyricsProSchema : lyricsSchema, seed: getRandomSeed() }
    });

    let parsed: any = {};
    try {
        parsed = JSON.parse(cleanJson(response.text || "{}"));
    } catch (e) {
        console.error("Failed to parse image lyrics JSON:", e);
    }

    // Fallback if parsing returned empty or failed
    if (!parsed.lyrics && response.text) {
        parsed.lyrics = response.text;
        parsed.title = "Visual Vibe Song";
        parsed.stylePrompt = "Experimental Visual Style";
    }

    return { 
        title: parsed.title || "Untitled",
        lyrics: parsed.lyrics || "Lyrics generation failed.",
        stylePrompt: parsed.stylePrompt || "",
        stylePrompts: parsed.stylePrompts || [],
        type: options.model 
    };
};

export const generatePromptsFromAudio = async (
    audioBase64: string, 
    instructions: string, 
    constraints: GenerationConstraints,
    options: { temperature: number }
): Promise<GenerationResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { inlineData: { mimeType: 'audio/mpeg', data: audioBase64 } }, 
          { text: `Analyze this audio clip and generate 3 Suno style prompts in JSON format. ${instructions}. Constraints: ${JSON.stringify(constraints)}` }
        ] 
      },
      config: { temperature: options.temperature, responseMimeType: 'application/json', responseSchema: promptSchema, seed: getRandomSeed() }
    });
    
    let parsed: any = { prompts: [] };
    try {
        parsed = JSON.parse(cleanJson(response.text || "{}"));
    } catch (e) {
        console.error("Failed to parse audio prompt JSON:", e);
    }

    return { prompts: parsed.prompts || [] };
};

export const generateLyricsFromAudio = async (
    audioBase64: string, 
    instructions: string, 
    language: string,
    options: { temperature: number }
): Promise<LyricsResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
        parts: [
          { inlineData: { mimeType: 'audio/mpeg', data: audioBase64 } }, 
          { text: `Analyze this audio clip and write a song in ${language}. Return JSON. Style prompts must be comma-separated tags. ${instructions}` }
        ] 
      },
      config: { temperature: options.temperature, responseMimeType: 'application/json', responseSchema: lyricsSchema, seed: getRandomSeed() }
    });
    
    let parsed: any = {};
    try {
        parsed = JSON.parse(cleanJson(response.text || "{}"));
    } catch (e) {
        console.error("Failed to parse audio lyrics JSON:", e);
    }

    // Fallback
    if (!parsed.lyrics && response.text) {
        parsed.lyrics = response.text;
        parsed.title = "Audio Reference Song";
        parsed.stylePrompt = "Experimental Audio Style";
    }

    return { 
        title: parsed.title || "Untitled",
        lyrics: parsed.lyrics || "Lyrics generation failed.",
        stylePrompt: parsed.stylePrompt || "",
        type: 'flash' 
    };
};

export const generateLyrics = async (topic: string, modelType: 'flash' | 'pro', language: string, temperature: number, useSearch: boolean): Promise<LyricsResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = modelType === 'pro' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
    const isPro = modelType === 'pro';
    
    // Hybrid Strategy for Pro Mode: 
    // v1: Strictly Comma-Separated Tags
    // v2 & v3: Story/Narrative Style
    const styleInstruction = isPro 
        ? "Include an array of exactly 3 DISTINCT Suno style prompts in the 'stylePrompts' field:\n" +
          "1. [TAG STYLE] The first prompt MUST be a strictly comma-separated list of musical descriptors (Genre, Instruments, Mood, Vocal Style, BPM). No sentences.\n" +
          "2. [STORY STYLE] The second and third prompts MUST be descriptive, narrative paragraphs describing the sound, atmosphere, and vibe in full sentences.\n" +
          "Do NOT use entity names (Games/Anime/Artists) in any style string."
        : "Include a single Suno style prompt string in the 'stylePrompt' field. It MUST be a strictly comma-separated list of musical descriptors (Genre, Instruments, Mood, Vocal Style, BPM). Do NOT use full sentences or narrative descriptions. Example: 'Dark Trap, Male Rap, Heavy 808s, Minor Key'. Do NOT use entity names.";

    const systemInstruction = `You are a world-class songwriter and music producer. 
    1. Create a CREATIVE, UNIQUE Title for the song. Do NOT use 'Untitled'.
    2. Write a complete song in ${language} with clear structure headers like [Verse], [Chorus].
    3. ${styleInstruction}
    4. Return strictly valid JSON.
    `;

    const response = await ai.models.generateContent({
        model: modelName,
        contents: `Write a song about: ${topic} in ${language}. Provide the response in JSON format.`,
        config: {
            temperature,
            systemInstruction,
            seed: getRandomSeed(),
            ...(isPro ? { 
                thinkingConfig: { thinkingBudget: 16000 },
                maxOutputTokens: 24000 
            } : {}),
            ...(useSearch ? { tools: [{ googleSearch: {} }] } : { responseMimeType: 'application/json', responseSchema: isPro ? lyricsProSchema : lyricsSchema })
        }
    });
    
    let parsed: any = {};
    try {
        parsed = JSON.parse(cleanJson(response.text || "{}"));
    } catch (e) {
        console.error("Failed to parse lyrics JSON:", e);
    }

    // Fallback: If parsing failed or returned empty object (common with Flash + Tools), use raw text
    if (!parsed.lyrics && response.text) {
        // Simple heuristic to extract title if possible, otherwise use default
        const lines = response.text.split('\n');
        const possibleTitle = lines.find(l => l.trim().length > 0 && l.length < 50 && !l.includes('[') && !l.includes(':'));
        
        parsed.lyrics = response.text;
        parsed.title = possibleTitle || "Generated Song";
        parsed.stylePrompt = "Experimental Style (AI Generated)";
        if (isPro) {
            parsed.stylePrompts = ["Experimental Style 1", "Experimental Style 2", "Experimental Style 3"];
        }
    }

    return { 
        title: parsed.title || "Untitled Song",
        lyrics: parsed.lyrics || "No lyrics content available.",
        stylePrompt: parsed.stylePrompt || "",
        stylePrompts: parsed.stylePrompts || [],
        type: modelType, 
        groundingSources: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web).filter(Boolean) 
    };
};

export const translateLyrics = async (title: string, lyrics: string, targetLanguage: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate to ${targetLanguage}:\nTitle: ${title}\nLyrics:\n${lyrics}`,
        config: { 
            responseMimeType: 'application/json', 
            seed: getRandomSeed(),
            systemInstruction: "You are a professional translator. Return a JSON object with 'title' and 'lyrics' fields."
        }
    });
    
    let parsed: any = {};
    try {
        parsed = JSON.parse(cleanJson(response.text || "{}"));
    } catch (e) {
        console.error("Failed to parse translation JSON:", e);
    }
    return parsed;
};

export const remixStyle = async (original: string, instructions: string) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Remix this Suno prompt: "${original}" with: "${instructions}"`,
        config: { seed: getRandomSeed() }
    });
    return response.text?.trim() || original;
};

export const expandPromptTags = async (content: string, current: string[]) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 5 new tags for: "${content}" (Not in: ${current.join(', ')})`,
        config: { 
            responseMimeType: 'application/json', 
            seed: getRandomSeed(),
            systemInstruction: "Return a JSON array of 5 strings representing tags."
        }
    });
    
    try {
        return JSON.parse(cleanJson(response.text || "[]"));
    } catch (e) {
        return [];
    }
};

export const generateSurpriseTheme = async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate one unique, specific song style theme.",
        config: { temperature: 1.1, seed: getRandomSeed() }
    });
    return response.text?.trim() || "Cyberpunk Jazz";
};
