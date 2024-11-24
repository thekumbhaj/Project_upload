import React, { useState, useRef } from 'react';
import { IonButton, IonContent, IonPage } from '@ionic/react';
import { VoiceRecorder } from 'capacitor-voice-recorder';

const VoiceRecordingScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [audioData, setAudioData] = useState<string | null>(null); // Store recorded audio data
  const wsRef = useRef<WebSocket | null>(null);

  const startRecording = async () => {
    try {
      // Request permission to record
      const hasPermission = await VoiceRecorder.requestAudioRecordingPermission();
      if (!hasPermission.value) {
        alert("Permission to record audio was denied");
        return;
      }

      setIsRecording(true);
      setAudioData(null); // Reset audio data

      // Initialize the WebSocket connection
        wsRef.current = new WebSocket('ws://forcibly-mutual-hog.ngrok-free.app');
        VoiceRecorder.startRecording()

        // Simulate sending audio data in chunks every few seconds
        const chunkInterval = setInterval(async () => {
          const recordingData = await VoiceRecorder.stopRecording();
          
          if (recordingData.value && recordingData.value.recordDataBase64) {
            // Convert the base64 recording to binary data
            const audioChunk = Buffer.from(recordingData.value.recordDataBase64, 'base64');
            wsRef.current?.send(audioChunk);
            console.log('Sent audio chunk');
            
            // Restart recording for next chunk
            await VoiceRecorder.startRecording();
          }
        }, 5000); // Adjust the interval as needed for chunk size

        // Clear interval when recording stops
    //     (wsRef as any).current.onclose = () => {
    //       clearInterval(chunkInterval);
    //       console.log('Disconnected from WebSocket server');
    //     };
    //   };

      // Listen for transcriptions from server
    //   wsRef.current.onmessage = (message) => {
    //     const response = message.data;
    //     console.log('Received transcription:', response);
    //     setTranscription((prev) => prev + '\n' + response);
    //   };
    } catch (error) {
      console.error('Error during recording:', error);
      alert("Error during recording: " + error);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
        const recordingData = await VoiceRecorder.stopRecording();
        // Save the base64 data for playback
        if (recordingData.value && recordingData.value.recordDataBase64) {
            setAudioData(recordingData.value.recordDataBase64);
        }
        
        setIsRecording(false);
      wsRef.current?.close();
    } catch (err) {
        setIsRecording(false);

      alert(err);
    }
  };

  const playRecording = () => {
    if (audioData) {
      // Convert the base64 data to a Blob and create a URL for playback
      const audioBlob = new Blob([Uint8Array.from(atob(audioData), c => c.charCodeAt(0))], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      alert("No recording available to play");
    }
  };

  return (
    <IonPage>
      <IonContent>
        <h2>Voice Recording with Chunked Transmission</h2>
        {isRecording ? (
          <IonButton onClick={stopRecording} color="danger">
            Stop Recording
          </IonButton>
        ) : (
          <IonButton onClick={startRecording} color="primary">
            Start Recording
          </IonButton>
        )}
        {audioData && (
          <IonButton onClick={playRecording} color="success">
            Play Recording
          </IonButton>
        )}
        <div>
          <h3>Transcription:</h3>
          <p>{transcription}</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default VoiceRecordingScreen;
