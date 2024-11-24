import React, { useState, useRef, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonFooter,
  IonInput,
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent,
  IonAvatar,
} from "@ionic/react";
import {
  sendOutline,
  imageOutline,
  micOutline,
  mic,
  square,
  menuOutline,
  ellipsisVerticalOutline,
} from "ionicons/icons";
import styles from "./NewChat.module.scss";
import logo from "./logo.svg";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import axios from "axios";
import { RecordingStatus, VoiceRecorder } from "capacitor-voice-recorder";
import AnimatedTabBar from "../../components/TabBar";
import RemindersScreen from "../../components/Reminder";
// import { useNotifications } from "../../hooks/useNotification";
import { useDatabase, useNotifications } from "../../store/db";
import VoiceRecorderModal from "../../components/VoiceRecorderModal";
// import OpenAI from "openai";

const OPENAI_API_KEY =
  "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";
const url = "https://enhanced-monkfish-enabled.ngrok-free.app";
// const userPrompt = `Given you're a shopkeeper and I will provide you an unstructured data of the list of items customer purchased. You need to structure the data and give json format for the list of items. I will give you item name, brand(can be absent), size (can be absent), qty, unit, price. An example of the note containing all the flavors:
// "note down the items granola yolo roots 400 gram two packets price 440 jeera cone brand 5 packet mrp 199  sugar 5 kg 50 rupees besan rajdhani half kg 100 rupees per kg suji goodtime half kg 250 rupees rosogulla 1Kg box 1 pieces MRP 250 rupees atta ashirwad 5kg 1piece 325 rupees chawal 5 kg 45 rupees print it"

// The output expected is:
// [
//   {"name": "Granola", "brand": "Yolo Roots", "size": "400gm", "qty": 2, "unit": "packet", "price": 440},
//   {"name": "Jeera", "brand": "Cone", "size": "standard", "qty": 5, "unit": "packet", "price": 199},
//   {"name": "Sugar", "brand":"", "size": "standard", "qty": 5, "unit": "kg", "price": 50},
//   {"name": "Besan", "brand": "Rajdhani", "size": "standard", "qty": 0.5, "unit":"kg", "price": 100},
//   {"name": "Suji", "brand": "Goodtime", "size": "standard", "qty": 0.5, "unit":"kg", "price": 250},
//   {"name": "Rosogulla", "brand":"", "size": "1kg", "qty": 1, "unit":"piece", "price": 250},
//   {"name": "Atta", "brand":"Aashirwad", "size": "5kg", "qty": 1, "unit":"piece", "price": 250},
//   {"name": "chawal", "brand":"", "size": "standard", "qty": 5, "unit":"Kg", "price": 45}
// ]

// Important points:
// 1.When I mention price, I can call it MRP, price, print, rate etc which all mean same thing.
// 2. I always mention price for a single unit (per kg, per litre, per piece etc) which you need to put in "price" tag
// 3. There will be total of 6 keys per row expected from you: name, brand, size, qty, unit, price.
// 4.I may or may NOT mention brand name followed by the item name. Keep "brand":"" if not provided.
// 5.I may or may NOT mention size followed by the item name, item brand. Keep "size":"standard" if not provided.
// 6. Some words can be in hindi language script but i want it to be written as english script but pronounced same as in hindi strictlty process both hindi and english.
// `;

const userPrompt = `'''1. vikas gupta se paise lene ka parso dopahar 3 baje ka reminder laga do 
2.⁠ ⁠⁠reminder vikas gupta 3pm thursday for udhaar paise
3.⁠ ⁠⁠vikas se paise lene hai sunday 8 baje yaad dila dena
4, Godaam me se 5 katte chini uthayi hai shaam ne
5.⁠ ⁠⁠godown me 100 peti chini jama kardo
6.⁠ ⁠⁠3 thaile maida jama karde
7.⁠ ⁠⁠20 bori dal aayi hai
8.⁠ ⁠Subhash ka smaan 5 baje bhejna hai
9.⁠ ⁠Ajay ka samaan bhej diya
10.Vikas ka gehra chaka diya (gehra means trip for items)'''
for all these examples you have to perform ner with chain or thought reasoning 
and convert them in to appropriate json 
example {reminder: True,
time: "parson dophar 3 baje",
action: "vikas gupta se paise lene hai"}
you have to analyze wether the statement is related to a reminder if yes set reminder to true as in the example (if not then make it false)
then break the statement into timing and action and if timing it missing then pass the value none in timing and for action it must be without timing as shown in example 
make sure to use chain of thought while doing it so you are having a look at your answer and correct if there are mistakes
remember above were just example to showcase you how things will work you will get a prompt and you need to convert it to desired json mandory json and remember to give time in datetime format of javascript to be used in app mandorily date time and if only time is given consider it to be upcoming option of that time and if both date and time is given use that present datetime and also the current time mandatory is this `;

const ChatResponse: React.FC<{ prompt: string }> = ({ prompt }) => {
  return (
    <div
      style={{
        padding: "0.1rem 0.8rem",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        fontFamily: "Arial",
        maxWidth: "80vw",
        color: "#000",
      }}
    >
      <ReactMarkdown className={styles.test} remarkPlugins={[remarkGfm]}>
        {prompt}
      </ReactMarkdown>
    </div>
  );
};

interface Message {
  text: string;
  sender: "user" | "bot";
}

const NewChat: React.FC = () => {
  // const openai = new OpenAI({apiKey:OPENAI_API_KEY});
  const [activeTab, setActiveTab] = useState("documents");
  const { hasPermission, scheduleReminder } = useNotifications();
  const { addReminder } = useDatabase();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const [audioData, setAudioData] = useState<any>(null);
  const [transcription, setTranscription] = useState<any>();
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  function replaceJsonBlock(text: string) {
    const regex = /```json|```/g;
    return text.replace(regex, "");
  }

  const jsonParser = async (jsonStr: string) => {
    try {
      const data = await JSON.parse(jsonStr);
      return data;
    } catch (error) {
      throw Error("failed to parse json");
    }
  };

  const getPdf = async (data: any) => {
    try {
      const response = await fetch(`${url}/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: data }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result?.link;
    } catch (err: any) {
      return err.message;
    }
  };

  async function recordAudio() {
    try {
      const hasPermission =
        await VoiceRecorder.requestAudioRecordingPermission();
      if (!hasPermission.value) {
        alert("Permission to record audio was denied");
        return;
      }
      const { status } = await VoiceRecorder.getCurrentStatus();
      if (status !== RecordingStatus.RECORDING) {
        VoiceRecorder.startRecording();
      } else {
        alert("Already Recording");
        setIsListening(true);
      }

      setIsListening(true);
    } catch (error: any) {
      setIsListening(false);
      alert("Exception in recordAudio() " + error);
    }
  }

  const sendMessage = async (message=inputMessage) => {
    if (message.trim()) {
      const newUserMessage: Message = { text: message, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInputMessage("");
      setIsLoading(true);
      const finalUserPrompt = `${userPrompt} ${new Date().toISOString()}`;
      try {
        const itemAnalysisResponse = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are a grocery merchant who prepares list of grocery items purchased by customer. Your task is to format raw unstructured sales data into structured JSON format for reporting.",
              },
              {
                role: "user",
                content: finalUserPrompt,
              },
              {
                role: "user",
                content: inputMessage,
              },
            ],
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        // const jsonResponse = itemAnalysisResponse.data.choices[0].message.content;
        // const data = await jsonParser(replaceJsonBlock(jsonResponse));
        let message1 =
          itemAnalysisResponse?.data?.choices?.[0]?.message?.content;

        const itemAnalysisResponse2 = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are an assistant that reflects on questions and answers provided to improve clarity and accuracy",
              },
              {
                role: "user",
                content: finalUserPrompt,
              },
              {
                role: "user",
                content: inputMessage,
              },
              {
                role: "assistant",
                content: message1,
              },
              {
                role: "user",
                content: `Can you self-reflect on your previous answer considering all the "Important points" I suggested in prior context and give me valid json again?
Note: It should strictly be json in the output without any extra text or comment. and remember to tak into account if there mentions any time its mandatory and mandatorily use this ${new Date()} datetime as current time or any time reference that is mandatory and remember to give datetime as iso string mandatory in response`,
              },
            ],
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        let message =
          itemAnalysisResponse2?.data?.choices?.[0]?.message?.content;

        const js = replaceJsonBlock(message);
        const data: any = await jsonParser(js);
        if (data?.reminder) {
          const success = await scheduleReminder(
            "Reminder",
            data?.action,
            new Date(data?.time)
          );
          addReminder({
            time: data?.time,
            action: data?.action,
            reminder: data?.reminder,
          } as any);
        }
        setIsLoading(false);
        const newBotMessage: Message = {
          text: "Thank you, your task is added",
          sender: "bot",
        };
        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
      } catch (error) {
        console.error("Error calling OpenAI API:", error);
        const errorMessage: Message = {
          text: "I'm sorry, I encountered an error. Please try again.",
          sender: "bot",
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    }
  };

  async function sendAudioForTranscription(audioBase64: string) {
    try {
      const response = await fetch(`${url}/transcribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioBase64 }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setTranscription(data?.transcription)
      setInputMessage((prev: string) => prev + " " + data?.transcription);
      return data.transcription;
    } catch (error: any) {
      alert("Error sending audio for transcription: " + error.message);
    }
  }

  const stopRecording = async () => {
    try {
      const { status } = await VoiceRecorder.getCurrentStatus();
      if (status === RecordingStatus.RECORDING) {
        const recordingData = await VoiceRecorder.stopRecording();
        if (recordingData.value && recordingData.value.recordDataBase64) {
          setAudioData(recordingData.value.recordDataBase64);
          sendAudioForTranscription(recordingData.value.recordDataBase64);
        }
      } else {
        // alert("Voice isnt recoring");
      }
      setIsListening(false);
    } catch (err) {
      alert(err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <IonPage className={styles.modernMirrorChat}>
      <AnimatedTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "documents" ? (
        <>
          <IonContent className={styles.chatContent}>
            <div className={styles.messageContainer}>
              {messages.length === 0 && (
                <div className={styles.welcomeMessage}>
                  Welcome! How can I assist you today?
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`${styles.message} ${styles[message.sender]}`}
                >
                  {message.sender === "bot" && (
                    <IonAvatar className={styles.botAvatar}>
                      <img src={logo} alt="Bot" />
                    </IonAvatar>
                  )}
                  {message.sender === "user" ? (
                    <div className={styles.messageContent}>{message.text}</div>
                  ) : (
                    <ChatResponse prompt={message.text} />
                  )}
                </div>
              ))}
              {isLoading ? (
                <div className={`${styles.message} ${styles["bot"]}`}>
                  <IonAvatar className={styles.botAvatar}>
                    <img src={logo} alt="Bot" />
                  </IonAvatar>

                  <ChatResponse prompt={"Processing ..."} />
                </div>
              ) : (
                <></>
              )}
              <div ref={messagesEndRef} />
            </div>
          </IonContent>

          <IonFooter className={styles.footer}>
            <div className={styles.inputContainer}>
              <IonInput
                value={inputMessage}
                onIonChange={(e) => setInputMessage(e.detail.value!)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              />
              <div
                onClick={() => sendMessage()}
                style={{
                  borderRadius: "50%",
                  width: 70,
                  height: 50,
                  marginRight: 5,
                  background: "#0f00f9",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IonIcon icon={sendOutline} />
              </div>

              <div
                onClick={() => setOpen(true)}
                style={{
                  borderRadius: "50%",
                  width: 90,
                  height: 60,
                  background: "#3880ff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isListening ? (
                  <IonIcon icon={square} />
                ) : (
                  <IonIcon icon={mic} style={{ fontSize: 28 }} />
                )}
              </div>
            </div>
          </IonFooter>
        </>
      ) : (
        <>
          <RemindersScreen />
        </>
      )}
      <VoiceRecorderModal
        isOpen={open}
        recordAudio={recordAudio}
        stopRecording={stopRecording}
        isListening={isListening}
        setIsListening={setIsListening}
        onSubmit={()=>{
          setOpen(false);
          sendMessage(transcription)
        }}
        onDismiss={async () => {
          setOpen(false);
          await stopRecording();
        }}
        result={transcription}
      />
    </IonPage>
  );
};

export default NewChat;
