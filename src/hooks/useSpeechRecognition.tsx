import { useState } from 'react';

let recognition: SpeechRecognition | null = null;

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  function initRecognition() {
    // Initialize the webkitSpeechRecognition instance
    if (recognition === null) {
      recognition = new (window.SpeechRecognition || (window as any).webkitSpeechRecognition)() as SpeechRecognition;
      recognition.lang = 'en-US' ;
      recognition.interimResults = true;
    //   recognition.maxAlternatives = 1;

      // Handle the result
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          interimTranscript += result[0].transcript;
        }
        setTranscript(interimTranscript);
      };

      // Handle errors
      recognition.onerror = (event: any) => {
        console.error('SpeechRecognition error:', event?.error);
        setIsListening(false);
      };

      // Reset listening state when recognition ends
      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }

  function startListening() {
    initRecognition(); // Ensure recognition is initialized
    try {
      recognition?.start();
      setIsListening(true);
    //   alert("true")
    } catch (error) {
        alert(isListening + " error "+ error)
      console.error('Error starting recognition:', error);
    }
  }

  function stopListening() {
    recognition?.stop();
    alert("false")

    setIsListening(false);
  }

  return { transcript, isListening, startListening, stopListening };
}
