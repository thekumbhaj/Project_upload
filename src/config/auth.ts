import { isPlatform } from "@ionic/react";

export const TENANT_ID = '15efd09e-6f2e-44ba-9059-241e34d3a6d2';
export const CLIENT_ID = 'dcebcbc1-5652-41b9-83b3-383ff6717e9f';

export const msalConfig = {
    auth: {
      clientId: CLIENT_ID,
      authority: `https://login.microsoftonline.com/${TENANT_ID}`,
      redirectUri: isPlatform('capacitor') ? 'enp://home' : window.location.origin,
    }
  };
  
  export const loginRequest = {
    scopes: ["User.Read", "MailboxSettings.Read", "Calendars.Read", "Calendars.ReadWrite", "openid", "profile"]
  };
  