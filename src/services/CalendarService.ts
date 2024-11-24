import { InteractionRequiredAuthError, PublicClientApplication } from "@azure/msal-browser";
import { loginRequest, msalConfig } from "../config/auth";
import { isPlatform } from "@ionic/react";
import { Browser } from "@capacitor/browser";

export const msalInstance = new PublicClientApplication(msalConfig);

export const getAccessToken = async () => {
  // return obj.access_token
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0]
    });
    return response.accessToken;
  } else {
    const response = await msalInstance.loginPopup({
      scopes: loginRequest.scopes
    });
    if(isPlatform('capacitor')) {
      const url = msalInstance.acquireTokenByCode(loginRequest);
      console.log(url);
    }
    return response.accessToken;
  }
};

export const silentUpdateToken = async() => {
  const request = {
    scopes: loginRequest.scopes,
    account: msalInstance.getAllAccounts()[0],
    forceRefresh: true,
    refreshTokenExpirationOffsetSeconds: 7200 // 2 hours * 60 minutes * 60 seconds = 7200 seconds
  };

  const tokenResponse = await msalInstance.acquireTokenSilent(request).catch(async (error) => {
      if (error instanceof InteractionRequiredAuthError) {
          // fallback to interaction when silent call fails
          await msalInstance.acquireTokenRedirect(request);
      }
  });

}

export const getMsalEvents = async () => {
  const token = await getAccessToken();
  const response = await fetch("https://graph.microsoft.com/v1.0/me/calendars", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.value;
};

export const getDateEvents = async (startDate:any, endDate:any) => {
  try {
    const token = await getAccessToken();
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarview?startDateTime=${startDate}&endDateTime=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    const data = await response.json();
    return data.value;
  }
  catch (error) {
    return error;
  }
  };
