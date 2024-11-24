import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/global.scss";
/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";
import PageChatDetail from "./pages/PageChatDetail/PageChatDetail";
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./config/auth";
import HomePage from "./pages/Home/HomePage";
import NewChat from "./pages/PageChatDetail/NewChat2";
import { DatabaseProvider, NotificationContextProvider } from "./store/db";
import { useEffect } from "react";

export const msalInstance = new PublicClientApplication(msalConfig);
setupIonicReact();

const App: React.FC = () => {
  return (
    <MsalProvider instance={msalInstance}>
      <NotificationContextProvider>
        <DatabaseProvider>
          <IonApp>
            <IonReactRouter>
              <>
                <IonRouterOutlet>
                  {/* <Route exact path="/">
                <PageChatDetail></PageChatDetail>
              </Route> */}
                  <Route exact path="/">
                    <NewChat></NewChat>
                  </Route>
                  {/* <Route exact path="/home">
                <HomePage></HomePage>
              </Route> */}
                  {/* <Route exact path="/">
                <Redirect to="/home" />
              </Route> */}
                </IonRouterOutlet>
              </>
            </IonReactRouter>
          </IonApp>
        </DatabaseProvider>
      </NotificationContextProvider>
    </MsalProvider>
  );
};

export default App;
