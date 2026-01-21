
export interface TemplateItem {
  label: string;
  value: string;
  tags?: string[];
}

export const STYLE_CATEGORIES: Record<string, TemplateItem[]> = {
  "Anime & TV": [
    { label: "Shonen Battle (Fast)", value: "High-octane Shonen battle theme, fast-paced electric guitar riffs, double-pedal drumming, intense Japanese rock style.", tags: ["Anime", "Action"] },
    { label: "Anime Opening (Hype)", value: "Modern Anime OP style, catchy synth melodies, powerful female vocals, high energy J-Pop rock hybrid.", tags: ["Anime", "Hype"] },
    { label: "Magical Girl Transform", value: "Sparkling orchestral pop, glockenspiel arpeggios, soaring strings, magical and euphoric atmosphere.", tags: ["Anime", "Fantasy"] },
    { label: "Mecha Launch", value: "Heroic militaristic orchestral, heavy brass section, rhythmic percussion, sense of grand scale and machinery.", tags: ["Anime", "Epic"] },
    { label: "Slice of Life (School)", value: "Cheerful acoustic guitar, light-hearted piano, whistling, upbeat and innocent daily life vibe.", tags: ["Anime", "Happy"] },
    { label: "Touching Reunion", value: "Sentimental piano and solo cello, slow building string orchestra, emotional and nostalgic.", tags: ["Anime", "Sad"] },
    { label: "Villain Monologue", value: "Dark atmospheric orchestral, low string drones, ominous choir chants, threatening and mysterious.", tags: ["Anime", "Dark"] },
    { label: "Cyberpunk Chase", value: "Darksynth and industrial techno fusion, distorted basslines, glitchy textures, high-speed chase vibe.", tags: ["Anime", "Sci-Fi"] },
    { label: "Isekai Adventure", value: "Epic fantasy orchestral with celtic folk influences, tin whistle, fiddle, and grand cinematic builds.", tags: ["Anime", "Adventure"] },
    { label: "Historical Samurai", value: "Traditional Japanese instruments like Shamisen and Taiko drums mixed with cinematic orchestra, tense battle atmosphere.", tags: ["Anime", "Historical"] },
    { label: "Eyecatch Jingle", value: "Short 5-second catchy funk/pop jingle, bright and memorable.", tags: ["Anime", "Short"] },
    { label: "Next Episode Preview", value: "High-speed energetic drum and bass with funky synth leads, 30-second loop style.", tags: ["Anime", "Preview"] }
  ],
  "Game OSTs": [
    { label: "JRPG Battle Theme", value: "Fast-paced JRPG battle music, electric violin, driving rock drums, orchestral hits, heroic melody.", tags: ["Game", "Action"] },
    { label: "JRPG World Map", value: "Sweeping adventurous orchestral theme, marching snare, soaring french horns, sense of discovery.", tags: ["Game", "Adventure"] },
    { label: "Final Boss (Phase 1)", value: "Intense gothic orchestral, pipe organ, fast string ostinatos, high-stakes atmosphere.", tags: ["Game", "Boss"] },
    { label: "Final Boss (Choir)", value: "Apocalyptic battle theme, massive Latin choir, heavy metal guitars, grand orchestral scale.", tags: ["Game", "Epic"] },
    { label: "Fantasy Village", value: "Cozy RPG village theme, acoustic guitar, flute, light percussion, warm and welcoming.", tags: ["Game", "Peaceful"] },
    { label: "Dungeon Ambience", value: "Dark echoing atmosphere, low synth drones, dripping water sounds, distant metallic clangs.", tags: ["Game", "Dark"] },
    { label: "Shop Theme", value: "Kawaii repetitive shop music, marimba, playful percussion, bouncy and cute.", tags: ["Game", "Cute"] },
    { label: "8-Bit Platformer", value: "Retro chiptune, high energy, square wave melodies, bouncy rhythms, NES style.", tags: ["Game", "Retro"] },
    { label: "16-Bit Boss", value: "SNES style 16-bit action music, slap bass samples, aggressive synth brass, energetic drum kit.", tags: ["Game", "Retro"] },
    { label: "Metroidvania Explore", value: "Atmospheric sci-fi, lonely echoing pings, spacious reverb, mysterious synth pads.", tags: ["Game", "Ambient"] },
    { label: "Puzzle Game Focus", value: "Minimalist electronic, soft bleeps, hypnotic rhythm, non-distracting focus music.", tags: ["Game", "Puzzle"] },
    { label: "Gacha Summoning", value: "Glittering orchestral build-up, massive risers, explosive triumphant climax, celebration vibe.", tags: ["Game", "Hype"] },
    { label: "Game Over", value: "Melancholic slow piano melody, fading string pads, sense of defeat and sadness.", tags: ["Game", "Sad"] },
    { label: "Visual Novel Romance", value: "Gentle romantic piano and strings, sentimental and intimate, slow tempo.", tags: ["Game", "Romance"] },
    { label: "Visual Novel Comedy", value: "Silly bouncing pizzicato strings, tuba, comedic timing percussion.", tags: ["Game", "Funny"] }
  ],
  "BGM & Content": [
    { label: "Streamer Lofi", value: "Chill lo-fi hip hop, soft electric piano, dusty drum breaks, rain sounds, cozy streaming background.", tags: ["BGM", "Chill"] },
    { label: "Stream Starting Soon", value: "Upbeat synthwave loop, building energy, neon arpeggios, anticipatory vibe.", tags: ["BGM", "Hype"] },
    { label: "Podcast Intro", value: "Modern funky groove, clean electric guitar, bright brass hits, professional intro style.", tags: ["BGM", "Intro"] },
    { label: "Tech Review", value: "Minimalist corporate techno, digital blips, precise steady beat, clean aesthetic.", tags: ["BGM", "Tech"] },
    { label: "Travel Vlog (Tropical)", value: "Tropical house, steel drums, vocal chops, sunny and optimistic atmosphere.", tags: ["BGM", "Vlog"] },
    { label: "Nature Documentary", value: "Majestic cinematic orchestral, slow building crescendos, awe-inspiring string section.", tags: ["BGM", "Nature"] },
    { label: "True Crime Suspense", value: "Dark drone-based suspense, slow heartbeat rhythm, unsettling sound design.", tags: ["BGM", "Dark"] },
    { label: "Fashion Runway", value: "Deep house, confident strutting rhythm, chic and sophisticated atmosphere.", tags: ["BGM", "Fashion"] },
    { label: "Product Unboxing", value: "Upbeat and quirky funk, sense of discovery, bright and energetic.", tags: ["BGM", "Funky"] },
    { label: "Elevator Muzak", value: "Cheesy bossa nova, synthesized flute melody, lounge style, humorous background.", tags: ["BGM", "Funny"] }
  ],
  "Pop & Electronic": [
    { label: "Synthwave", value: "High-energy synthwave/retrowave track for night driving, with pulsing analog bass, gated reverb drums, and neon arpeggios.", tags: ["Electronic", "Retro"] },
    { label: "Lo-Fi Chill", value: "Chill lo-fi hip hop beats with rainy ambience, soft piano jazz chords, and a nostalgic vinyl crackle.", tags: ["Relaxing", "Hip Hop"] },
    { label: "Upbeat Pop", value: "A catchy, radio-ready summer pop anthem with funky guitar riffs, a driving bassline, and an infectious chorus.", tags: ["Pop", "Happy"] },
    { label: "Future Bass", value: "Melodic future bass with huge supersaw chords, vocal chops, heavy sidechain compression, and kawaii vibes.", tags: ["Electronic", "Happy"] },
    { label: "Hyperpop", value: "Chaotic, high-pitched hyperpop with distorted bass, metallic snares, glitch effects, and autotuned vocals.", tags: ["Electronic", "Chaotic"] },
    { label: "City Pop", value: "80s Japanese City Pop with funk basslines, sparkling synths, brass hits, and a breezy summer vibe.", tags: ["Pop", "Retro"] }
  ],
  "Rock & Metal": [
    { label: "Alt Rock", value: "Gritty alternative rock with distorted guitars, driving drums, and angst-filled vocals.", tags: ["Rock", "Raw"] },
    { label: "Pop Punk", value: "Fast-paced pop punk with power chords, catchy melodies, teenage angst lyrics, and energetic drumming.", tags: ["Rock", "Energetic"] },
    { label: "Shoegaze", value: "Wall of sound distortion, buried vocals, endless reverb/delay pedals, and a dreamy atmosphere.", tags: ["Rock", "Dreamy"] },
    { label: "Midwest Emo", value: "Twinkly clean guitar tapping, math-rock time signatures, emotional raw vocals, and dynamic shifts.", tags: ["Rock", "Emotional"] },
    { label: "Djent", value: "Technical metal with syncopated, palm-muted rhythms, extended range guitars, and polished production.", tags: ["Metal", "Technical"] }
  ]
};

export const LYRICS_STRUCTURES = [
  { label: "Standard Pop Song", value: "[Intro] -> [Verse 1] -> [Pre-Chorus] -> [Chorus] -> [Verse 2] -> [Pre-Chorus] -> [Chorus] -> [Bridge] -> [Chorus] -> [Outro]" },
  { label: "Anime Opening (TV Size)", value: "[Intro] -> [Verse 1] -> [Pre-Chorus] -> [Chorus] -> [Post-Chorus] -> [Outro]" },
  { label: "Rap Song", value: "[Intro] -> [Verse 1 (16 bars)] -> [Hook] -> [Verse 2 (16 bars)] -> [Hook] -> [Outro]" },
  { label: "EDM Build & Drop", value: "[Intro] -> [Verse 1] -> [Build-up] -> [Drop (Minimal Vocals)] -> [Verse 2] -> [Build-up] -> [Drop] -> [Outro]" }
];

export const LYRICS_TOPICS = [
  { label: "Heartbreak", value: "The raw pain of a sudden breakup, rain against the window, empty room." },
  { label: "Joy / Celebration", value: "Pure happiness, dancing all night, forgetting worries, good vibes." },
  { label: "Cyberpunk Rebellion", value: "A hacker fighting against a corrupt mega-corporation in a neon-soaked city." },
  { label: "Viking Raid", value: "Warriors sailing across the stormy sea to conquer new lands, chanting to Odin." }
];
