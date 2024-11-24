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
  menuOutline,
  ellipsisVerticalOutline,
} from "ionicons/icons";
import styles from "./NewChat.module.scss";
import logo from "./logo.svg";
import { GoogleGenerativeAI, Content, Part } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // For GitHub-flavored markdown like tables and strikethrough
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import axios from "axios";

const ChatResponse: React.FC<{ prompt: string }> = ({ prompt }) => {
  return (
    <div
      style={{
        padding: "0.1rem 0.8rem",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        fontFamily: "Arial",
        maxWidth:'80vw',
        color:"#000"
      }}
    >
      <ReactMarkdown className={styles.test} remarkPlugins={[remarkGfm]}>{prompt}</ReactMarkdown>
    </div>
  );
};

const GEMINI_API_KEY = "AIzaSyBXZEX8T16B-6MzK-ptXyG3lDVZptOeCAA";
const url = "https://forcibly-mutual-hog.ngrok-free.app"
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface Message {
  text: string;
  sender: "user" | "bot";
}

const NewChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  const convertToGeminiHistory = (messages: Message[]): Content[] => {
    const userMessages = messages.filter((msg) => msg.sender === "user");
    const limitedMessages = userMessages.slice(-5);
    return limitedMessages.map((msg) => ({
      role: "user",
      parts: [{ text: msg.text } as Part],
    }));
  };

  const generateSystemMessage = (): Content => ({
    role: "user",
    parts: [
      {
        text: "You are a helpful AI assistant. Provide concise and relevant responses without repeating large portions of the user's input. If you're unsure, it's okay to say so.",
      } as Part,
    ],
  });

  function replaceJsonBlock(text: string) {
    const regex = /```json|```/g;
    return text.replace(regex, ''); // Replace with desired text
  }
  useEffect(() => {
    console.log(transcript);
    
  }, [transcript])

  async function recordAudio() {
    try {
      const status = await SpeechRecognition.requestPermissions();
      if (status.speechRecognition == 'granted' ) {
        const a = await SpeechRecognition.available();
        console.log(a);
        const textResult = await SpeechRecognition.start({
          language: "en-US",
          maxResults: 1,
          prompt: "Say something",
        
          partialResults: true,
          popup: true,
        });

        SpeechRecognition.addListener('partialResults', (partialResults) => {
          console.log(partialResults);
        });

        if (textResult && textResult.matches) {
          // for (const match of textResult.matches) {
          //   temp.push({
          //     bot: false,
          //     message: match
          //   });
          // }
          console.log("textResult", textResult.matches);
          const result = textResult.matches.join(" ");
          setTranscript(result)
          if (inputMessage !== ""){
            setInputMessage((prev: string) => `${prev} ${result}`)
          } else {
            setInputMessage(result)
          }
          // alert(result)
        }
        else {
          return alert("We didn't hear you please retry")
        }
      }
      setIsListening(true);      
      /**
      * In case of success the promise will resolve to:
      * {"value": { recordDataBase64: string, msDuration: number, mimeType: string }},
      * the file will be in one of several possible formats (more on that later).
      * in case of an error the promise will reject with one of the following messages:
      * "RECORDING_HAS_NOT_STARTED" or "FAILED_TO_FETCH_RECORDING"
      */
    }
    catch (error:any) {
      setIsListening(false);      
      // presentToastError(error.message || ErrMessages.ErrGen);
      console.error('Exception in recordAudio()', error)
    }
  }

//   useEffect(() => {
//     // Check if the browser supports speech recognition
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//         alert('Your browser does not support speech recognition. Please try Chrome or Firefox.');
//         return;
//     }

//     const newRecognition = new SpeechRecognition();
//     newRecognition.interimResults = true;
//     newRecognition.lang = 'en-US';

//     newRecognition.onresult = (event: any) => {
//         const currentTranscript = Array.from(event.results)
//             .map((result: any) => result[0].transcript)
//             .join('');
//         setTranscript(currentTranscript);
//     };

//     newRecognition.onend = () => {
//         setIsListening(false);
//     };

//     setRecognition(newRecognition);
// }, []);

const startListening = () => {
    if (recognition) {
        setIsListening(true);
        recognition.start();
    }
};

const stopListening = () => {
    if (recognition) {
        console.log("trans",transcript);
        
        // recognition.stop();
    }
};

  const jsonParser = async(jsonStr: string) => {
    try {
      const data = await JSON.parse(jsonStr)
      return data
    } catch (error) {
      return "failed to parse json"
    }
  }

  const getPdf = async (data:any) => {
    try {
      const response = await fetch(`${url}/generate-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ data: data })
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
  
      const result = await response.json();
      return result?.link;
    } catch (err:any) {
      return err.message;
    }
  };
  

  const sendMessage = async () => {
    if (inputMessage.trim()) {
      const newUserMessage: Message = { text: inputMessage, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInputMessage("");

      try {
        const model = await genAI.getGenerativeModel({ model: "gemini-pro" });

        // Convert message history, but ensure the first message is from the user
        const history = convertToGeminiHistory(messages);
        const chatHistory =
          history.length > 0 ? [generateSystemMessage(), ...history] : history;

        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        });
        // const intentPrompt = `Analyze the following user input and determine if it's about setting a reminder, recording an expense, or recording an earning. If it's none of these, respond with "other". Only respond with one word: "reminder", "expense", "earning", or "other".
        // User input: "${inputMessage}"`;

        const intentPrompt = `Analyze the following user input and rembember it is going to be used for generating a json array object where each item has a name, qty, unit and price so listen carefully and give me an array of json of items.
        User input: "${inputMessage}"`;
        const intentResult = await model.generateContent(intentPrompt);
        const intent = intentResult.response.text().toLowerCase().trim();
        let structuredData: any = null;
        let responseText = "";
        const js = replaceJsonBlock(intent)
        const data: any = await jsonParser(js)
        // responseText += " "+data + data?.length
        // let responseText = "Here is your url"
        if (data && data?.length > 0) {
          // const res:any = await axios.post("http://localhost:3000/generate-pdf", data)
          const link: any = await getPdf(data)
          responseText += `  link: ${url}${link}`
        }
        // switch (intent) {
        // case "reminder":
        //     const reminderPrompt = `Generate a JSON object for a reminder based on this input: "${inputMessage}". Include fields for type (always "reminder"), priority (high, medium, low), title, reminder_time_utc as reminder timing in utc format using this utc time ${Date.now()}, of the time of reminder and if reminder does not exist on user input ask for it to user exist ask for it, and category. Respond only with the JSON object, no additional text.`;
        //     const reminderResult = await model.generateContent(reminderPrompt);
        //     responseText = replaceJsonBlock(reminderResult?.response?.text());
        //     console.log(responseText);
            
        //     structuredData = JSON.parse(responseText);
        //     responseText = `Reminder added: ${structuredData.title}`;
        //     break;
    
        // case "expense":
        //     const expensePrompt = `Generate a JSON object for an expense based on this input: "${inputMessage}". Include fields for type (always "finance"), flow (always "expense"), amount (in numbers), and category. Respond only with the JSON object, no additional text.`;
        //     const expenseResult = await model.generateContent(expensePrompt);
        //     responseText = replaceJsonBlock(expenseResult?.response?.text());
        //     structuredData = JSON.parse(responseText);
        //     responseText = `Expense recorded: $${structuredData.amount} for ${structuredData.category}`;
        //     break;
    
        // case "earning":
        //     const earningPrompt = `Generate a JSON object for an earning based on this input: "${inputMessage}". Include fields for type (always "finance"), flow (always "earning"), amount (in numbers), and category. Respond only with the JSON object, no additional text.`;
        //     const earningResult = await model.generateContent(earningPrompt);
        //     responseText = replaceJsonBlock(earningResult?.response?.text());
        //     structuredData = JSON.parse(responseText);
        //     responseText = `Earning recorded: $${structuredData.amount} from ${structuredData.category}`;
        //     break;
    
        //   default:
        //     const generalPrompt = `You are a voice assistant that can set reminders, record expenses, and track earnings. Respond to this input: "${inputMessage}". If it's not about these tasks, politely explain your capabilities.`;
        //     const generalResult = await model.generateContent(generalPrompt);
        //     responseText = generalResult.response.text();
        // }
    
    
        // const result = await chat.sendMessage(inputMessage);
        // const botResponse = result?.response?.candidates?.[0]?.content?.parts[0]
        //   .text as string;
        // console.log(result?.response?.candidates?.[0]?.content?.parts[0]);
        console.log(responseText, structuredData);
        
        const newBotMessage: Message = { text: responseText, sender: "bot" };
        setMessages((prevMessages) => [...prevMessages, newBotMessage]);
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        const errorMessage: Message = {
          text: "I'm sorry, I encountered an error. Please try rephrasing your question.",
          sender: "bot",
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    }
  };

  async function init() {
    try {
      const status = await SpeechRecognition.requestPermissions();
      if (status.speechRecognition == 'granted' ) {
        let lang = '';
        const languages = await SpeechRecognition.getSupportedLanguages();
        if (languages.languages.length) {
          for (const language of languages.languages) {
            lang = lang + language + ','
          }
        //   let temp = [ ...messageList ];
        //   temp[0].message = temp[0].message + ' I support these languages '+ lang
        //   setMessageList(temp)
        }
      }
      else {
        alert('Please grant mic permission');
      }
    }
    catch (error) {
      console.error('Exception in init()', error);  
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <IonPage className={styles.modernMirrorChat}>
      <IonHeader className={styles.header}>
        <IonToolbar>
          <IonButton fill="clear" slot="start">
            <IonIcon icon={menuOutline} />
          </IonButton>
          <IonTitle>Organizer.ai</IonTitle>
          <IonButton fill="clear" slot="end">
            <IonIcon icon={ellipsisVerticalOutline} />
          </IonButton>
        </IonToolbar>
      </IonHeader>

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
          <div ref={messagesEndRef} />
        </div>
      </IonContent>

      <IonFooter className={styles.footer}>
        <div className={styles.inputContainer}>
          <IonButton fill="clear" className={styles.iconButton}>
            <IonIcon icon={imageOutline} />
          </IonButton>
          <IonInput
            value={inputMessage}
            onIonChange={(e) => setInputMessage(e.detail.value!)}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          />
          <IonButton
            fill="clear"
            onClick={sendMessage}
            className={styles.iconButton}
          >
            <IonIcon icon={sendOutline} />
          </IonButton>
          <IonButton onClick={()=> {
            // if(!isListening){
              recordAudio();
            // } else {
            //     stopListening();
            // }
          }} fill="clear" className={styles.iconButton}>
            <IonIcon  icon={mic} />
          </IonButton>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default NewChat;
