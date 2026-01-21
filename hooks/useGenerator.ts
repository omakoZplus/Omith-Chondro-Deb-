
import { useState } from 'react';
import { useCreateStore } from '../stores/useCreateStore';
import { useDataStore } from '../stores/useDataStore';
import { useAppStore } from '../stores/useAppStore';
import { 
    generateSunoPrompts, 
    generateLyrics, 
    generatePromptsFromImage, 
    generateLyricsFromImage, 
    generatePromptsFromAudio, 
    generateLyricsFromAudio 
} from '../services/geminiService';
import { GenerationStatus, GenerationConstraints } from '../types';

export const useGenerator = () => {
    const createStore = useCreateStore();
    const dataStore = useDataStore();
    const appStore = useAppStore();

    const handleGenerate = async () => {
        const { 
            creationMode, themeInput, selectedImage, selectedAudio,
            bpm, keySignature, negativePrompt,
            lyricsModel, lyricsLanguage,
            studioGenre, studioMood, studioVocals, studioInstruments, studioProduction, studioVst, studioInfluences,
            sunoVersion, activeProfileId, promptFormat
        } = createStore;

        const { settings, profiles } = dataStore;

        if ((creationMode !== 'image' && creationMode !== 'audio' && !themeInput.trim() && !studioGenre && !studioMood) || 
            (creationMode === 'image' && !selectedImage) ||
            (creationMode === 'audio' && !selectedAudio)) {
            createStore.setError(creationMode === 'image' ? "Please upload an image" : creationMode === 'audio' ? "Please upload or record audio" : "Please enter a topic or select a genre in Song Studio");
            return;
        }

        createStore.setStatus(GenerationStatus.THINKING);
        createStore.setError(null);
        createStore.setResults({ styles: [], lyrics: null, sources: [] });

        try {
            const finalNegative = [negativePrompt, settings.globalNegativePrompt]
                .filter(Boolean)
                .join(", ");

            const constraints: GenerationConstraints = {
                bpm: bpm || undefined,
                key: keySignature || undefined,
                negativePrompt: finalNegative || undefined
            };

            const commonOptions = {
                temperature: settings.defaultTemperature || 0.8
            };

            // Get active profile description if selected
            let profileContext: string | undefined = undefined;
            if (activeProfileId) {
                const profile = profiles.find(p => p.id === activeProfileId);
                if (profile) {
                    profileContext = `${profile.name}: ${profile.description}`;
                }
            }

            if (creationMode === 'style') {
                // Construct Studio Context - Mega Prompt Context
                const studioParts = [];
                if (studioGenre) studioParts.push(`Primary Genre: ${studioGenre}`);
                if (studioMood) studioParts.push(`Target Mood: ${studioMood}`);
                if (studioVocals) studioParts.push(`Lead Vocals: ${studioVocals}`);
                if (studioInstruments.length > 0) studioParts.push(`Active Instruments: ${studioInstruments.join(', ')}`);
                if (studioProduction.length > 0) studioParts.push(`Production FX: ${studioProduction.join(', ')}`);
                if (studioVst.length > 0) studioParts.push(`Sound Design/VST: ${studioVst.join(', ')}`);
                if (studioInfluences) studioParts.push(`Reference/Vibe: ${studioInfluences}`);
                
                // Add constraints to the context block for better visibility to the LLM
                if (bpm) studioParts.push(`Constraint BPM: ${bpm}`);
                if (keySignature) studioParts.push(`Constraint Key: ${keySignature}`);

                let compositeTheme = "";
                
                if (studioParts.length > 0) {
                    compositeTheme = `[DETAILED SONG STUDIO CONFIGURATION]\nThe user has configured the following details in Song Studio:\n${studioParts.join('\n')}`;
                    
                    if (themeInput) {
                        compositeTheme += `\n\n[USER THEME / ADDITIONAL CONTEXT]\n${themeInput}`;
                    } else {
                        compositeTheme += `\n\n[USER THEME / ADDITIONAL CONTEXT]\nNo specific theme provided, rely strictly on the configuration above.`;
                    }

                    // Check for missing key elements to encourage inference
                    const missingElements = [];
                    if (!studioGenre) missingElements.push("Genre");
                    if (studioInstruments.length === 0) missingElements.push("Specific Instruments");
                    if (studioProduction.length === 0) missingElements.push("Production Techniques");
                    
                    if (missingElements.length > 0) {
                        compositeTheme += `\n\n[AUTO-INFERENCE REQUIRED]\nThe user has NOT specified: ${missingElements.join(', ')}. You MUST creatively infer and select the best ${missingElements.join(', ')} that fit the provided Theme and Vibe. Do not leave them generic.`;
                    }
                } else {
                    // No Studio Usage - Pure Theme
                    compositeTheme = `[USER THEME]\n"${themeInput}"\n\n[AUTO-INFERENCE REQUIRED]\nThe user has NOT selected any options from Song Studio. You MUST analyze the theme above and INFER the most suitable Genre, Instruments, Mood, and Production Techniques to match it. Find instruments that fit well with this specific theme, even if they are unique or niche.`;
                }

                const data = await generateSunoPrompts(compositeTheme, constraints, {
                    ...commonOptions,
                    model: settings.defaultStyleModel || 'pro',
                    useSearch: settings.enableGoogleSearch,
                    enableDeepMode: settings.enableDeepMode,
                    sunoVersion: sunoVersion,
                    profileContext: profileContext,
                    promptFormat: promptFormat // Pass the selected format
                });
                const prompts = data.prompts || [];
                createStore.setResults({ styles: prompts, sources: data.groundingSources });
                dataStore.addToHistory({
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    theme: themeInput || (studioGenre ? `${studioGenre} Track` : 'Custom Style'),
                    type: 'style',
                    prompts: prompts
                });
                
            } else if (creationMode === 'image') {
                if (!selectedImage) throw new Error("No image");
                const outputMode = settings.defaultImageModeOutput;
                
                if (outputMode === 'lyrics') {
                     const data = await generateLyricsFromImage(selectedImage, themeInput, settings.defaultLanguage, constraints, { ...commonOptions, model: settings.defaultStyleModel });
                     createStore.setResults({ lyrics: data });
                     dataStore.addToHistory({
                        id: crypto.randomUUID(),
                        timestamp: Date.now(),
                        theme: themeInput || 'Visual Vibe Match',
                        type: 'image',
                        lyrics: data,
                        imageBase64: selectedImage
                     });
                } else {
                     const data = await generatePromptsFromImage(selectedImage, themeInput, constraints, { ...commonOptions, model: settings.defaultStyleModel });
                     const prompts = data.prompts || [];
                     createStore.setResults({ styles: prompts });
                     dataStore.addToHistory({
                        id: crypto.randomUUID(),
                        timestamp: Date.now(),
                        theme: themeInput || 'Visual Vibe Match',
                        type: 'image',
                        prompts: prompts,
                        imageBase64: selectedImage
                     });
                }

            } else if (creationMode === 'audio') {
                if (!selectedAudio) throw new Error("No audio");
                const outputMode = settings.defaultAudioModeOutput;
                
                if (outputMode === 'lyrics') {
                    const data = await generateLyricsFromAudio(selectedAudio, themeInput, settings.defaultLanguage, commonOptions);
                    createStore.setResults({ lyrics: data });
                    dataStore.addToHistory({
                        id: crypto.randomUUID(),
                        timestamp: Date.now(),
                        theme: themeInput || 'Audio Reference Analysis',
                        type: 'audio',
                        lyrics: data,
                        audioBase64: selectedAudio
                     });
                } else {
                    const data = await generatePromptsFromAudio(selectedAudio, themeInput, constraints, commonOptions);
                    const prompts = data.prompts || [];
                    createStore.setResults({ styles: prompts });
                    dataStore.addToHistory({
                        id: crypto.randomUUID(),
                        timestamp: Date.now(),
                        theme: themeInput || 'Audio Reference Analysis',
                        type: 'audio',
                        prompts: prompts,
                        audioBase64: selectedAudio
                     });
                }
            } else {
                // Lyrics Mode
                const data = await generateLyrics(
                    themeInput, 
                    lyricsModel, 
                    lyricsLanguage, 
                    settings.defaultTemperature,
                    settings.enableGoogleSearch
                );
                createStore.setResults({ lyrics: data, sources: data.groundingSources });
                dataStore.addToHistory({
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    theme: themeInput,
                    type: 'lyrics',
                    lyrics: data
                });
            }
            createStore.setStatus(GenerationStatus.COMPLETE);
        } catch (err: any) {
          console.error(err);
          createStore.setError("Failed to generate. Please check your API key and input.");
          createStore.setStatus(GenerationStatus.ERROR);
          appStore.showToast("Generation failed", "error");
        }
    };

    return { handleGenerate };
};