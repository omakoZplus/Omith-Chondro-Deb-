
import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Music, Mic, StopCircle, Mic2, Camera } from 'lucide-react';
import { useCreateStore } from '../../stores/useCreateStore';
import { useAppStore } from '../../stores/useAppStore';

export const MediaInput: React.FC = () => {
    const { 
        creationMode, selectedImage, selectedAudio, 
        setSelectedImage, setSelectedAudio, setError 
    } = useCreateStore();
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError("Image too large. Max 5MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            const base64 = result.split(',')[1];
            setSelectedImage(base64);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            setError("Audio too large. Max 10MB.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result as string;
            const base64 = result.split(',')[1];
            setSelectedAudio(base64);
            setError(null);
        };
        reader.readAsDataURL(file);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];
    
            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/mp3' });
                const reader = new FileReader();
                reader.onloadend = () => {
                    const result = reader.result as string;
                    const base64 = result.split(',')[1];
                    setSelectedAudio(base64);
                };
                reader.readAsDataURL(blob);
                stream.getTracks().forEach(track => track.stop());
            };
    
            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            setIsRecording(true);
        } catch (err) {
            console.error(err);
            setError("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, callback: () => void) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            callback();
        }
    };

    if (creationMode !== 'image' && creationMode !== 'audio') return null;

    return (
        <div className="px-4 pt-4 pb-2">
            {creationMode === 'image' && (
                !selectedImage ? (
                    <>
                        {/* Desktop View */}
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            onKeyDown={(e) => handleKeyDown(e, () => fileInputRef.current?.click())}
                            className="hidden md:flex border-2 border-dashed border-zinc-700 hover:border-indigo-500/50 bg-zinc-900/50 hover:bg-zinc-900 rounded-xl p-8 flex-col items-center justify-center cursor-pointer transition-all group min-h-[160px]"
                            role="button"
                            tabIndex={0}
                            aria-label="Upload Image"
                        >
                            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Upload size={20} className="text-zinc-400 group-hover:text-white" />
                            </div>
                            <p className="text-sm font-medium text-zinc-300">Click to upload an image</p>
                            <p className="text-xs text-zinc-500 mt-1">or drag and drop (Max 5MB)</p>
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden flex gap-2">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 bg-zinc-800 border border-white/10 rounded-xl p-3 flex items-center justify-center gap-3 hover:bg-zinc-700 transition-colors"
                            >
                                <Camera size={18} className="text-zinc-300" />
                                <span className="text-sm font-medium text-zinc-200">Upload Image</span>
                            </button>
                        </div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                        />
                    </>
                 ) : (
                     <>
                        {/* Desktop View */}
                        <div className="hidden md:flex relative rounded-xl overflow-hidden border border-white/10 group bg-black min-h-[200px] items-center justify-center">
                            <img 
                                src={`data:image/jpeg;base64,${selectedImage}`} 
                                alt="Preview" 
                                className="max-h-[300px] w-auto object-contain" 
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <button 
                                    onClick={() => { setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                    className="bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all"
                                >
                                    <X size={16} /> Remove Image
                                </button>
                            </div>
                        </div>

                        {/* Mobile Compact View */}
                        <div className="md:hidden flex items-center gap-3 bg-zinc-900 border border-white/10 p-3 rounded-xl">
                            <img 
                                src={`data:image/jpeg;base64,${selectedImage}`} 
                                alt="Preview" 
                                className="w-12 h-12 rounded object-cover border border-white/10" 
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">Image Loaded</p>
                                <p className="text-[10px] text-zinc-500">Ready for analysis</p>
                            </div>
                            <button 
                                onClick={() => { setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:text-white"
                                aria-label="Remove image"
                            >
                                <X size={16} />
                            </button>
                        </div>
                     </>
                 )
            )}

            {creationMode === 'audio' && (
                 !selectedAudio ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div 
                            onClick={() => audioInputRef.current?.click()}
                            onKeyDown={(e) => handleKeyDown(e, () => audioInputRef.current?.click())}
                            className="border-2 border-dashed border-zinc-700 hover:border-indigo-500/50 bg-zinc-900/50 hover:bg-zinc-900 rounded-xl p-4 md:p-6 flex flex-row md:flex-col items-center justify-center gap-3 md:gap-0 cursor-pointer transition-all group min-h-[60px] md:min-h-[140px]"
                            role="button"
                            tabIndex={0}
                            aria-label="Upload Audio File"
                         >
                             <div className="md:mb-2 text-zinc-400 group-hover:text-white">
                                <Upload size={20} />
                             </div>
                             <p className="text-sm font-medium text-zinc-300">Upload File</p>
                             <input 
                                type="file" 
                                ref={audioInputRef} 
                                className="hidden" 
                                accept="audio/*" 
                                onChange={handleAudioUpload}
                             />
                         </div>
                         <div 
                            className={`border-2 border-dashed border-zinc-700 ${isRecording ? 'border-red-500/50 bg-red-500/5' : 'hover:border-indigo-500/50 bg-zinc-900/50 hover:bg-zinc-900'} rounded-xl p-4 md:p-6 flex flex-row md:flex-col items-center justify-center gap-3 md:gap-0 cursor-pointer transition-all min-h-[60px] md:min-h-[140px]`}
                            onClick={isRecording ? stopRecording : startRecording}
                            onKeyDown={(e) => handleKeyDown(e, isRecording ? stopRecording : startRecording)}
                            role="button"
                            tabIndex={0}
                            aria-label={isRecording ? "Stop Recording" : "Start Recording Microphone"}
                         >
                             <div className={`w-10 h-10 md:w-auto md:h-auto rounded-full flex items-center justify-center md:mb-2 transition-all ${isRecording ? 'bg-red-500 animate-pulse text-white' : 'bg-transparent text-zinc-400'}`}>
                                 {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                             </div>
                             <p className="text-sm font-medium text-zinc-300">{isRecording ? "Stop" : "Record Mic"}</p>
                         </div>
                    </div>
                 ) : (
                     <div className="relative rounded-xl border border-white/10 p-4 md:p-6 bg-zinc-900 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                 <Music size={20} className="text-purple-400" />
                             </div>
                             <div>
                                 <p className="text-sm font-bold text-white">Audio Clip Loaded</p>
                                 <p className="text-xs text-zinc-500">Ready for analysis</p>
                             </div>
                         </div>
                         <button 
                            onClick={() => { setSelectedAudio(null); if (audioInputRef.current) audioInputRef.current.value = ""; }}
                            className="text-zinc-500 hover:text-white transition-colors"
                            aria-label="Remove audio"
                         >
                             <X size={20} />
                         </button>
                     </div>
                 )
            )}
        </div>
    );
};
