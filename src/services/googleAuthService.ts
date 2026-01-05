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

// Google Client ID - will be fetched from backend or configured
let GOOGLE_CLIENT_ID = '';

// Initialize Google Identity Services
let googleInitialized = false;
let googleInitPromise: Promise<void> | null = null;

// Fetch Google Client ID from backend config endpoint
const fetchGoogleClientId = async (): Promise<string> => {
  try {
    const response = await api.get<{ googleClientId: string }>('/auth/config');
    if (response.data?.googleClientId) {
      return response.data.googleClientId;
    }
  } catch (error) {
    console.warn('Could not fetch Google Client ID from backend');
  }
  return '';
};

export const initializeGoogleAuth = async (): Promise<void> => {
  if (googleInitPromise) {
    return googleInitPromise;
  }

  googleInitPromise = new Promise(async (resolve, reject) => {
    if (googleInitialized) {
      resolve();
      return;
    }

    // Fetch client ID if not already set
    if (!GOOGLE_CLIENT_ID) {
      GOOGLE_CLIENT_ID = await fetchGoogleClientId();
    }

    if (!GOOGLE_CLIENT_ID) {
      reject(new Error('Google Client ID não disponível'));
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

export const signInWithGoogle = async (): Promise<{ success: boolean; data?: GoogleSignInResponse; error?: string }> => {
  try {
    await initializeGoogleAuth();

    if (!GOOGLE_CLIENT_ID) {
      return { success: false, error: 'Google Client ID não configurado' };
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

          try {
            // Send ID token to backend
            const apiResponse = await api.post<GoogleSignInResponse>('/auth/signin-google', {
              GoogleToken: response.credential,
            });

            if (apiResponse.error) {
              resolve({ success: false, error: apiResponse.error });
              return;
            }

            if (apiResponse.data) {
              resolve({ success: true, data: apiResponse.data });
            } else {
              resolve({ success: false, error: 'Erro ao autenticar com Google' });
            }
          } catch (error) {
            resolve({ success: false, error: 'Erro ao processar autenticação Google' });
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Trigger the One Tap prompt
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // Fallback to button click if One Tap is not available
          const buttonDiv = document.createElement('div');
          buttonDiv.style.display = 'none';
          document.body.appendChild(buttonDiv);

          google.accounts.id.renderButton(buttonDiv, {
            type: 'standard',
            size: 'large',
          });

          // Programmatically click the rendered button
          const button = buttonDiv.querySelector('div[role="button"]');
          if (button) {
            (button as HTMLElement).click();
          }

          // Clean up after a delay
          setTimeout(() => {
            if (buttonDiv.parentNode) {
              document.body.removeChild(buttonDiv);
            }
          }, 100);
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
};
