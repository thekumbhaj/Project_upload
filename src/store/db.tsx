import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community/sqlite";
import {
  LocalNotifications,
  LocalNotificationSchema,
} from "@capacitor/local-notifications";

// Types
interface ReminderItem {
  id?: number;
  time: string;
  action: string;
  reminder: boolean;
}

interface DatabaseContextState {
  isLoading: boolean;
  error: Error | null;
  reminders: ReminderItem[];
  addReminder: (item: Omit<ReminderItem, "id">) => Promise<number | undefined>;
  updateReminder: (item: ReminderItem) => Promise<void>;
  deleteReminder: (id: number) => Promise<void>;
  refreshReminders: () => Promise<void>;
}
interface NotificationContextState {
  hasPermission: boolean;
  scheduleReminder: (
    title: string,
    body: string,
    scheduleTime: Date
  ) => Promise<boolean>;
}

interface DatabaseProviderProps {
  children: React.ReactNode;
}

// Create context with a default value
const DatabaseContext = createContext<DatabaseContextState | undefined>(
  undefined
);

// Custom error classes for better error handling
class DatabaseInitializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseInitializationError";
  }
}

class DatabaseOperationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseOperationError";
  }
}

// Database service class
class DatabaseService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private readonly dbName = "reminders.db";
  private isInitialized = false;

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Create database connection
      this.db = await this.sqlite.createConnection(
        this.dbName,
        false,
        "no-encryption",
        1,
        false
      );

      await this.db.open();

      // Create table if it doesn't exist
      const schema = `
        CREATE TABLE IF NOT EXISTS reminders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          time TEXT NOT NULL,
          action TEXT NOT NULL,
          reminder BOOLEAN NOT NULL CHECK (reminder IN (0, 1))
        );
      `;

      await this.db.execute(schema);
      this.isInitialized = true;
    } catch (error) {
      throw new DatabaseInitializationError(
        `Failed to initialize database: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async addReminder(item: Omit<ReminderItem, "id">) {
    try {
      const query = `
        INSERT INTO reminders (time, action, reminder)
        VALUES (?, ?, ?);
      `;
      const values = [item.time, item.action, item.reminder ? 1 : 0];
      const result = await this.db.run(query, values);
      return result.changes?.lastId;
    } catch (error) {
      throw new DatabaseOperationError(
        `Failed to add reminder: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getReminders(): Promise<ReminderItem[]> {
    try {
      const query = "SELECT * FROM reminders ORDER BY id DESC;";
      const result = await this.db.query(query);
      return (
        result.values?.map((row) => ({
          id: row.id,
          time: row.time,
          action: row.action,
          reminder: Boolean(row.reminder),
        })) || []
      );
    } catch (error) {
      throw new DatabaseOperationError(
        `Failed to get reminders: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async updateReminder(item: ReminderItem) {
    if (!item.id)
      throw new DatabaseOperationError("Reminder ID is required for update");

    try {
      const query = `
        UPDATE reminders
        SET time = ?, action = ?, reminder = ?
        WHERE id = ?;
      `;
      const values = [item.time, item.action, item.reminder ? 1 : 0, item.id];
      const result = await this.db.run(query, values);

      if (result.changes?.changes === 0) {
        throw new DatabaseOperationError("Reminder not found");
      }
    } catch (error) {
      if (error instanceof DatabaseOperationError) throw error;
      throw new DatabaseOperationError(
        `Failed to update reminder: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async deleteReminder(id: number) {
    try {
      const query = "DELETE FROM reminders WHERE id = ?;";
      const result = await this.db.run(query, [id]);

      if (result.changes?.changes === 0) {
        throw new DatabaseOperationError("Reminder not found");
      }
    } catch (error) {
      if (error instanceof DatabaseOperationError) throw error;
      throw new DatabaseOperationError(
        `Failed to delete reminder: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}

// Create singleton instance
const databaseService = new DatabaseService();

// Context Provider Component
export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);

  // Initialize database and load initial data
  useEffect(() => {
    const initDB = async () => {
      try {
        await databaseService.initialize();
        await refreshReminders();
      } catch (error) {
        setError(
          error instanceof Error
            ? error
            : new Error("Unknown error during initialization")
        );
      } finally {
        setIsLoading(false);
      }
    };

    initDB();
  }, []);

  // Refresh reminders list
  const refreshReminders = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await databaseService.getReminders();
      setReminders(data);
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error
          : new Error("Unknown error while fetching reminders")
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add reminder
  const addReminder = useCallback(
    async (item: Omit<ReminderItem, "id">) => {
      try {
        setIsLoading(true);
        const id = await databaseService.addReminder(item);
        await refreshReminders();
        return id;
      } catch (error) {
        setError(
          error instanceof Error
            ? error
            : new Error("Unknown error while adding reminder")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [refreshReminders]
  );

  // Update reminder
  const updateReminder = useCallback(
    async (item: ReminderItem) => {
      try {
        setIsLoading(true);
        await databaseService.updateReminder(item);
        await refreshReminders();
      } catch (error) {
        setError(
          error instanceof Error
            ? error
            : new Error("Unknown error while updating reminder")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [refreshReminders]
  );

  // Delete reminder
  const deleteReminder = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);
        await databaseService.deleteReminder(id);
        await refreshReminders();
      } catch (error) {
        setError(
          error instanceof Error
            ? error
            : new Error("Unknown error while deleting reminder")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [refreshReminders]
  );

  const value = {
    isLoading,
    error,
    reminders,
    addReminder,
    updateReminder,
    deleteReminder,
    refreshReminders,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
const NotificationContext = createContext<NotificationContextState | undefined>(
  undefined
);

export const NotificationContextProvider = ({ children }: any) => {
  const [hasPermission, setHasPermission] = useState(false);
  const requestNotificationPermissions = async () => {
    try {
      const { display } = await LocalNotifications.requestPermissions();
      // alert(display);
      return display === "granted";
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  };
  const checkPermissions = async () => {
    const permissionStatus = await requestNotificationPermissions();
    setHasPermission(permissionStatus);
  };
  useEffect(() => {
    checkPermissions();
  }, []);

  const scheduleReminder = async (
    title: string,
    body: string,
    scheduleTime: Date
  ): Promise<boolean> => {
    if (!hasPermission) {
      alert("Notification permissions not granted");
      return false;
    }

    try {
      const notificationOptions: any = {
        notifications: [
          {
            title,
            body,
            id: Number(String(Date.now()).slice(4)),
            schedule: { at: scheduleTime },
            sound: "default",
            attachments: undefined,
            actionTypeId: "",
            extra: null,
          },
        ],
      };

      await LocalNotifications.schedule(notificationOptions);
      return true;
    } catch (error: any) {
      alert("Error scheduling notification:" + error);
      return false;
    }
  };

  const cancelAllReminders = async (): Promise<void> => {
    try {
      const pendingNotifications = await LocalNotifications.getPending();
      if (pendingNotifications.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pendingNotifications.notifications,
        });
      }
    } catch (error) {
      console.error("Error canceling notifications:", error);
    }
  };

  const getPendingReminders = async (): Promise<LocalNotificationSchema[]> => {
    try {
      const { notifications } = await LocalNotifications.getPending();
      return notifications;
    } catch (error) {
      console.error("Error getting pending notifications:", error);
      return [];
    }
  };

  const value = { hasPermission, scheduleReminder };
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for using the database context
export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

// Export the database service for direct access if needed
export { databaseService };
