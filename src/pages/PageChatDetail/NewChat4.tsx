// import React, { useState, useRef } from 'react';
// import { IonButton, IonContent, IonPage } from '@ionic/react';
// import { Media } from '@capacitor-community/media';
// import { Filesystem, Directory } from '@capacitor/filesystem';
// import WebSocket from 'websocket';

// const VoiceRecordingScreen: React.FC = () => {
//   const [isRecording, setIsRecording] = useState(false);
//   const [transcription, setTranscription] = useState('');
//   const wsRef = useRef<WebSocket | null>(null);

//   const startRecording = async () => {
//     try {
//       setIsRecording(true);

//       // Request recording permissions and start recording
//       await Media..requestPermissions();
//       const recording = await Media.startRecordAudio();

//       // WebSocket connection setup
//       wsRef.current = new WebSocket('ws://localhost:8080');

//       wsRef.current.onopen = async () => {
//         console.log('Connected to WebSocket server');

//         // Stop recording after a set time, or add custom logic to stop
//         setTimeout(async () => {
//           await Media.stopRecordAudio();

//           const audioFile = recording.filePath;
//           if (audioFile) {
//             // Read the recorded file
//             const fileContent = await Filesystem.readFile({
//               path: audioFile,
//               directory: Directory.Documents,
//             });
//             const audioBuffer = Buffer.from(fileContent.data, 'base64');

//             // Send data in chunks of 4096 bytes
//             const chunkSize = 4096;
//             for (let i = 0; i < audioBuffer.length; i += chunkSize) {
//               const chunk = audioBuffer.slice(i, i + chunkSize);
//               wsRef.current?.send(chunk);
//               console.log('Sent audio chunk');
//             }

//             wsRef.current?.send(JSON.stringify({ type: 'end' })); // Signal end of transmission
//           }

//           setIsRecording(false);
//         }, 5000); // Record for 5 seconds or adjust as needed
//       };

//       // Receiving transcription data from WebSocket server
//       wsRef.current.onmessage = (message) => {
//         const response = message.data;
//         console.log('Received transcription:', response);
//         setTranscription((prev) => prev + '\n' + response);
//       };

//       wsRef.current.onclose = () => {
//         console.log('Disconnected from WebSocket server');
//       };
//     } catch (error) {
//       console.error('Error during recording:', error);
//       setIsRecording(false);
//     }
//   };

//   const stopRecording = async () => {
//     await Media.stopRecordAudio();
//     wsRef.current?.close();
//     setIsRecording(false);
//   };

//   return (
//     <IonPage>
//       <IonContent>
//         <h2>Voice Recording with Chunked Transmission</h2>
//         {isRecording ? (
//           <IonButton onClick={stopRecording} color="danger">
//             Stop Recording
//           </IonButton>
//         ) : (
//           <IonButton onClick={startRecording} color="primary">
//             Start Recording
//           </IonButton>
//         )}
//         <div>
//           <h3>Transcription:</h3>
//           <p>{transcription}</p>
//         </div>
//       </IonContent>
//     </IonPage>
//   );
// };

// export default VoiceRecordingScreen;
