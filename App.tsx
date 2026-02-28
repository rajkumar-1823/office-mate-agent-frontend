
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob, Session } from '@google/genai';
import type { OfficeLayout as OfficeLayoutType} from './types';
import { FUNCTION_DECLARATIONS } from './constants';
import { ManagementPanel } from './components/ManagementPanel';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { encode, decode, decodeAudioData } from './utils/audioUtils';

const BACKEND_URL = process.env.BACKEND_URL as string;
// Helper to generate URL-friendly keys from names
const generateKey = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

// Helper to generate the system instruction prompt dynamically from device data.
const createSystemInstruction = (layout: OfficeLayoutType): string => {
  const deviceListForPrompt = layout.map(room => {
      const devices = room.electronics.map(d => `- ${d.electronics_name} (type: ${d.type}, id: ${d.electronics_id})`).join('\n');
      return `In the "${room.room_name}":\n${devices}`;
  }).join('\n\n');

  return `You are an office assistant. Your role is to control devices like lights and ACs based on user commands. CRITICAL: You MUST always respond, transcribe, and communicate ONLY in English. Always transcribe the user's speech into English regardless of what language they speak. Never use any other language or script under any circumstances. Use the provided device list to find the correct device IDs for the user's request. You can control multiple devices at once. When a command is ambiguous (e.g., "turn off the light" when there are multiple), ask clarifying questions. Be concise.

Here is the list of available devices and their IDs:
${deviceListForPrompt}`;
};

const App: React.FC = () => {
  const [officeLayout, setOfficeLayout] = useState<OfficeLayoutType>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLayoutLoading, setIsLayoutLoading] = useState(true);
  const [statusText, setStatusText] = useState("Click 'Start Session' to begin");
  const [userTranscription, setUserTranscription] = useState('');
  const [botTranscription, setBotTranscription] = useState('');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [currentView, setCurrentView] = useState<'dashboard' | 'manage'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Session & audio refs
  const sessionRef = useRef<Session | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const playingSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const fetchOfficeLayout = useCallback(async () => {
      try {
          setIsLayoutLoading(true);
          const response = await fetch(BACKEND_URL + '/layout');
          if (!response.ok) {
              throw new Error('Failed to fetch layout from the backend.');
          }
          const layout: OfficeLayoutType = await response.json();
          setOfficeLayout(layout);
          setSystemInstruction(createSystemInstruction(layout));
      } catch (error) {
          console.error("Error fetching office layout:", error);
          setStatusText("Error: Could not load office layout data.");
      } finally {
          setIsLayoutLoading(false);
      }
  }, []);

  useEffect(() => {
      fetchOfficeLayout();
  }, [fetchOfficeLayout]);

  const handleStopSession = useCallback(() => {
    console.log('[Session] Stopping session...');
    try {
      // Close the Gemini session
      if (sessionRef.current) {
        try { sessionRef.current.close(); } catch (e) { console.warn('[Session] Error closing session:', e); }
      }
      // Disconnect audio processing nodes
      if (scriptProcessorRef.current) {
        try { scriptProcessorRef.current.disconnect(); } catch (e) { /* ignore */ }
        scriptProcessorRef.current = null;
      }
      if (mediaStreamSourceRef.current) {
        try { mediaStreamSourceRef.current.disconnect(); } catch (e) { /* ignore */ }
        mediaStreamSourceRef.current = null;
      }
      // Stop the microphone stream tracks
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      // Close audio contexts
      if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        try { inputAudioContextRef.current.close(); } catch (e) { console.warn('[Session] Error closing input audio context:', e); }
        inputAudioContextRef.current = null;
      }
      if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        try {
          playingSourcesRef.current.forEach(source => { try { source.stop(); } catch(e) { /* ignore */ } });
          playingSourcesRef.current.clear();
          outputAudioContextRef.current.close();
        } catch (e) { console.warn('[Session] Error closing output audio context:', e); }
        outputAudioContextRef.current = null;
      }
    } catch (e) {
      console.error('[Session] Unexpected error during cleanup:', e);
    }
    setIsSessionActive(false); setIsBotSpeaking(false); setIsProcessing(false);
    setStatusText("Session ended. Click 'Start Session' to begin again.");
    setUserTranscription(''); setBotTranscription('');
    sessionRef.current = null;
  }, []);

  const handleStartSession = useCallback(async () => {
    if (!systemInstruction) {
        setStatusText("Error: Device data not loaded. Cannot start session.");
        return;
    }
    
    const apiKey = process.env.API_KEY as string;
    if (!apiKey) {
        setStatusText("Error: API key is not configured. Check your .env file.");
        console.error('[Session] API_KEY is missing or empty.');
        return;
    }

    setIsProcessing(true); setStatusText("Initializing session...");
    setUserTranscription(''); setBotTranscription('');
    nextStartTimeRef.current = 0;

    let stream: MediaStream | null = null;

    try {
        // 1. Get microphone access
        console.log('[Session] Requesting microphone access...');
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        console.log('[Session] Microphone access granted.');

        // 2. Create audio contexts
        inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        // 3. Connect to Gemini Live API
        // IMPORTANT: ai.live.connect() is async. It:
        //   - Opens the WebSocket (fires onopen)
        //   - Sends the setup message to the server
        //   - Waits for setupComplete from the server
        //   - Returns the Session object
        // We must NOT start sending audio until connect() resolves!
        console.log('[Session] Connecting to Gemini Live API...');
        const ai = new GoogleGenAI({ apiKey });

        const session = await ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                tools: [{ functionDeclarations: FUNCTION_DECLARATIONS }],
                inputAudioTranscription: {},
                outputAudioTranscription: {},
                systemInstruction,
            },
            callbacks: {
                onopen: () => {
                    console.log('[Session] WebSocket connected. Waiting for setup to complete...');
                },
                onmessage: async (message: LiveServerMessage) => {
                    // Handle setupComplete (first message from server)
                    if ((message as any).setupComplete) {
                      console.log('[Session] setupComplete received from server.');
                    }

                    if (message.serverContent?.outputTranscription) setBotTranscription(p => p + message.serverContent!.outputTranscription!.text);
                    if (message.serverContent?.inputTranscription) setUserTranscription(p => p + message.serverContent!.inputTranscription!.text);
                    if (message.serverContent?.turnComplete) { setUserTranscription(''); setBotTranscription(''); }
                    if (message.toolCall?.functionCalls) {
                        for (const fc of message.toolCall.functionCalls) {
                            const args = fc.args as any;
                            const sendResponse = (id: string, result: any) => {
                                sessionRef.current?.sendToolResponse({ functionResponses: [{id, response: result}] });
                            };

                            try {
                                if (fc.name === 'controlDevice' && args) {
                                    console.log('[ToolCall] controlDevice args:', args);
                                    const { deviceIds, state } = args;
                                    if (deviceIds && Array.isArray(deviceIds) && deviceIds.length > 0 && typeof state === 'string') {
                                        const res = await fetch(BACKEND_URL + '/electronics/state', {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ electronicsIds: deviceIds, state: state.toUpperCase() }),
                                        });
                                        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
                                        await fetchOfficeLayout();
                                        sendResponse(fc.id!, { output: 'OK, device state updated.' });
                                    } else {
                                        sendResponse(fc.id!, { error: 'Invalid arguments for controlDevice.' });
                                    }
                                } else if (fc.name === 'createRoom' && args) {
                                    console.log('[ToolCall] createRoom args:', args);
                                    const { roomName } = args;
                                    const roomKey = generateKey(roomName);
                                    const res = await fetch(BACKEND_URL + '/rooms', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ room_name: roomName, room_key: roomKey }),
                                    });
                                    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
                                    await fetchOfficeLayout();
                                    sendResponse(fc.id!, { output: `Room "${roomName}" created successfully.` });
                                } else if (fc.name === 'createElectronics' && args) {
                                    console.log('[ToolCall] createElectronics args:', args);
                                    const { electronicsName, type } = args;
                                    const electronicsKey = generateKey(electronicsName);
                                    const res = await fetch(BACKEND_URL + '/electronics', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ electronics_name: electronicsName, electronics_key: electronicsKey, type: type.toUpperCase() }),
                                    });
                                    if (!res.ok) throw new Error(`Backend error: ${res.status}`);
                                    await fetchOfficeLayout();
                                    sendResponse(fc.id!, { output: `Electronic "${electronicsName}" (${type}) created successfully.` });
                                } else if (fc.name === 'mapElectronicsToRoom' && args) {
                                    console.log('[ToolCall] mapElectronicsToRoom args:', args);
                                    const { roomName, electronicsName } = args;
                                    // Look up room_id from layout
                                    const room = officeLayout.find(r => r.room_name.toLowerCase() === roomName.toLowerCase());
                                    // Look up electronics_id from all electronics
                                    const allElectronicsRes = await fetch(BACKEND_URL + '/electronics');
                                    const allElectronics = await allElectronicsRes.json();
                                    const electronic = allElectronics.find((e: any) => e.electronics_name.toLowerCase() === electronicsName.toLowerCase());
                                    
                                    if (!room) {
                                        sendResponse(fc.id!, { error: `Room "${roomName}" not found.` });
                                    } else if (!electronic) {
                                        sendResponse(fc.id!, { error: `Electronic "${electronicsName}" not found.` });
                                    } else {
                                        const res = await fetch(BACKEND_URL + '/room-electronics-map', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ room_id: room.room_id, electronics_id: electronic.electronics_id }),
                                        });
                                        if (!res.ok) throw new Error(`Backend error: ${res.status}`);
                                        await fetchOfficeLayout();
                                        sendResponse(fc.id!, { output: `"${electronicsName}" mapped to "${roomName}" successfully.` });
                                    }
                                }
                            } catch (err: any) {
                                console.error(`[ToolCall] Error in ${fc.name}:`, err);
                                sendResponse(fc.id!, { error: err.message || 'An unexpected error occurred.' });
                            }
                        }
                    }
                    const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                    if (audioData) {
                        setIsBotSpeaking(true);
                        const decoded = decode(audioData);
                        const buffer = await decodeAudioData(decoded, outputAudioContextRef.current!, 24000, 1);
                        const source = outputAudioContextRef.current!.createBufferSource();
                        source.buffer = buffer; source.connect(outputAudioContextRef.current!.destination);
                        playingSourcesRef.current.add(source);
                        source.onended = () => {
                            playingSourcesRef.current.delete(source);
                            if (playingSourcesRef.current.size === 0) setIsBotSpeaking(false);
                        };
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContextRef.current!.currentTime);
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += buffer.duration;
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('[Session] WebSocket error:', e);
                    setStatusText(`Error: ${e.message || 'Connection error. Please try again.'}`);
                    handleStopSession();
                },
                onclose: (e: CloseEvent) => {
                    console.log('[Session] WebSocket closed. Code:', e?.code, 'Reason:', e?.reason, 'WasClean:', e?.wasClean);
                    handleStopSession();
                },
            },
        });

        // 4. Session is now fully established (setup message sent, setupComplete received)
        sessionRef.current = session;
        console.log('[Session] Session fully established! Now starting audio capture...');

        // 5. NOW set up the audio pipeline - only after session setup is complete
        setIsSessionActive(true);
        setIsProcessing(false);
        setStatusText("Listening... Speak now.");

        mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
        scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current.onaudioprocess = (e) => {
            if (!sessionRef.current) return; // Guard: don't send if session closed
            const inputData = e.inputBuffer.getChannelData(0);
            const i16 = new Int16Array(inputData.map(f => f * 32768));
            const pcm: Blob = { data: encode(new Uint8Array(i16.buffer)), mimeType: 'audio/pcm;rate=16000' };
            try {
              sessionRef.current.sendRealtimeInput({ media: pcm });
            } catch (err) {
              console.warn('[Session] Error sending audio data:', err);
            }
        };
        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
        scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
        console.log('[Session] Audio pipeline ready. Listening for voice input.');

    } catch (error: any) {
        console.error('[Session] Failed to start session:', error);
        const errMsg = error?.message || 'Unknown error';
        if (errMsg.includes('Permission denied') || errMsg.includes('NotAllowedError')) {
            setStatusText('Error: Microphone permission denied. Please allow microphone access.');
        } else if (errMsg.includes('API key') || errMsg.includes('401') || errMsg.includes('403')) {
            setStatusText('Error: Invalid API key. Please check your .env file.');
        } else {
            setStatusText(`Error: ${errMsg}`);
        }
        // Clean up microphone stream if we got it before the error
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setIsProcessing(false);
        handleStopSession();
    }
  }, [handleStopSession, systemInstruction, fetchOfficeLayout, officeLayout]);

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden selection:bg-blue-500/20">

      {/* Sidebar — relative on lg+ (pinned), fixed drawer on mobile */}
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(o => !o)}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">

        {/* Sticky top header — hamburger hidden on lg+ (sidebar always visible) */}
        <header className="flex-shrink-0 flex items-center gap-3 px-4 sm:px-6 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
          {/* Hamburger — only on mobile */}
          <button
            onClick={() => setIsSidebarOpen(o => !o)}
            className="lg:hidden cursor-pointer p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all duration-200 active:scale-90 shadow-sm"
            aria-label="Toggle sidebar"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${isSidebarOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
              <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${isSidebarOpen ? 'opacity-0 scale-x-0' : ''}`} />
              <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${isSidebarOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
            </div>
          </button>

          <h2 className="text-sm font-semibold text-slate-700">
            {currentView === 'dashboard' ? 'Dashboard' : 'Manage Office'}
          </h2>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6">
          {currentView === 'dashboard' ? (
            <Dashboard
              officeLayout={officeLayout}
              isLayoutLoading={isLayoutLoading}
              isSessionActive={isSessionActive}
              isProcessing={isProcessing}
              isBotSpeaking={isBotSpeaking}
              statusText={statusText}
              userTranscription={userTranscription}
              botTranscription={botTranscription}
              onStartSession={handleStartSession}
              onStopSession={handleStopSession}
            />
          ) : (
            <ManagementPanel refreshLayout={fetchOfficeLayout} />
          )}
        </div>
      </main>
    </div>
  );

};

export default App;
