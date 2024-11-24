import React, { useEffect, useMemo, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonToggle,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonInput,
  IonDatetime,
  IonButtons,
  IonCard,
  IonCardContent,
  useIonToast,
} from "@ionic/react";
import {
  add,
  notificationsOutline,
  trashOutline,
  timeOutline,
  createOutline,
} from "ionicons/icons";
import { useDatabase, useNotifications } from "../store/db";

function formatDateTime(date: any) {
  const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
  };

  const formattedDateTime = date.toLocaleString('en-US', options);
  const [datePart, timePart] = formattedDateTime.split(", ");
  return `${datePart.replace(/\//g, "/")} - ${timePart}`;
}

const ReminderCard = ({ reminder, handleDelete }: any) => {
  const date = useMemo(()=>{
    try{
      const date = new Date(reminder?.time);
      return formatDateTime(date)
    }catch(err){
      return ""
    }
  },[reminder?.time])
  return (
    <IonCard
      style={{ background: "#fff", borderRadius: 15 }}
      className="m-0 bg-white"
    >
      <IonCardContent className="">
        <div className="flex items-start justify-between">
          <div
            className="flex-1"
            style={{
              display: "flex",
              justifyContent: "space-between",
              // alignItems: "flex-start",
            }}
          >
            <h2
              className="text-lg font-medium mb-2"
              style={{ color: "#000", fontWeight: "500",  }}
            >
              {reminder.action}
            </h2>
          </div>
          <div
            className="flex items-center gap-2"
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div
              className="flex items-center text-gray-500"
              style={{ alignItems: "center", display: "flex", gap: 2 }}
            >
              <IonIcon icon={timeOutline} className="mr-2" />
              <span style={{fontSize:12}}>{date}</span>
            </div>
            {/* <div
              className="flex items-center gap-2"
              style={{ alignItems: "center", display: "flex", gap: 4 }}
            >
              <IonToggle
                checked={reminder.reminder}
                onIonChange={async () => {}}
              />
            </div> */}
            
          </div>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

const RemindersScreen = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<any>(null);
  const [newReminder, setNewReminder] = useState({
    time: "",
    action: "",
    reminder: true,
  });
  const [presentToast] = useIonToast();

  const {
    reminders,
    isLoading,
    error,
    addReminder,
    updateReminder,
    deleteReminder,
  } = useDatabase();

  const showToast = (message: string) => {
    presentToast({
      message,
      duration: 2000,
      position: "bottom",
      color: "dark",
    });
  };

  const handleDelete = async (id: any) => {
    try {
      await deleteReminder(id);
      showToast("Reminder deleted");
      //   loadReminders();
    } catch (error) {
      showToast("Error deleting reminder");
    }
  };

  const openEditModal = (reminder: any) => {
    setEditingReminder(reminder);
    setNewReminder({
      time: reminder.time,
      action: reminder.action,
      reminder: reminder.reminder,
    });
    setIsModalOpen(true);
  };

  return (
    <IonContent className="ion-padding">
      {reminders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <IonIcon
            icon={notificationsOutline}
            className="w-16 h-16 text-gray-400 mb-4"
          />
          <h2 className="text-xl font-medium text-gray-600 mb-2" style={{color:"rgb(75,85,99)"}}>
            No reminders yet
          </h2>
          <p className="text-gray-500" style={{color:"#000"}}>
            Add your first reminder by clicking the + button below
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reminders.map((reminder: any) => (
            <ReminderCard
              reminder={reminder}
              key={reminder.id}
              handleDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </IonContent>
  );
};

export default RemindersScreen;
