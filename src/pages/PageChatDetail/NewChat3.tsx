// SpeechRecognition.tsx
import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';

// Interface for component props
interface SpeechRecognitionProps {
  apiKey: string; // Google Cloud API Key
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({ apiKey }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize voice recorder permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const { value } = await VoiceRecorder.hasAudioRecordingPermission();
        if (!value) {
          const { value: permissionValue } = await VoiceRecorder.requestAudioRecordingPermission();
          if (!permissionValue) {
            setError('Microphone permission denied');
          }
        }
      } catch (err) {
        setError('Error checking permissions');
        console.error(err);
      }
    };

    checkPermissions();
  }, []);

  // Function to start recording
  const startRecording = async () => {
    try {
      setIsRecording(true);
      setError(null);

      await VoiceRecorder.startRecording();
      startStreamingToGoogleCloud();
    } catch (err) {
      setError('Failed to start recording');
      console.error(err);
      setIsRecording(false);
    }
  };

  // Function to stop recording
  const stopRecording = async () => {
    try {
      const { value }: any = await VoiceRecorder.stopRecording();
      setIsRecording(false);
      processRecording(value);
    } catch (err) {
      setError('Failed to stop recording');
      console.error(err);
    }
  };

  // Process recording data and send to Google Cloud
  const processRecording = async (recordingData: RecordingData) => {
    try {
      const audioBase64 = recordingData.value.recordDataBase64;
      
      const response = await fetch('https://speech.googleapis.com/v1/speech:recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
            enableAutomaticPunctuation: true,
            model: 'default'
          },
          audio: {
            content: audioBase64
          }
        })
      });

      const data = await response.json();
      
      if (data.results) {
        const newTranscription = data.results
          .map((result: any) => result.alternatives[0].transcript)
          .join(' ');
        setTranscription(prev => prev + ' ' + newTranscription);
      }
    } catch (err) {
      setError('Failed to process audio');
      console.error(err);
    }
  };

  // Stream audio to Google Cloud (implementing real-time streaming)
  const startStreamingToGoogleCloud = async () => {
    try {
      // Create WebSocket connection to Google Cloud Speech-to-Text
      const ws = new WebSocket(
        `wss://speech.googleapis.com/v1/speech:streamingRecognize?key=${apiKey}`
      );

      ws.onopen = () => {
        // Send configuration
        ws.send(JSON.stringify({
          streamingConfig: {
            config: {
              encoding: 'LINEAR16',
              sampleRateHertz: 16000,
              languageCode: 'en-US',
              enableAutomaticPunctuation: true,
              model: 'default'
            },
            interimResults: true
          }
        }));
      };

      ws.onmessage = (event) => {
        const response = JSON.parse(event.data);
        if (response.results) {
          const newTranscription = response.results
            .map((result: any) => result.alternatives[0].transcript)
            .join(' ');
          setTranscription(prev => prev + ' ' + newTranscription);
        }
      };

      ws.onerror = (error) => {
        setError('WebSocket error');
        console.error(error);
      };
    } catch (err) {
      setError('Failed to start streaming');
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-2 rounded-full ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Transcription:</h3>
        <div className="p-4 bg-gray-100 rounded min-h-[100px]">
          {transcription || 'No transcription yet...'}
        </div>
      </div>

      {error && (
        <div className="text-red-500 mt-2">
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default SpeechRecognition;