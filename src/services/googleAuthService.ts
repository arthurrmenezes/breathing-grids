// Google Auth Service for Google Identity Services

import { api } from './api';

// Google Sign-In Response from backend
export interface GoogleSignInResponse {
  accountId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
  createdAt: string | null;
}

// Google Client ID - ADD YOUR CLIENT ID HERE
// This is a PUBLIC key (safe to include in frontend code)
// Get it from: https://console.cloud.google.com/apis/credentials
export const GOOGLE_CLIENT_ID = ''; // TODO: Add your Google Client ID here

// Initialize Google Identity Services
let googleInitialized = false;
let googleInitPromise: Promise<void> | null = null;

export const initializeGoogleAuth = (): Promise<void> => {
  if (googleInitPromise) {
    return googleInitPromise;
  }

  googleInitPromise = new Promise((resolve, reject) => {
    if (googleInitialized) {
      resolve();
      return;
    }

    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('Login com Google não está disponível no momento. Tente novamente mais tarde.'));
      return;
    }

    // Check if script already exists
    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      if ((window as any).google?.accounts) {
        googleInitialized = true;
        resolve();
      } else {
        existingScript.addEventListener('load', () => {
          googleInitialized = true;
          resolve();
        });
      }
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      googleInitialized = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error('Failed to load Google Identity Services'));
    };

    document.head.appendChild(script);
  });

  return googleInitPromise;
};

export const exchangeGoogleCredential = async (
  credential: string,
): Promise<{ success: boolean; data?: GoogleSignInResponse; error?: string }> => {
  try {
    const apiResponse = await api.post<GoogleSignInResponse>('/auth/signin-google', {
      GoogleToken: credential,
    });

    if (apiResponse.error) {
      return { success: false, error: apiResponse.error };
    }

    if (apiResponse.data) {
      return { success: true, data: apiResponse.data };
    }

    return { success: false, error: 'Erro ao autenticar com Google' };
  } catch {
    return { success: false, error: 'Erro ao processar autenticação Google' };
  }
};

export const signInWithGoogle = async (): Promise<{ success: boolean; data?: GoogleSignInResponse; error?: string }> => {
  try {
    await initializeGoogleAuth();

    if (!GOOGLE_CLIENT_ID) {
      return { success: false, error: 'Login com Google não está disponível no momento' };
    }

    return new Promise((resolve) => {
      const google = (window as any).google;
      
      if (!google?.accounts?.id) {
        resolve({ success: false, error: 'Google Identity Services não carregado' });
        return;
      }

      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          if (!response.credential) {
            resolve({ success: false, error: 'Erro ao obter credencial do Google' });
            return;
          }

          const exchangeResult = await exchangeGoogleCredential(response.credential);
          resolve(exchangeResult);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Trigger the One Tap prompt (if unavailable, return a helpful error)
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
          resolve({
            success: false,
            error:
              'O Google não exibiu o prompt. Verifique bloqueador de popups/terceiros e as "Authorized JavaScript origins" no Google Cloud (inclua http://localhost e http://localhost:5173).',
          });
        }
      });
    });
  } catch (error) {
    return { success: false, error: 'Erro ao inicializar autenticação Google' };
  }
};

export const googleAuthService = {
  initialize: initializeGoogleAuth,
  signIn: signInWithGoogle,
  exchangeCredential: exchangeGoogleCredential,
};
