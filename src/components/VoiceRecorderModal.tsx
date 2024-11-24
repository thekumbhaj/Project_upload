import React, { useEffect, useState } from "react";
import {
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
} from "@ionic/react";
import { closeOutline } from "ionicons/icons";

import "./VoiceRecorder.css";

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  result: string;
}

const VoiceRecorderModal = ({
  isOpen,
  result = "",
  onDismiss,
  recordAudio,
  stopRecording,
  isListening,
  setIsListening,
  onSubmit
}:any) => {
//   const [isListening, setIsListening] = useState(true);

  const generateWavePoints = () => {
    return Array.from({ length: 10 }, () => Math.random() * 40 + 10);
  };

  const [waveHeights, setWaveHeights] = useState(generateWavePoints());

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setWaveHeights(generateWavePoints());
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isListening]);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      className="voice-recorder-modal"
    >
      <IonHeader>
        <IonToolbar style={{ paddingLeft: 20, paddingRight: 10 }}>
          <IonTitle>Recording Voice</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onDismiss}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ "--background": "black" }}>
        <div className="flex flex-col items-center justify-center min-h-full">
          {/* Voice/Song Toggle */}
          <div className="bg-gray-800 rounded-full mb-8 p-1">
            <div className="flex space-x-2"></div>
          </div>

          {/* Listening text */}
          <div className="text-white text-2xl mb-32">Listening...</div>

          {/* Wave visualization */}
          <div className="relative w-64 h-32 mb-8">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <g transform="translate(100, 50)">
                {waveHeights.map((height, index) => {
                  const x = (index - 5) * 12;
                  return (
                    <rect
                      key={index}
                      x={x}
                      y={-height / 2}
                      width="4"
                      height={height}
                      fill={index === 5 ? "#ff0000" : "#666"}
                      rx="2"
                      className="transition-all duration-200 ease-in-out"
                    />
                  );
                })}
              </g>
            </svg>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              alignItems: "center",
            }}
          >
            {/* Recording button */}
            <button
              className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg"
              style={{
                width: 56,
                height: 56,
                padding: 8,
                background: "#ff0000",
                borderRadius: 28,
              }}
              onClick={() => {
                isListening? stopRecording(): recordAudio()
                setIsListening((prev:any)=>!prev)
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-white"
                fill="currentColor"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
              </svg>
            </button>

            {/* Smiley face icon */}
            {/* <div className="absolute bottom-4 right-4 text-gray-400 text-3xl">
              ◠‿◠
            </div> */}
            <div style={{ color: "#fff", marginTop:40, marginLeft:10, marginRight:10, borderColor: "#fff", borderWidth: 1 }}>
              {result}
            </div>
            <button
              className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg"
              style={{
                width: 90,
                padding: 8,
                background: "#ff0000",
                borderRadius: 8,
                fontSize:18,
                marginTop:28
              }}
              onClick={() => {
                onSubmit();
              }}
            >
              Submit
            </button>

          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default VoiceRecorderModal;
