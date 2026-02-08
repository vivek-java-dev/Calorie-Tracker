import { API_ENDPOINTS } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@auth_token';

type GoogleAuthResponse = {
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
};

export async function loginWithGoogle(idToken: string): Promise<GoogleAuthResponse> {
  console.log('calling api endpoint:', API_ENDPOINTS.GOOGLE_AUTH);
  
  try {
    const res = await fetch(`${API_ENDPOINTS.GOOGLE_AUTH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const text = await res.text();
      console.error('Error response:', text);
      throw new Error(text || `Google login failed (${res.status})`);
    }

    const data = await res.json();
    
    await saveToken(data.token);

    
    return data;
  } catch (error) {
    console.error('Full error object:', error);
    throw error;
  }
}

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}


export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
