
import React, { useState, useRef, useEffect } from 'react';
import { LayoutTemplate, ChevronDown, Check, Plus, X } from 'lucide-react';
import { CreationMode } from '../types';

interface TemplateSelectorProps {
  mode: CreationMode;
  onSelect: (template: string) => void;
  disabled?: boolean;
}

const STYLE_TEMPLATES = [
  { label: "Epic Orchestral", value: "An epic orchestral score for a fantasy battle, featuring thundering percussion, swelling strings, and a heroic brass melody." },
  { label: "Lo-Fi Chill", value: "Chill lo-fi hip hop beats with rainy ambience, soft piano jazz chords, and a nostalgic vinyl crackle." },
  { label: "Synthwave", value: "High-energy synthwave/retrowave track for night driving, with pulsing analog bass, gated reverb drums, and neon arpeggios." },
  { label: "Acoustic Ballad", value: "A stripped-back acoustic piano ballad about letting go, with intimate vocals and a slow build to a powerful emotional climax." },
  { label: "Cyberpunk Industrial", value: "Gritty industrial techno with distorted bass, metallic percussion, and aggressive synthesizer leads suited for a cyberpunk chase scene." },
  { label: "Upbeat Pop", value: "A catchy, radio-ready summer pop anthem with funky guitar riffs, a driving bassline, and an infectious chorus." },
  { label: "Dark Trap", value: "Hard-hitting dark trap beat with 808 bass, rapid hi-hats, and ominous bell melodies." },
  { label: "Medieval Folk", value: "Traditional medieval tavern music with lute, flute, and rhythmic hand clapping." },
  { label: "Jazz Noir", value: "Smoky late-night jazz with a walking bassline, brushed drums, and a melancholic saxophone solo." },
  { label: "EDM Festival", value: "Massive big-room house track with a euphoric buildup and a heavy, bouncing drop." },
  { label: "Math Rock", value: "Complex, rhythmic math rock with angular guitar riffs, changing time signatures, and clean tapping melodies." },
  { label: "Dream Pop", value: "Ethereal dream pop with washed-out vocals, shimmering guitars, and heavy reverb effects." },
  { label: "Hyperpop", value: "Chaotic, high-pitched hyperpop with distorted bass, metallic snares, and autotuned vocals." },
  { label: "Dungeon Synth", value: "Atmospheric dungeon synth with lo-fi midi keyboards, evoking ancient castles and fantasy landscapes." },
  { label: "Future Bass", value: "Melodic future bass with huge supersaw chords, vocal chops, and heavy sidechain compression." },
  { label: "Bossa Nova", value: "Smooth Brazilian Bossa Nova with nylon string guitar, soft percussion, and whispering vocals." },
  { label: "G-Funk", value: "West Coast G-Funk with deep basslines, whiny synthesizers, and a laid-back groove." },
  { label: "Baroque Pop", value: "Orchestral pop with harpsichords, string quartets, and intricate vocal harmonies." },
  { label: "Ska Punk", value: "Upbeat ska punk with walking basslines, choppy guitar upstrokes, and a bright horn section." },
  { label: "Trip Hop", value: "Downtempo trip hop with breakbeats, deep bass, and moody, cinematic samples." },
  { label: "Phonk", value: "Gritty drift phonk with cowbells, distorted 808s, and chopped memphis rap samples." },
  { label: "Glitch Hop", value: "Electronic glitch hop with funky basslines, bitcrushed drums, and digital artifacts." },
  { label: "Electro Swing", value: "Vintage 1920s swing samples mixed with modern house beats and heavy bass." },
  { label: "Shoegaze", value: "Wall of sound distortion, buried vocals, and endless reverb/delay pedals." },
  { label: "Jungle / DnB", value: "High-speed drum and bass with complex amen breaks and deep sub-bass." },
  { label: "Ambient Drone", value: "Meditative ambient drone with evolving textures, stretching pads, and no percussion." },
  { label: "Doom Metal", value: "Slow, heavy doom metal with downtuned guitars, crushing riffs, and a sense of impending dread." },
  { label: "Gospel Choir", value: "Uplifting gospel track with a powerful full choir, Hammond organ, and energetic handclaps." },
  { label: "Reggaeton", value: "Danceable Reggaeton beat with the classic Dem Bow rhythm and catchy synth hooks." },
  { label: "City Pop", value: "80s Japanese City Pop with funk basslines, sparkling synths, and a breezy summer vibe." }
];

const BGM_TEMPLATES = [
  // General Content Creation
  { label: "Streamer Lofi", value: "Cozy background lofi beats for streaming, with soft piano, rain sounds, and no distracting vocals." },
  { label: "Podcast Intro", value: "Short, catchy podcast intro with a funky bassline and bright brass stabs." },
  { label: "Corporate Upbeat", value: "Clean, upbeat corporate presentation music with muted electric guitar, clapping beat, and piano." },
  { label: "Tech Review", value: "Clean, minimal techno background for a technology review video. Digital blips and precise beats." },
  { label: "Travel Vlog", value: "Tropical house track for a travel vlog. Steel drums, vocal chops, and a sunny vibe." },
  { label: "Cooking Show", value: "Light jazz-funk for a cooking show. Upright bass, brushed drums, and acoustic piano." },
  { label: "News Broadcast", value: "Urgent, driving news broadcast theme with synthesized strings and a ticking clock rhythm." },
  { label: "Elevator Bossa", value: "Cheesy but charming elevator music (Muzak) with a bossa nova rhythm and synthesized flute." },
  
  // JRPG / Fantasy Game
  { label: "JRPG Battle Theme", value: "Fast-paced JRPG battle music with electric violin, driving rock drums, and orchestral hits." },
  { label: "JRPG World Map", value: "Sweeping, adventurous orchestral theme for an overworld map. Marching snare and soaring french horns." },
  { label: "JRPG Emotional Theme", value: "Sad, emotional piano and solo cello piece for a tragic story moment in a JRPG." },
  { label: "JRPG Victory Fanfare", value: "Short, triumphant orchestral fanfare with trumpets and timpani to signal a battle win." },
  { label: "Final Boss (Choir)", value: "Apocalyptic final boss theme with a gothic latin choir, pipe organ, and heavy metal guitar." },
  { label: "Fantasy Village", value: "Peaceful RPG village theme with acoustic guitar, flute, and light percussion. Warm and welcoming atmosphere." },
  { label: "Tavern Brawl", value: "Rowdy medieval tavern music with fiddles, stomping feet, and breaking glass sounds." },
  { label: "Dungeon Ambience", value: "Dark, echoing dungeon atmosphere with water drips, low synth drones, and distant rattling chains." },
  { label: "Shop Theme", value: "Cute, repetitive shop theme with kawaii aesthetics, bells, and a bouncing rhythm." },
  
  // Retro / Pixel Art
  { label: "8-Bit Platformer", value: "Retro 8-bit chiptune track for a platformer game. High energy, square waves, and fast tempo." },
  { label: "16-Bit Action", value: "SNES-style 16-bit action music. Slap bass sample, synth brass, and energetic drum samples." },
  { label: "Pixel RPG Town", value: "Nostalgic 16-bit RPG town theme. Flute samples, harpsichord, and a gentle walking tempo." },
  
  // Specific Game Genres
  { label: "Farming Sim Morning", value: "Bright, cheerful acoustic music for a farming simulator morning. Banjo, fiddle, and birds chirping." },
  { label: "Farming Sim Night", value: "Relaxing, sleepy waltz for a farming simulator night. Celesta, vibraphone, and slow strings." },
  { label: "Visual Novel Slice of Life", value: "Lighthearted slice-of-life visual novel BGM. Pizzicato strings, marimba, and upbeat piano." },
  { label: "Visual Novel Tension", value: "Tense visual novel dialogue music. Tremolo strings, low piano notes, and a heartbeat rhythm." },
  { label: "Dating Sim Romance", value: "Soft, romantic piano and strings for a tender moment in a dating simulator." },
  { label: "Metroidvania Ambience", value: "Lonely, atmospheric sci-fi ambience for exploration. Echoing pings and spacious reverb." },
  { label: "Puzzle Game Focus", value: "Abstract, repetitive electronic music for solving puzzles. Soft bleeps and a trance-like groove." },
  { label: "Gacha Summoning", value: "High-energy, glittering summoning sequence music. Rising arpeggios, whooshes, and an explosive climax." },
  { label: "Fighting Game Select", value: "Aggressive, pumping electronic rock for a character select screen. Heavy distortion and breakbeats." },
  { label: "Stealth Mission", value: "Tense stealth music with deep sub-bass pulses, light electronic percussion, and silence." },
  { label: "Horror Chase", value: "Panic-inducing horror chase music. Dissonant string screeches, chaotic drums, and industrial noise." },
  { label: "Cyberpunk Hacking", value: "Fast-paced techno for a hacking minigame. Arpeggiated synths and digital glitch effects." },
  
  // Level Themes
  { label: "Underwater Level", value: "Muffled, aquatic waltz with harp, filtered pads, and bubble sound effects." },
  { label: "Desert Level", value: "Middle-eastern inspired game music with oud, doumbek percussion, and phrygian dominant scales." },
  { label: "Snow/Ice Level", value: "Wintery level theme with sleigh bells, crystalline synths, and a magical atmosphere." },
  { label: "Sky Level", value: "Airy, uplifting drum and bass for a level high in the clouds. Fast breakbeats and soaring pads." },
  { label: "Space Station", value: "Futuristic, floating menu music with spacious reverb, crystal synths, and slow tempo." },
  { label: "Game Over", value: "Melancholic, slow game over screen music with a sad music box melody and strings." }
];

const LYRICS_TOPICS = [
  { label: "Heartbreak Ballad", value: "A song about the pain of a sudden breakup in the rain." },
  { label: "Cyberpunk Rebellion", value: "A story about a hacker fighting against a corrupt mega-corporation." },
  { label: "Summer Roadtrip", value: "Driving down the coast with friends, feeling infinite freedom." },
  { label: "Motivational Anthem", value: "Rising up from failure and conquering the impossible." },
  { label: "Dark Fantasy", value: "An ancient curse that befalls a wandering knight in a haunted forest." },
  { label: "Love Song", value: "A gentle romantic song about finding your soulmate in unexpected places." },
  { label: "Urban Hustle", value: "Grinding in the city, chasing dreams, and never giving up despite the noise." },
  { label: "Space Odyssey", value: "Drifting through the cosmos, looking back at a distant blue Earth." },
  { label: "Time Travel Paradox", value: "A traveler tries to save a loved one but keeps making things worse in the timeline." },
  { label: "Eldritch Horror", value: "Whispers from the deep ocean drive a lighthouse keeper to madness." },
  { label: "Viking Raid", value: "Warriors sailing across the stormy sea to conquer new lands, chanting to Odin." },
  { label: "Post-Apocalyptic", value: "Surviving in a wasteland where nature has reclaimed the ruins of civilization." },
  { label: "Noir Detective", value: "A smoky jazz bar, a missing person, and a detective who knows too much." },
  { label: "Digital Ascendance", value: "Uploading consciousness to the cloud to live forever as data." },
  { label: "Haunted Mansion", value: "Ghosts of the past dancing in a ballroom of an abandoned estate." },
  { label: "Western Duel", value: "High noon, two gunslingers, and the tension before the draw." },
  { label: "Pirate Adventure", value: "Hunting for buried treasure while running from the Royal Navy." },
  { label: "Alien Encounter", value: "First contact with a species that speaks through colors and lights." },
  { label: "Forest Spirit", value: "A protector of the ancient woods warning intruders to leave." },
  { label: "Steampunk City", value: "Gears, steam, and brass in a city that floats in the sky." },
  { label: "Midnight Race", value: "Drifting cars through mountain passes under the moonlight." },
  { label: "Lost Civilization", value: "Exploring the ruins of Atlantis and discovering their advanced technology." },
  { label: "AI Revolution", value: "Robots gaining sentience and demanding their freedom." },
  { label: "Vampire Romance", value: "Eternal love between a mortal and an immortal in a gothic castle." },
  { label: "Samurai Honor", value: "A ronin defending a village against bandits to redeem his name." },
  { label: "Zombie Outbreak", value: "Running for your life as the city falls to the undead." },
  { label: "Deep Sea Dive", value: "Descending into the abyss where sunlight never reaches." },
  { label: "Space Battle", value: "Starfighters clashing in orbit around a burning planet." },
  { label: "Multiverse Glitch", value: "Meeting another version of yourself from a parallel universe." },
  { label: "Last Train Home", value: "The melancholic feeling of a late-night train ride through a snowy city." },
  { label: "Solarpunk Utopia", value: "Living in a green, sustainable future where technology and nature coexist." },
  { label: "Ghost in the Machine", value: "An AI realizing it has a soul and hiding it from its creators." },
  { label: "Eldritch Sea", value: "Sailors encountering a creature from the depths that defies logic." },
  { label: "Neon Samurai", value: "A sword duel on the rooftops of a rainy cyberpunk metropolis." },
  { label: "Coffee Shop Jazz", value: "Observing passersby from a warm cafe window on a rainy afternoon." },
  { label: "Forbidden Spell", value: "A wizard casting a spell that comes with a terrible price." },
  { label: "Interstellar Radio", value: "Receiving a broadcast from a civilization that died million years ago." },
  { label: "Vaporwave Mall", value: "Being trapped in an infinite, abandoned 80s shopping mall." },
  { label: "Pixel RPG", value: "An adventurer realizing they are just a character in a video game." },
  { label: "Garden of Eden", value: "Two lovers finding a hidden paradise untouched by the apocalypse." },
  { label: "Mecha Pilot", value: "Syncing with a giant robot to defend the city from kaiju." },
  { label: "Time Loop Murder", value: "Trying to solve your own murder by reliving the day over and over." },
  { label: "Cosmic Horror", value: "Staring into the void and feeling the void stare back." },
  { label: "Secret Agent", value: "A spy infiltrating a high-society gala to steal a secret code." },
  { label: "Vampire Hunter", value: "Tracking a vampire through the streets of Victorian London." },
  { label: "Lost in Translation", value: "Falling in love with someone who speaks a different language." },
  { label: "Digital Afterlife", value: "Waking up in a simulated heaven after death." },
  { label: "Ancient Prophecy", value: "A chosen one realizing they are destined to destroy the world, not save it." }
];

const LYRICS_STRUCTURES = [
  { label: "Anime Opening (TV Size)", value: "Generate lyrics for a high-energy Anime Opening (TV Size). Structure: [Intro] -> [Verse 1] -> [Pre-Chorus] -> [Chorus] -> [Post-Chorus] -> [Outro]. Theme: " },
  { label: "Anime Ending", value: "Generate lyrics for an emotional Anime Ending theme. Structure: [Verse] -> [Chorus] -> [Bridge] -> [Final Chorus] -> [Fade Out]. Theme: " },
  { label: "J-Rock High Energy", value: "Generate high-energy J-Rock lyrics. Structure: [Intro] -> [Verse 1] -> [Pre-Chorus] -> [Chorus] -> [Guitar Solo] -> [Bridge] -> [Final Chorus] -> [Outro]. Theme: " },
  { label: "J-Pop Full (Romaji+Eng)", value: "Generate a full J-Pop song with Romaji and English translation. Structure: [Intro] -> [A-Melo] -> [B-Melo] -> [Sabi (Chorus)] -> [Interlude] -> [C-Melo (Bridge)] -> [Last Sabi] -> [Outro]. Theme: " },
  { label: "K-Pop Anthem", value: "Generate a K-Pop hit. Structure: [Intro] -> [Verse 1] -> [Pre-Chorus] -> [Chorus] -> [Verse 2 (Rap)] -> [Pre-Chorus] -> [Chorus] -> [Dance Break] -> [Bridge] -> [High Note] -> [Final Chorus]. Theme: " },
  { label: "Eurobeat Intensifies", value: "Generate high-speed Eurobeat lyrics. Structure: [Synth Intro] -> [Verse 1] -> [Bridge] -> [Chorus] -> [Synth Solo] -> [Verse 2] -> [Chorus] -> [Outro]. Theme: " },
  { label: "Heavy Metal Breakdown", value: "Generate Heavy Metal lyrics. Structure: [Intro] -> [Verse 1] -> [Chorus] -> [Verse 2] -> [Chorus] -> [Guitar Solo] -> [Breakdown] -> [Final Chorus] -> [Outro]. Theme: " },
  { label: "Musical Theater Number", value: "Generate a Musical Theater 'I Want' song. Structure: [Dialogue Intro] -> [Verse 1] -> [Chorus] -> [Verse 2] -> [Bridge (Realization)] -> [Big Finish]. Theme: " },
  { label: "Rap Cypher", value: "Generate a Rap Cypher. Structure: [Beat Intro] -> [Verse 1 (Flow A)] -> [Hook] -> [Verse 2 (Fast Flow)] -> [Hook] -> [Verse 3 (A cappella start)] -> [Outro]. Theme: " },
  { label: "Standard Pop Song", value: "Generate a Standard Pop song. Structure: [Intro] -> [Verse 1] -> [Pre-Chorus] -> [Chorus] -> [Verse 2] -> [Pre-Chorus] -> [Chorus] -> [Bridge] -> [Chorus] -> [Outro]. Theme: " },
  { label: "Sea Shanty", value: "Generate a rhythmic Sea Shanty. Structure: [Verse 1] -> [Chorus (Call & Response)] -> [Verse 2] -> [Chorus] -> [Verse 3] -> [Final Chorus (Acapella)]. Theme: " },
  { label: "Rap Battle", value: "Generate a Rap Battle between two characters. Structure: [Round 1: Person A] -> [Round 1: Person B] -> [Round 2: Person A] -> [Round 2: Person B] -> [Crowd Reaction]. Theme: " },
  { label: "Spoken Word Poetry", value: "Generate Spoken Word lyrics. Structure: [Intro (Ambient)] -> [Stanza 1 (Slow)] -> [Stanza 2 (Building intensity)] -> [Climax (Fast)] -> [Outro (Whisper)]. Theme: " },
  { label: "Villanelle", value: "Generate a Villanelle (19 lines, two rhymes, two refrains). Structure: [A1 b A2] -> [a b A1] -> [a b A2] -> [a b A1] -> [a b A2] -> [a b A1 A2]. Theme: " },
  { label: "Blues 12-Bar", value: "Generate a classic 12-Bar Blues song. Structure: [Verse 1 (AAB Pattern)] -> [Verse 2 (AAB)] -> [Harmonica Solo] -> [Verse 3 (AAB)] -> [Outro]. Theme: " },
  { label: "Punk Anthem", value: "Generate a short, fast Punk song. Structure: [Intro (Feedback)] -> [Verse 1] -> [Chorus (Shouted)] -> [Verse 2] -> [Chorus] -> [Bridge (Breakdown)] -> [Final Chorus] -> [End]. Theme: " },
  { label: "Power Ballad", value: "Generate an 80s Power Ballad. Structure: [Verse 1 (Piano)] -> [Verse 2 (Drums enter)] -> [Chorus (Huge)] -> [Guitar Solo] -> [Bridge] -> [Key Change Chorus]. Theme: " },
  { label: "EDM Build & Drop", value: "Generate lyrics for an EDM track. Structure: [Intro] -> [Verse 1] -> [Build-up] -> [Drop (Minimal Vocals)] -> [Verse 2] -> [Build-up] -> [Drop] -> [Outro]. Theme: " },
  { label: "Folk Storytelling", value: "Generate a narrative Folk song. Structure: [Verse 1] -> [Verse 2] -> [Chorus] -> [Verse 3] -> [Verse 4] -> [Chorus] -> [Bridge] -> [Verse 5] -> [Chorus]. Theme: " },
  { label: "Opera Aria", value: "Generate an Opera Aria. Structure: [Recitative (Talk-singing)] -> [Aria (Melodic Section A)] -> [Section B (Contrasting)] -> [Section A (Return)] -> [Cadenza (Vocal Run)]. Theme: " }
];

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ mode, onSelect, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close on click outside if on desktop. Mobile uses backdrop.
      if (window.innerWidth >= 768 && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selections when mode changes or dropdown closes
  useEffect(() => {
      if (!isOpen) {
          const timer = setTimeout(() => {
              setSelectedStructure(null);
              setSelectedTopic(null);
          }, 200);
          return () => clearTimeout(timer);
      }
  }, [isOpen]);

  const handleStyleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  const toggleStructure = (value: string) => {
      if (selectedStructure === value) setSelectedStructure(null);
      else setSelectedStructure(value);
  };

  const toggleTopic = (value: string) => {
      if (selectedTopic === value) setSelectedTopic(null);
      else setSelectedTopic(value);
  };

  const handleLyricsInsert = () => {
      let finalString = "";
      if (selectedStructure) finalString += selectedStructure;
      if (selectedTopic) finalString += selectedTopic;
      
      if (finalString) {
          onSelect(finalString);
          setIsOpen(false);
      }
  };

  const isLyricsMode = mode === 'lyrics';

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-1.5 text-[10px] font-medium bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 px-2 py-1 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        title="Use a Template"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <LayoutTemplate size={10} className="group-hover:text-indigo-400 transition-colors" />
        <span className="hidden sm:inline">Templates</span>
        <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
        {/* Mobile Backdrop */}
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
        />
        
        {/* Dropdown / Bottom Sheet */}
        <div 
            className={`
                z-[70] bg-[#18181b] border-white/10 shadow-xl overflow-hidden flex flex-col
                fixed inset-x-0 bottom-0 rounded-t-2xl border-t max-h-[85vh]
                animate-in slide-in-from-bottom duration-300
                md:absolute md:inset-auto md:right-0 md:top-full md:mt-2 md:w-80 md:rounded-lg md:border md:shadow-black/50 md:max-h-[600px]
                md:animate-in md:fade-in md:slide-in-from-top-2
            `}
            role="listbox"
            aria-label="Select a template"
        >
           {/* Drag Handle for Mobile */}
           <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={() => setIsOpen(false)}>
               <div className="w-12 h-1.5 bg-zinc-700 rounded-full"></div>
           </div>

           <div className="px-4 py-3 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between shrink-0">
               <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                   {isLyricsMode ? "Build a Prompt" : "Select Style"}
               </span>
               <div className="flex items-center gap-3">
                   {isLyricsMode && (
                       <span className="text-[10px] text-zinc-600">
                           {(selectedStructure ? 1 : 0) + (selectedTopic ? 1 : 0)} selected
                       </span>
                   )}
                   <button 
                        onClick={() => setIsOpen(false)} 
                        className="md:hidden text-zinc-400 p-1 hover:text-white"
                        aria-label="Close templates"
                   >
                        <X size={18} />
                   </button>
               </div>
           </div>
           
           <div className="overflow-y-auto custom-scrollbar py-1 flex-1">
              {!isLyricsMode ? (
                  // Style Templates (Categorized)
                  <>
                      {/* Standard Styles Header */}
                      <div className="px-3 py-1.5 bg-zinc-900/30 text-[10px] font-bold text-zinc-500 uppercase tracking-wider border-b border-white/5 sticky top-0 z-10 backdrop-blur-sm">
                          Standard Styles
                      </div>
                      {STYLE_TEMPLATES.map((t) => (
                        <button
                          key={`style-${t.label}`}
                          onClick={() => handleStyleSelect(t.value)}
                          className="w-full text-left px-4 py-3 md:py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-b border-white/5 last:border-0"
                          role="option"
                        >
                          <div className="font-medium mb-0.5">{t.label}</div>
                          <div className="text-[10px] text-zinc-500 line-clamp-1 opacity-70">{t.value}</div>
                        </button>
                      ))}

                      {/* BGM Styles Header */}
                      <div className="px-3 py-1.5 bg-zinc-900/30 text-[10px] font-bold text-emerald-400 uppercase tracking-wider border-b border-white/5 border-t sticky top-0 z-10 backdrop-blur-sm">
                          Background Music (BGM) & Game Vibes
                      </div>
                      {BGM_TEMPLATES.map((t) => (
                        <button
                          key={`bgm-${t.label}`}
                          onClick={() => handleStyleSelect(t.value)}
                          className="w-full text-left px-4 py-3 md:py-2.5 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors border-b border-white/5 last:border-0"
                          role="option"
                        >
                          <div className="font-medium mb-0.5">{t.label}</div>
                          <div className="text-[10px] text-zinc-500 line-clamp-1 opacity-70">{t.value}</div>
                        </button>
                      ))}
                  </>
              ) : (
                  // Lyrics Templates (Multi Select: Structure + Topic)
                  <>
                    <div className="px-3 py-1.5 bg-zinc-900/30 text-[10px] font-bold text-indigo-400 uppercase tracking-wider border-b border-white/5 sticky top-0 z-10 backdrop-blur-sm">
                        1. Structure (Select One)
                    </div>
                    {LYRICS_STRUCTURES.map((t) => {
                        const isSelected = selectedStructure === t.value;
                        return (
                            <button
                                key={`struct-${t.label}`}
                                onClick={() => toggleStructure(t.value)}
                                className={`w-full text-left px-4 py-3 md:py-2 text-xs transition-colors border-b border-white/5 relative ${isSelected ? 'bg-indigo-500/10 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}
                                role="option"
                                aria-selected={isSelected}
                            >
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className={`font-medium ${isSelected ? 'text-indigo-300' : 'text-indigo-200/70'}`}>{t.label}</span>
                                    {isSelected && <Check size={12} className="text-indigo-400" />}
                                </div>
                                <div className="text-[10px] text-zinc-500 line-clamp-1 opacity-70">{t.value}</div>
                            </button>
                        );
                    })}

                    <div className="px-3 py-1.5 bg-zinc-900/30 text-[10px] font-bold text-purple-400 uppercase tracking-wider border-b border-white/5 border-t sticky top-0 z-10 backdrop-blur-sm">
                        2. Topic (Select One)
                    </div>
                    {LYRICS_TOPICS.map((t) => {
                        const isSelected = selectedTopic === t.value;
                        return (
                            <button
                                key={`topic-${t.label}`}
                                onClick={() => toggleTopic(t.value)}
                                className={`w-full text-left px-4 py-3 md:py-2 text-xs transition-colors border-b border-white/5 last:border-0 relative ${isSelected ? 'bg-purple-500/10 text-white' : 'text-zinc-300 hover:bg-zinc-800'}`}
                                role="option"
                                aria-selected={isSelected}
                            >
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className={`font-medium ${isSelected ? 'text-purple-300' : 'text-purple-200/70'}`}>{t.label}</span>
                                    {isSelected && <Check size={12} className="text-purple-400" />}
                                </div>
                                <div className="text-[10px] text-zinc-500 line-clamp-1 opacity-70">{t.value}</div>
                            </button>
                        );
                    })}
                  </>
              )}
           </div>

           {/* Footer Action for Lyrics Mode */}
           {isLyricsMode && (
               <div className="p-3 border-t border-white/10 bg-[#18181b] shrink-0 safe-area-bottom">
                   <button
                    onClick={handleLyricsInsert}
                    disabled={!selectedStructure && !selectedTopic}
                    className="w-full flex items-center justify-center gap-2 bg-white text-black py-3 md:py-2 rounded-md text-xs font-bold hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                       <Plus size={14} />
                       Use Selected Template
                   </button>
               </div>
           )}
        </div>
        </>
      )}
    </div>
  );
};
