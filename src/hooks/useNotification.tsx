import {
  LocalNotifications,
  LocalNotificationSchema,
  ScheduleOptions,
} from "@capacitor/local-notifications";
import { useEffect, useState } from "react";

// Notification permissions helper
const requestNotificationPermissions = async () => {
  try {
    const { display } = await LocalNotifications.requestPermissions();
    return display === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
};

// Custom hook for managing notifications
// export const useNotifications = () => {
//   const [hasPermission, setHasPermission] = useState(false);
//   useEffect(() => {
//     const checkPermissions = async () => {
//       const permissionStatus = await requestNotificationPermissions();
//       setHasPermission(permissionStatus);
//     };
//     checkPermissions();
//   }, []);

//   const scheduleReminder = async (
//     title: string,
//     body: string,
//     scheduleTime: Date
//   ): Promise<boolean> => {
//     if (!hasPermission) {
//       alert("Notification permissions not granted");
//       return false;
//     }

//     try {
//       const notificationOptions: ScheduleOptions = {
//         notifications: [
//           {
//             title,
//             body,
//             id: Number(String(Date.now()).slice(4)),
//             schedule: { at: scheduleTime },
//             sound: "default",
//             attachments: undefined,
//             actionTypeId: "",
//             extra: null,
//           },
//         ],
//       };

//       await LocalNotifications.schedule(notificationOptions);
//       return true;
//     } catch (error:any) {
//       alert("Error scheduling notification:"+ error);
//       return false;
//     }
//   };

//   const cancelAllReminders = async (): Promise<void> => {
//     try {
//       const pendingNotifications = await LocalNotifications.getPending();
//       if (pendingNotifications.notifications.length > 0) {
//         await LocalNotifications.cancel({
//           notifications: pendingNotifications.notifications,
//         });
//       }
//     } catch (error) {
//       console.error("Error canceling notifications:", error);
//     }
//   };

//   const getPendingReminders = async (): Promise<LocalNotificationSchema[]> => {
//     try {
//       const { notifications } = await LocalNotifications.getPending();
//       return notifications;
//     } catch (error) {
//       console.error("Error getting pending notifications:", error);
//       return [];
//     }
//   };

//   return {
//     hasPermission,
//     scheduleReminder,
//     cancelAllReminders,
//     getPendingReminders,
//   };
// };
