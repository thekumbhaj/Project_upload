import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonFooter,
  IonIcon,
  IonLoading,
  IonText,
} from "@ionic/react";

import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!
import interactionPlugin from "@fullcalendar/interaction" // needed for dayClick
import timegridPlugin from "@fullcalendar/timegrid" // needed for dayClick
import moment from "moment";
import { getDateEvents } from "../../services/CalendarService";
import styles from './HomePage.module.scss';
import { arrowBack, home, homeOutline, refreshCircle } from "ionicons/icons";
import ComponentHeader from "../ComponentHeader/ComponentHeader";
import { useHistory } from "react-router";
import { App } from "@capacitor/app";
import { msalInstance } from "../../App";
import { Browser } from "@capacitor/browser";

export interface DateEnv {
  timeZone: string;
  canComputeOffset: boolean;
  calendarSystem: Record<string, unknown>;
  locale: {
    codeArg: string;
    codes: string[];
    week: {
      dow: number;
      doy: number;
    };
    simpleNumberFormat: Record<string, unknown>;
    options: {
      direction: string;
      buttonText: {
        prev: string;
        next: string;
        prevYear: string;
        nextYear: string;
        year: string;
        today: string;
        month: string;
        week: string;
        day: string;
        list: string;
      };
      weekText: string;
      weekTextLong: string;
      closeHint: string;
      timeHint: string;
      eventHint: string;
      allDayText: string;
      moreLinkText: string;
      noEventsText: string;
      buttonHints: {
        prev: string;
        next: string;
      };
      viewHint: string;
      navLinkHint: string;
    };
  };
  weekDow: number;
  weekDoy: number;
  weekText: string;
  weekTextLong: string;
  cmdFormatter: unknown | null;
  defaultSeparator: string;
}

interface View {
  type: string;
  dateEnv: DateEnv;
}

interface CalendarEvent {
  start: string;
  end: string;
  startStr: string;
  endStr: string;
  timeZone: string;
  view: View;
}


const HomePage = () => {
  const [events, setEvents] = useState([]);
  const [ allEventObj, setAllEventObj ] = useState({} as any);
  const [ calenderObj, setCalenderObj ] = useState({} as { startStr: string, endStr: string });
  const [ showCalendar, setShowCalendar ] = useState(false);
  const [ showLoading, setShowLoading ] = useState(false);
  const [ account, setAccount ] = useState([] as any[]);
  const history = useHistory();
  const [ token, setToken ] = useState('');

  useEffect(() => {
    const handleAppUrlOpen = async (event:any) => {
      const url = new URL(event.url);
      const hash = url.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      console.log('>>>>>', event)
      const code = params.get('code');
      if (code) {
        const resp = await msalInstance.handleRedirectPromise();
        console.log(resp,'>>>>>>>>>>>')
      }
    };

    App.addListener('appUrlOpen', handleAppUrlOpen);

    return () => {
      App.removeAllListeners();
    };
  }, []);
  useEffect(()=> {
    setShowCalendar(true)
    init()
  }, []);

  async function init() {
    await msalInstance.initialize()
    msalInstance.addEventCallback((event:any) => {
      console.log('event<>>>>>>>', event)
      if (
        event.eventType === 'msal:loginSuccess' ||
        event.eventType === 'msal:ssoSilentSuccess' ||
        event.eventType === 'msal:acquireTokenSuccess'
      ) {
        msalInstance.setActiveAccount(event.payload.account);
      }
    });
    setAccount(msalInstance.getAllAccounts());
  }

  async function calendarEventChange(e:CalendarEvent) {
    try {
      setEvents([])
      setShowLoading(true);
      let temp = { ...allEventObj };
      e.startStr = moment(e.startStr).format("YYYY-MM-DDTHH:mm:ss.SSS");
      e.endStr = moment(e.endStr).format("YYYY-MM-DDTHH:mm:ss.SSS");
      setCalenderObj(e);
      if (!temp[e.startStr]) {
        const events = await getDateEvents(e.startStr, e.endStr);
        if (!events?.length) {
          return
        }
        const formattedEvents = events.map((event:any) => ({
          title: event.subject,
          start: event.start.dateTime,
          end: event.end.dateTime
        }));
  
        temp[e.startStr] = formattedEvents;
      }
      setEvents(temp[e.startStr])
      setAllEventObj(temp);
    }
    catch (error:any) {
      alert(error?.message || 'Somthing went wrong');
    }
    finally {
      init()
      setShowLoading(false);
    }
  }

  function renderEventContent(eventInfo:any) {
    return(
      <>
        <b>{eventInfo.timeText}</b>
        <i>{eventInfo.event.title}</i>
      </>
    )
  }
  return (
    <IonPage>
      {
        account.length ? <IonText onClick={()=> msalInstance.logoutPopup()}>Logout</IonText> : <IonText onClick={()=> calendarEventChange({ ...calenderObj as any })}>Login</IonText>
      }
      <ComponentHeader title='Calender' righCornerItem={<IonIcon  className='rightIconButton' icon={refreshCircle} onClick={()=> calendarEventChange({ ...calenderObj as any })}></IonIcon>} ></ComponentHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            {
              showCalendar ?
                <FullCalendar events={events}  plugins={[ dayGridPlugin, interactionPlugin, timegridPlugin ]} initialView='dayGridMonth' datesSet={(e:any)=>calendarEventChange(e)}/>
                : ''
            }
          </IonRow>
        </IonGrid>
      </IonContent>
      <IonFooter>
        <IonList>
          {events.map((event:any, index: number) => (
            <IonItem key={event.id+ index}>
              <IonLabel>
                <h2>{event.title}</h2>
                <p>{new Date(event.start).toLocaleString()}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonFooter>
      <IonLoading isOpen={showLoading} message='Please wait'></IonLoading>

    </IonPage>
  );
};

export default HomePage;
