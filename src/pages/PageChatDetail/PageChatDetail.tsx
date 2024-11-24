import { FC, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { SpeechRecognition } from "@capacitor-community/speech-recognition";
import { IonCol, IonContent, IonFabButton, IonFooter, IonGrid, IonHeader, IonIcon, IonInput, IonPage, IonRow, IonText, IonTitle, IonToolbar } from "@ionic/react";
import styles from './PageChatDetail.module.scss';
import { arrowBack, closeCircleOutline, micOutline, sendOutline, stopCircleOutline } from "ionicons/icons";
import ComponentUpload from "../ComponentUpload/ComponentUpload";
import { getAccessToken, getMsalEvents } from "../../services/CalendarService";

interface PageChatDetailProps { }

const PageChatDetail: FC<PageChatDetailProps> = () => {
  const history = useHistory();
  const [ mediaData, setMediaData ] = useState([] as any)

  const [ message, setMessage ] = useState('');

  const [ showMedia, setShowMedia ] = useState(false);
  const [ isRecording, setIsRecording ] = useState(false );
  const [ base64Audio, setBase64Audio ] = useState(null as any);
  const [ messageList, setMessageList ] = useState([{
    message: "Hi I'm your voice to text assistant",
    bot: true
  }]);

  useEffect(()=> {
    init()
  }, []);

  /**
   * init
   */
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
          let temp = [ ...messageList ];
          temp[0].message = temp[0].message + ' I support these languages '+ lang
          setMessageList(temp)
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
  /**
   * onMessageChange
   * @param event
   */
  function onMessageChange(event:any) {
    setMessage(event.currentTarget.value ?? '')
  }

  /**
   * handleOnMediaDataAdd
  */
  async function handleOnMediaDataAdd(event: any) {
    setMediaData(event);
  }

  /**
   * sendMessage
  */
  async function sendMessage(event?:any) {
    try {
      let msg = message;
      if (event && event.target.value) {
        msg = event.target.value
      }

      const mediaTemp = [ ...mediaData ];
      if (mediaTemp && mediaTemp.length && showMedia) {
        for (let index = 0; index < mediaTemp.length; index++) {
          const file = mediaTemp[index];
          sendMessageWrapper(file);
          mediaTemp.splice(index, 1);
        }
        setMediaData(mediaTemp);
        setShowMedia(false)
      }
      else if (base64Audio) {
        let fileBlob = await fetch(base64Audio)
        const file = await fileBlob.blob()
        setIsRecording(false);
        setBase64Audio(null);
      }

      if (msg && typeof msg == 'string') {
        sendMessageWrapper(msg)
      }
    }
    catch (error) {
      console.error('Exception in sendMessage()', error);
    }
  }

  /**
   * sendMessageWrapper
   * @param msg
   */
  async function sendMessageWrapper(msg:any) {
    try {
      const inputs:any = {
        message: msg,
      };
      if (typeof inputs.message == 'object') {
        // media
        const media = { ...inputs.message };
        inputs.message = `${media.file_type}`
        inputs.attachment = media.key
        inputs.attachment_type = media.file_type
      }
      setMessage('');
      scrollIntoView(inputs.id)
    }
    catch (error) {
      console.error('Exception in sendMessageWrapper()', error)
    }
  }

  const scrollIntoView = (messageId: string) => {
    setTimeout(() => {
      const msbBox = document.getElementById(messageId);
      if (msbBox) {
        msbBox.scrollIntoView()
      }
    }, 20);
  }

  /**
   * recordAudio
   * @returns
   */
  async function recordAudio() {
    try {
      const status = await SpeechRecognition.requestPermissions();
      if (status.speechRecognition == 'granted' ) {
        const a = await SpeechRecognition.available();
        console.log(a);
        const textResult = await SpeechRecognition.start({
          language: "en-US",
          maxResults: 2,
          prompt: "Say something",
          partialResults: true,
          popup: true,
        });
  
        if (textResult && textResult.matches) {
          let temp = [ ...messageList ];
          for (const match of textResult.matches) {
            temp.push({
              bot: false,
              message: match
            });
          }
          setMessageList(temp)
        }
        else {
          return alert("We didn't hear you please retry")
        }
      }
      setIsRecording(true)
      /**
      * In case of success the promise will resolve to:
      * {"value": { recordDataBase64: string, msDuration: number, mimeType: string }},
      * the file will be in one of several possible formats (more on that later).
      * in case of an error the promise will reject with one of the following messages:
      * "RECORDING_HAS_NOT_STARTED" or "FAILED_TO_FETCH_RECORDING"
      */
    }
    catch (error:any) {
      setIsRecording(false)
      // presentToastError(error.message || ErrMessages.ErrGen);
      console.error('Exception in recordAudio()', error)
    }
  }

  /**
   * stopRecording
   */
  async function stopRecording() {
    try {
      setIsRecording(false)
    }
    catch (error) {
      console.error('Exception in cancelSendRecording()', error)
    }
  }

  /**
   * cancelSendRecording
   */
  async function cancelSendRecording() {
    try {
      setIsRecording(false);
      setBase64Audio(null);
      await SpeechRecognition.stop();
    }
    catch (error) {
      console.error('Exception in cancelSendRecording()', error)
    }
  }

  /**
   * getAllEvent
   */
  async function getAllEvent() {
    try {
      const accessToken = await getAccessToken();
      console.log(accessToken)
      const allEvents = await getMsalEvents();
      console.log(allEvents)
    }
    catch (error) {
      console.error('Exception in getAllEvent()', error)  
    }
  }


  return (
    <IonPage>
      <IonHeader className={styles.PageChatDetailHeader + ' newHeader'}>
        <IonToolbar mode='ios'>
          <IonTitle>
            <IonFabButton className='transparentButton'>
              <IonIcon icon={arrowBack} onClick={history.goBack}></IonIcon>
            </IonFabButton>
            <img className={styles.image} src="https://ionicframework.com/docs/img/demos/avatar.svg" />
            <span className={styles.nameTitle}>
              Language Bot
              <br></br>
              <IonText onClick={()=> getAllEvent()}>Login</IonText>
            </span>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className={styles.PageChatDetail} data-testid="PageChatDetail" onClick={()=> setShowMedia(false)}>
        <IonGrid className={styles.centerbox}>
          <IonRow>
            {
              messageList.map((ele, index: number)=> 
                <IonCol size="12" className={ele.bot ? styles.recive : styles.sender} key={index + 'm'}>
                  <div className={styles.textmess}>
                  <p className={styles.text} dangerouslySetInnerHTML={{ __html: ele.message }}></p> 
                  </div>
                </IonCol>
              )
            }
          </IonRow>
        </IonGrid>
      </IonContent>

      <IonFooter className={styles.PageChatDetailFooter}>
        <IonRow>
          {
            showMedia ?
              <IonCol size="12" size-xs="12" size-sm="12">
                <ComponentUpload onMediaDataAdd={handleOnMediaDataAdd} inputFileClick={true} acceptFileType='image/jpeg,image/gif,image/png,application/pdf,image/x-eps,video/*'></ComponentUpload>
              </IonCol>
              :
              ''
          }
          <IonCol className={styles.inputbox} size="7.5" size-xs="12" size-sm="12">
            {
              !base64Audio ?
                <>
                  <svg className={isRecording ? 'noClicks' : ''} onClick={()=> setShowMedia(!showMedia)} xmlns="http://www.w3.org/2000/svg" width="32" height="25" viewBox="0 0 21 21" fill="none">
                    <path d="M14.7 0H6.3C2.82555 0 0 2.82555 0 6.3V19.95C0 20.2285 0.110625 20.4955 0.307538 20.6925C0.504451 20.8894 0.771523 21 1.05 21H14.7C18.1744 21 21 18.1744 21 14.7V6.3C21 2.82555 18.1744 0 14.7 0ZM18.9 14.7C18.9 17.0163 17.0163 18.9 14.7 18.9H2.1V6.3C2.1 3.9837 3.9837 2.1 6.3 2.1H14.7C17.0163 2.1 18.9 3.9837 18.9 6.3V14.7Z" fill="#f60"/>
                    <path d="M11.55 5.25H9.45V9.45H5.25V11.55H9.45V15.75H11.55V11.55H15.75V9.45H11.55V5.25Z" fill="#f60"/>
                  </svg>
                  <IonInput
                    disabled={isRecording}
                    className={styles.ckeditorText}
                    value={message}
                    onInput={onMessageChange}
                    onKeyUp={(e)=> e.key === 'Enter' && sendMessage(e)}
                    placeholder={ isRecording ? 'Voice Recoding started' : 'Write a message' }
                  ></IonInput>
                </>
                :
                <audio src={base64Audio} controls  className={styles.recordedAudio}></audio>
            }
            {
              /*
                {audioRecorded && (
                  <audio style={{ width: '71%' }} src={audioRecorded} controls></audio>
                )}
              */
            }
            <div className={styles.sendRecordBtn}>
              {
                message && message.trim().length > 0 || mediaData.length || base64Audio ?
                  <IonFabButton className={styles.recordBtn} onClick={sendMessage}>
                    <IonIcon icon={sendOutline} />
                  </IonFabButton>
                  :
                  !isRecording && /**If there is no text in input box and recording is not started only then show mic button */
                  <IonFabButton className={styles.recordBtn} onClick={recordAudio}>
                    <IonIcon icon={micOutline} />
                  </IonFabButton>
              }

              <IonFabButton onClick={stopRecording} className={styles.recordBtn + `${!isRecording ? ' hiddenAbs' : ''}`}>
                <IonIcon icon={stopCircleOutline} />
              </IonFabButton>
              <IonFabButton onClick={cancelSendRecording} className={styles.recordBtn + `${!base64Audio ? ' hiddenAbs' : ''}`}>
                <IonIcon icon={closeCircleOutline} />
              </IonFabButton>
            </div>
          </IonCol>
        </IonRow>
      </IonFooter>
    </IonPage>
  )
}

export default PageChatDetail;
