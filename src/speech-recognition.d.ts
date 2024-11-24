// src/speech-recognition.d.ts

interface SpeechRecognition extends EventTarget {
    // Define the properties and methods you will use
    new (): SpeechRecognition;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionError) => void;
}

// Extend the Window interface
interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition; // For Safari support
}
